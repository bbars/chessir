import SqlModel from './SqlModel.js';

export class Game extends SqlModel {
	static getDefinition() {
		return {
			name: 'game',
			primaryKey: ['gameId'],
			columns: {
				gameId: 'integer',
				pgn: 'text not null',
			},
		};
	}
}

export class GameExt extends SqlModel {
	static getDefinition() {
		return {
			name: 'gameExt',
			primaryKey: ['gameId'],
			columns: {
				gameId: 'integer not null',
				eco: 'varchar(1024)',
				initialState: 'varchar(1024)',
				lastFin: 'varchar(1024)',
				halfmoves: 'integer',
				enPassantsW: 'integer',
				enPassantsB: 'integer',
				castlingW: 'integer',
				castlingB: 'integer',
				mutationsW: 'integer',
				mutationsB: 'integer',
				checksW: 'integer',
				checksB: 'integer',
				capturesW: 'integer',
				capturesB: 'integer',
				firstCastlingW: 'integer',
				firstCastlingB: 'integer',
				firstMutationW: 'integer',
				firstMutationB: 'integer',
				firstCheckW: 'integer',
				firstCheckB: 'integer',
				firstCaptureW: 'integer',
				firstCaptureB: 'integer',
			},
			uniqueKeys: {
				gameId: ['gameId'],
			},
		};
	}
}

export class GameMeta extends SqlModel {
	static getDefinition() {
		return {
			name: 'gameMeta',
			primaryKey: ['gameId', 'name'],
			columns: {
				gameId: 'integer not null',
				name: 'varchar(64) not null',
				value: 'varchar(1024) not null',
			},
			indexes: {
				// gameId: ['gameId'],
			},
			uniqueKeys: {
				gameIdName: ['gameId', 'name'],
			},
		};
	}
}

export class Move extends SqlModel {
	static getDefinition() {
		return {
			name: 'move',
			primaryKey: ['moveId'],
			columns: {
				moveId: 'integer',
				gameId: 'integer not null',
				preStateId: 'integer not null',
				postStateId: 'integer not null',
				fullmoveNumber: 'integer not null',
				prevMoveId: 'integer null default null',
				abbr: 'varchar(16) not null',
			},
			indexes: {
				gameId: ['gameId'],
			},
			uniqueKeys: {
			},
		};
	}
}

export class State extends SqlModel {
	static getDefinition() {
		return {
			name: 'state',
			primaryKey: ['stateId'],
			columns: {
				stateId: 'integer not null',
				sfen: 'varchar(128) not null',
				am: 'varchar(128) not null',
			},
			indexes: {
				am: ['am'],
			},
			uniqueKeys: {
				sfen: ['sfen'],
			},
		};
	}
}
