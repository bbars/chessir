#!/usr/bin/env node
import ProcessArgs from './ProcessArgs.js';
import Game from '../src/Game.js';

import * as http from 'http';
import * as socketio from 'socket.io';
import httpServeDirectory from './httpServeDirectory.js';

const ARGV = new ProcessArgs(process.argv);
const CONFIG = ARGV.fillTree({
	http: {
		staticDir: '..',
		bind: '127.0.0.1',
		port: 80,
	},
});
console.warn('CONFIG', CONFIG);




const httpServer = http.createServer(async function (req, res) {
	try {
		await httpServeDirectory(CONFIG.http.staticDir, req, res);
	}
	catch (err) {
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

demoGame: {
	const game = await Game.parsePgn(`
		[Id "usTjsDUxqP1cYBO3"]
		[White "Q7v49GHt"]
		[Black "aqYXzmqh"]
		1. Pe2e4 Pb7b6 2. Bf1b5 Bc8b7 3. Qd1e2 Pe7e5 4. Qe2h5 Pg7g6 5. Qh5f3 Ng8f6 6. Ng1e2 Bb7xPe4 7. Qf3c3 Bf8c5 8. O-O Be4xPg2 9. Kg1xBg2 Nf6e4 10. Qc3xPe5+ Qd8e7 11. Qe5xQe7+ Bc5xQe7 12. Ne2g3 Ne4g5 13. Kg2g1 O-O
	`);
	await game.seekToEnd();
	GAMES[game.meta.Id] = game;
}

const sio = new socketio.Server(httpServer);
sio.on('connection', (socket) => {
	const token = socket.handshake.query.token;
	const userId = token.slice(0, 8);
	
	socket.on('joinGame', (gameId, response) => {
		let game = GAMES[gameId];
		if (!game) {
			game = new Game();
			game.meta.Id = gameId;
			GAMES[gameId] = game;
		}
		socket.join('game-' + gameId);
		if (!game.meta.White) {
			game.meta.White = userId;
		}
		else if (!game.meta.Black) {
			game.meta.Black = userId;
		}
		return response(null, game.toPgn());
	});
	
	socket.on('applyMove', (gameId, moveAbbr, response) => {
		let game = GAMES[gameId];
		if (!game) {
			return response(`Game not found`, null);
		}
		try {
			const move = game.applyMove(moveAbbr);
			socket.in('game-' + gameId).emit('applyMove', gameId, move.toString());
			return response(null, move.toString())
		}
		catch (err) {
			response(err.message || err.toString());
		}
	})
});

console.log("Listen", CONFIG.http.bind, CONFIG.http.port);
httpServer.listen(CONFIG.http.port, CONFIG.http.bind);
