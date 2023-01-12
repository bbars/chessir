import Game from '../src/Game.js';

const pgn = `[Event "SWE-ch"]
[Site "Gothenburg"]
[Date "1990.??.??"]
[Round "?"]
[White "Holst, Conny"]
[Black "Furhoff, Johan"]
[Result "0-1"]
[WhiteElo "2285"]
[BlackElo ""]
[ECO "E37"]
1. d2d4 Ng8f6 2. c2c4 Nb8c6 3. Ng1f3 e7e6 4. Nb1c3 Bf8b4 5. Qd1c2 d7d5
6. a2a3 Bb4xc3+ 7. Qc2xc3 Nf6e4 8. Qc3c2 e6e5 9. d4xe5 Bc8f5
10. Qc2a4 O-O 11. Bc1f4 d5d4 12. Ra1d1 f7f6 13. e5xf6 Qd8xf6
14. Qa4b5 Ra8e8 15. e2e3 g7g5 16. Bf4xc7 d4xe3 17. f2xe3 g5g4
18. Nf3d4 Bf5d7 19. Bc7f4 Nc6xd4 20. Qb5xd7 Nd4c2+
21. Ke1e2 Qf6xb2 22. Qd7xg4+ Kg8h8 23. Ke2f3 Nc2e1+
{ 24. Rd1xe1 Qb2f2# 0-1 }
`;

const eventHub = [];
const knownEvents = {
	'changeMeta': {
		props: ['game', 'meta', 'name', 'newValue', 'oldValue'],
	},
	'addMove': {
		props: ['game', 'pos', 'prevPos', 'prevMove', 'move'],
	},
	'changePos': {
		props: ['game', 'pos', 'prevPos'],
	},
	'addMoveComment': {
		props: ['game', 'pos', 'path', 'move', 'comment'],
	},
	'undoMove': {
		props: ['game', 'pos', 'oldPos', 'oldMove', 'move'],
	},
};

let lastCheckedIndex = -1;
function checkLastEvents(...events) {
	const lastCheckedIndexSaved = lastCheckedIndex;
	let index = eventHub.length - 1;
	lastCheckedIndex = index;
	for (const expectedEvent of events) {
		for (index; index > lastCheckedIndexSaved; index--) {
			const gotEvent = eventHub[index];
			if (gotEvent.name === expectedEvent.name) {
				for (const k in expectedEvent.detail) {
					console.assert(
						expectedEvent.detail[k] === gotEvent.detail[k],
						`Wrong event detail: event(${gotEvent.name}).detail.${k};`,
						'expected', expectedEvent.detail[k],
						'got', gotEvent.detail[k],
					);
				}
				break;
			}
		}
	}
}

let game;
it('Game: parse PGN', async () => {
	game = await Game.parsePgn(pgn);
	for (const eventName in knownEvents) {
		game.events.addEventListener(eventName, (event) => {
			eventHub.push(event);
		});
	}
});

it('Game: seek end', async () => {
	await game.seekEnd();
});

it('Game: do moves', async () => {
	let move;
	
	move = (await game.addMove('Rxe1')).move; // Rd1xe1
	console.assert(move.piece.name === 'R');
	console.assert(move.src.txt === 'd1');
	console.assert(move.dst.txt === 'e1');
	
	move = (await game.addMove('b2f2')).move; // Qb2f2
	console.assert(move.piece.name === 'Q');
	console.assert(move.src.txt === 'b2');
	console.assert(move.dst.txt === 'f2');
});
