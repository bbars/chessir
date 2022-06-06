#!/usr/bin/env node

import fsPromises from 'fs/promises';
import * as chessir from 'chessir';

import DB from './src/DB.js';
import * as models from './src/models.js';


const db = new DB({
	filename: './game.db',
	journalMode: 'PERSIST',
});
await db.init(Object.values(models));


let exitCode = 0;
for (const filePath of process.argv.slice(2)) {
	try {
		console.warn(filePath);
		const pgn = await fsPromises.readFile(filePath, { encoding: 'utf8' });
		for await (const [err, game] of chessir.Game.parsePgnMulti(pgn, Infinity)) {
			if (err || !game) {
				console.error('ERR', err);
				continue;
			}
			
			const gameId = await writeGame(game);
			console.log(gameId);
			await writeGameExt(gameId, game);
			await writeGameMeta(gameId, game);
		}
		console.warn('OK');
	}
	catch (err) {
		console.error('ERR', err);
		exitCode = 1;
	}
}
process.exit(exitCode);


async function writeGame(game) {
	const pgn = game.toPgn();
	let res = await db.queryOne(`
		select gameId from game where pgn = ?
	`, [pgn]);
	if (res && res.gameId) {
		return res.gameId;
	}
	res = await db.run(...models.Game.getUpsertSQL([{
		pgn,
	}]));
	return res.lastID;
}

async function writeGameExt(gameId, game) {
	const gameExt = {
		gameId,
		eco: null,
		halfmoves: game.history.length,
		enPassantsW: null,
		enPassantsB: null,
		castlingW: null,
		castlingB: null,
		mutationsW: null,
		mutationsB: null,
		checksW: null,
		checksB: null,
		capturesW: null,
		capturesB: null,
		firstCastlingW: null,
		firstCastlingB: null,
		firstMutationW: null,
		firstMutationB: null,
		firstCheckW: null,
		firstCheckB: null,
		firstCaptureW: null,
		firstCaptureB: null,
	};
	gameExt.eco = game.meta.ECO || null;
	
	for (let i = 0; i < game.history.length; i++) {
		const move = game.history[i];
		if (move.enPassant) {
			if (move.piece.isWhite) {
				gameExt.enPassantsW++;
			}
			else {
				gameExt.enPassantsB++;
			}
		}
		if (move instanceof chessir.MoveCastling) {
			if (move.piece.isWhite) {
				gameExt.castlingW++;
				gameExt.firstCastlingW = gameExt.firstCastlingW || i;
			}
			else {
				gameExt.castlingB++;
				gameExt.firstCastlingB = gameExt.firstCastlingB || i;
			}
		}
		if (move.mut) {
			if (move.piece.isWhite) {
				gameExt.mutationsW++;
				gameExt.firstMutationW = gameExt.firstMutationW || i;
			}
			else {
				gameExt.mutationsB++;
				gameExt.firstMutationB = gameExt.firstMutationB || i;
			}
		}
		if (move.fin == '+') {
			if (move.piece.isWhite) {
				gameExt.checksW++;
				gameExt.firstCheckW = gameExt.firstCheckW || i;
			}
			else {
				gameExt.checksB++;
				gameExt.firstCheckB = gameExt.firstCheckB || i;
			}
		}
		if (move instanceof chessir.MoveCapture) {
			if (move.piece.isWhite) {
				gameExt.capturesW++;
				gameExt.firstCaptureW = gameExt.firstCaptureW || i;
			}
			else {
				gameExt.capturesB++;
				gameExt.firstCaptureB = gameExt.firstCaptureB || i;
			}
		}
	}
	
	const lastMove = game.history[game.history.length - 1];
	gameExt.lastFin = !lastMove ? '' : lastMove.fin;
	await db.run(...models.GameExt.getUpsertSQL([gameExt]));
	
	return gameExt;
}

async function writeGameMeta(gameId, game) {
	const metas = [];
	for (const k in game.meta) {
		const lc = k.toLowerCase();
		metas.push({
			gameId,
			name: lc,
			value: game.meta[k],
		});
	}
	if (metas.length) {
		await db.run(...models.GameMeta.getUpsertSQL(metas));
	}
	return metas;
}
