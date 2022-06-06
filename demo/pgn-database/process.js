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


const sqlWhere = process.argv[2] || '0';
let sql = `
	select *
	from game
	where ${sqlWhere}
`;

let exitCode = 0;
for await (const { gameId, pgn } of db.queryEach(sql, [], models.Game)) {
	try {
		console.log(gameId);
		const game = await chessir.Game.parsePgn(pgn);
		await db.run(`delete from move where gameId = ?`, [gameId]);
		await writeMoves(gameId, game.history);
		console.warn('OK');
	}
	catch (err) {
		console.error('ERR', err);
		exitCode = 1;
	}
}
process.exit(exitCode);


async function writeState(fen) {
	const sfen = fen.replace(/\s+\d+$/, '');
	let res = await db.queryOne(`
		SELECT stateId
		from state
		where sfen = ?
	`, [sfen]);
	if (res) {
		return res.stateId;
	}
	res = await db.run(...models.State.getUpsertSQL([{
		sfen,
		am: chessir.State.fromFen(fen).getAttackMap().join(''),
	}]));
	return res.lastID;
}

async function writeMoves(gameId, history, prevRecMove, preStateId) {
	for (const move of history) {
		if (!preStateId) {
			preStateId = prevRecMove && prevRecMove.postStateId || await writeState(move.preFen);
		}
		const recMove = new models.Move({
			gameId,
			preStateId,
			postStateId: await writeState(move.postFen),
			fullmoveNumber: move.preFen.replace(/^.*?\s+(\d+)$/, '$1'),
			prevMoveId: !prevRecMove ? null : prevRecMove.moveId,
			abbr: move.toShortString(),
		});
		const temp = await db.run(...models.Move.getUpsertSQL([recMove]));
		recMove.moveId = temp.lastID;
		prevRecMove = recMove;
		preStateId = prevRecMove.postStateId;
	}
}
