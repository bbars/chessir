#!/usr/bin/env node

const __dirname = process.argv[1].replace(/[\\\/]?[^\\\/]+$/, '');

import { Game } from 'chessir';
import * as http from 'http';
import * as socketio from 'socket.io';
import DirectoryServer from './DirectoryServer.js';

const CONFIG = {
	listen: {
		hostname: '127.0.0.1',
		port: 80,
	},
};
if (process.argv[2]) {
	const url = new URL('tcp://' + 'dummy' + process.argv[2]);
	CONFIG.listen.hostname = url.hostname.slice(5) || CONFIG.listen.hostname; // remove "dummy"
	CONFIG.listen.port = url.port && +url.port || CONFIG.listen.port;
}
console.warn('CONFIG', CONFIG);


// serve static files in ./public:
const directoryServerPublic = new DirectoryServer({
	pathname: '/',
	dir: __dirname + '/public',
});

// serve chessir files:
const directoryServerChessir = new DirectoryServer({
	pathname: '/chessir',
	dir: __dirname + '/node_modules/chessir',
});

const httpServer = http.createServer(async function (req, res) {
	try {
		await directoryServerPublic(req, res, async () => {
			return await directoryServerChessir(req, res);
		});
	}
	catch (err) {
		console.warn(err);
		if (err.code === 'ENOENT') {
			res.writeHead(404, { 'Content-Type': 'application/json' });
		}
		else {
			res.writeHead(400, { 'Content-Type': 'application/json' });
		}
		let errStr = JSON.stringify(err);
		errStr = !errStr || errStr === '{}' ? err + '' : JSON.parse(errStr);
		res.end(JSON.stringify({
			err: errStr,
		}));
		return;
	}
});

const GAMES = {};

const sio = new socketio.Server(httpServer);
sio.on('connection', (socket) => {
	try {
		const token = (socket.handshake.query.token || '').trim();
		const userName = (socket.handshake.query.userName || '').trim().slice(0, 64);
		const userId = token.slice(0, 8); // TODO: not safe (DEMO)
		const playerId = `${userName} #${userId}`;
		
		if (token.length < 16 || token.length > 128) {
			throw new Error(`Invalid token`);
		}
		if (!userName) {
			throw new Error(`Invalid username`);
		}
		
		const checkPlayerId = (playerId, userId) => {
			const userId2 = String(playerId || '').slice(-(1 + userId.length));
			return userId === userId2;
		};
		
		const playGame = (game, isWhite) => {
			if (isWhite === null) {
				if (!game.meta.White) {
					isWhite = true;
				}
				else if (!game.meta.Black) {
					isWhite = false;
				}
				else {
					return false;
				}
			}
			isWhite = !!isWhite;
			if (isWhite) {
				if (checkPlayerId(game.meta.White, playerId)) {
					return true;
				}
				if (game.meta.White) {
					return false;
				}
				game.meta.White = playerId;
				if (checkPlayerId(game.meta.Black, playerId)) {
					game.meta.Black = null;
				}
			}
			else {
				if (checkPlayerId(game.meta.Black, playerId)) {
					return true;
				}
				if (game.meta.Black) {
					return false;
				}
				game.meta.Black = playerId;
				if (checkPlayerId(game.meta.White, playerId)) {
					game.meta.White = null;
				}
			}
			socket.in('game-' + game.meta.Id).emit('changeMeta', game.meta.Id, game.meta);
			return true;
		};
		
		socket.on('joinGame', (gameId, response) => {
			let game = GAMES[gameId];
			if (!game) {
				game = new Game();
				game.meta.Id = gameId;
				GAMES[gameId] = game;
				playGame(game, true);
			}
			socket.join('game-' + gameId);
			socket.in('game-' + gameId).emit('joined', gameId, playerId);
			return response(null, game.toPgn());
		});
		
		socket.on('playGame', (gameId, isWhite, response) => {
			let game = GAMES[gameId];
			if (!game) {
				response(`Game not found`, null);
			}
			socket.join('game-' + gameId);
			return response(null, playGame(game, isWhite));
		});
		
		socket.on('applyMove', async (gameId, moveAbbr, curPos, response) => {
			let game = GAMES[gameId];
			if (!game) {
				return response(`Game not found`, null);
			}
			try {
				await game.setPos(curPos);
				if (game.isMainLast) {
					const ok = false
						|| (game.activeWhite && checkPlayerId(game.meta.White, playerId))
						|| (!game.activeWhite && checkPlayerId(game.meta.Black, playerId))
					;
					if (!ok) {
						return response(`Wrong turn`, null);
					}
				}
				const move = game.applyMove(moveAbbr);
				socket.in('game-' + gameId).emit('applyMove', gameId, move.toString(), curPos);
				return response(null, move.toString())
			}
			catch (err) {
				response(err.message || err.toString());
			}
		});
	}
	catch (err) {
		socket.emit('error', (err && err.message || err || '?').toString());
		socket.close();
	}
});

console.warn(`Start HTTP server ${CONFIG.listen.hostname}:${CONFIG.listen.port}`);
httpServer.listen(CONFIG.listen.port, CONFIG.listen.hostname);
