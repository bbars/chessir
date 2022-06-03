import State from './State.js';
import Coord from './Coord.js';
import MoveBase from './MoveBase.js';
import Move from './Move.js';
import MoveCapture from './MoveCapture.js';
import MoveCastling from './MoveCastling.js';
import MoveAbbr from './MoveAbbr.js';
import * as pieces from './pieces/index.js';
import Comment from './Comment.js';
import History from './History.js';
import PgnTokenizer from './PgnTokenizer.js';
import tokenizerflow from './tokenizerflow.js';
import { EventTarget, CustomEvent } from './events.js';

function dispatchEvent(target, eventType, detail) {
	target.dispatchEvent(new CustomEvent(eventType, {
		detail: detail,
		bubbles: true,
	}));
}

export default class Game {
	state;
	history;
	_pos = [-1];
	meta = {};
	events;

	constructor(initialState, meta) {
		this.state = initialState || State.createInitial();
		this.history = History.create(this.state.clone());
		this._pos = [-1];
		this.meta = Object.assign(this.meta, meta);
		this.events = new EventTarget();
	}

	toString() {
		return this.toPgn();
	}

	applyMove(move) {
		const oldMove = this.history.getMove(this.pos);
		move = this.state.applyMove(move);
		const nextPos = this.history.addNextMove(this._pos, move);
		const oldPos = this.pos;
		this._pos = nextPos;
		dispatchEvent(this.events, 'applyMove', {
			game: this,
			pos: this.pos,
			oldPos: oldPos,
			oldMove: oldMove,
			move: move,
		});
		dispatchEvent(this.events, 'changePos', {
			game: this,
			pos: this.pos,
			oldPos: oldPos,
		});
		return move;
	}

	undoMove() {
		const curMove = this.history.getMove(this._pos);
		if (!curMove) {
			return null;
		}
		const prevPos = this.history.findPrevMovePath(this._pos);
		let prevMove = null;
		if (prevPos.length === 1 && prevPos[0] < 0) {
			this.state._setValues(State.fromFen(curMove.preFen));
			prevPos[0] = -1;
		}
		else {
			prevMove = this.history.getMove(prevPos);
			this.state._setValues(State.fromFen(prevMove.postFen));
		}
		const oldPos = this.pos;
		this._pos = prevPos;
		dispatchEvent(this.events, 'undoMove', {
			game: this,
			pos: this.pos,
			oldPos: oldPos,
			oldMove: curMove,
			move: prevMove,
		});
		dispatchEvent(this.events, 'changePos', {
			game: this,
			pos: this.pos,
			oldPos: oldPos,
		});
		return prevMove;
	}

	get pos() {
		return [].concat(this._pos);
	}

	async setPos(pos) {
		pos = [].concat(pos);
		let move;
		if (pos.length === 1 && pos[0] < 0) {
			pos[0] = -1;
			this.state._setValues(this.history.initialState || State.createInitial());
		}
		else {
			move = await this.history.getMoveParsed(pos);
			if (!move) {
				throw new Error(`Invalid historical position`);
			}
			this.state._setValues(State.fromFen(move.postFen));
		}
		const oldPos = this.pos;
		this._pos = pos;
		dispatchEvent(this.events, 'changePos', {
			game: this,
			pos: this.pos,
			prevPos: oldPos,
		});
		return move;
	}

	get isMainLast() {
		return this._pos.length === 1 && this._pos[0] === this.history.length - 1;
	}

	async seekPrev() {
		return this.setPos(this.history.findPrevMovePath(this._pos) || [-1]);
	}

	async seekNext() {
		return this.setPos(this.history.findNextMovePath(this._pos) || [this.history.length - 1]);
	}

	async seekInto() {
		const pos = [].concat(this._pos);
		const move = this.getCurrentMove();
		if (!move) {
			return null;
		}
		outer: for (let i = 0; i < move.children.length; i++) {
			const childHistory = move.children[i];
			if (!(childHistory instanceof History)) {
				continue;
			}
			pos.push(i);
			for (let j = 0; j < childHistory.length; j++) {
				const item = childHistory[j];
				if (item instanceof MoveBase) {
					pos.push(j);
					break outer;
				}
			}
		}
		if (pos.length - this._pos.length !== 2) {
			return null;
		}
		return this.setPos(pos);
	}

	async seekOut() {
		const pos = this._pos.slice(0, -2);
		if (!pos.length) {
			return null;
		}
		return this.setPos(pos);
	}

	async seekStart() {
		return this.setPos([-1]);
	}

	async seekEnd() {
		return this.setPos([this.history.length - 1]);
	}

	getCurrentMove() {
		return this.history.getMove(this._pos);
	}

	getNextMove() {
		const pos = this.pos;
		pos[pos.length - 1]++;
		return this.history.getMove(pos);
	}

	static async parsePgn(pgn, parseMovesMaxDepth = 1) {
		let res = null;
		for await (const [err, game] of this.parsePgnMulti(pgn, parseMovesMaxDepth)) {
			if (err || !game) {
				throw err;
			}
			if (res) {
				throw new Error(`Multiple games found in PGN. Please use Game.parsePgnMulti`);
			}
			res = game;
		}
		return res;
	}

	static async *parsePgnMultiOld(pgn, parseMovesMaxDepth = 1) {
		const pgnTokenizer = new PgnTokenizer({
			singleDocument: false,
		});
		const root = pgnTokenizer.process(pgn);
		
		const fillHistory = (initialState, ctx, startingIndex = 0) => {
			const history = History.create(initialState);
			let prevMove;
			let i;
			for (i = startingIndex; i < ctx.length; i++) {
				const item = ctx[i];
				if (item instanceof tokenizerflow.Context && item.ctxName === 'comment') {
					prevMove.children.push(new Comment(item[0][0]));
				}
				else if (item instanceof tokenizerflow.Context && item.ctxName === 'alt') {
					const [childHistory, _] = fillHistory(null, item);
					prevMove.children.push(childHistory);
				}
				else if (item instanceof tokenizerflow.Match && item.patternId === 'moveNumber') {
					// TODO: check
				}
				else if (item instanceof tokenizerflow.Match && item.patternId === 'moveText') {
					prevMove = new MoveAbbr(item);
					history.push(prevMove);
				}
				else if (item instanceof tokenizerflow.Context && item.ctxName === 'header') {
					break;
				}
			}
			return [history, i - 1];
		};
		
		let meta = {};
		let initialState = null;
		let history = null;
		for (let i = 0; i < root.length; i++) {
			const item = root[i];
			if (item instanceof tokenizerflow.Context && item.ctxName === 'header') {
				const headerName = item[0][0];
				const headerValue = item[1].reduce((cap, v) => cap + v[0], '');
				if (meta[headerName] != null) {
					throw new Error(`Duplicate header '${headerName}'`);
				}
				meta[headerName] = headerValue;
				if (headerName.toUpperCase() === 'FEN') {
					initialState = headerValue;
				}
			}
			else {
				[history, i] = fillHistory(initialState || State.createInitial(), root, i);
				try {
					await history.parseMoves(parseMovesMaxDepth);
					const game = new Game(history.initialState.clone(), meta);
					game.history = history;
					yield [null, game];
				}
				catch (err) {
					yield [err, null];
					// console.error(err);
				}
				finally {
					meta = {};
					initialState = null;
					history = null;
				}
			}
		}
	}

	static async *parsePgnMulti(pgn, parseMovesMaxDepth = 1, callback = null) {
		const pgnTokenizer = new PgnTokenizer({
			singleDocument: false,
		});
		
		let headerName;
		let str = null;
		let meta = null;
		let initialState = null;
		let history = null;
		let historyStack = [];
		let prevMove = null;
		
		let counter = 0;
		for (const m of pgnTokenizer.iterate(pgn)) {
			try {
				if (m.patternId === 'moveNumber' || m.patternId === 'moveText') {
					if (!history) {
						history = History.create(initialState || State.createInitial());
						historyStack.unshift(history);
					}
				}
				
				const finalize = (m.patternId === 'headerOpen' && history)
					|| (m.patternId === 'end')
					|| (m.patternId === 'eof' && (history || meta))
				;
				if (finalize) {
					if (historyStack.length > 1) {
						throw new Error(`Unable to find matching ALT bracket at offset ${m.lastIndex}`);
					}
					try {
						if (!history) {
							history = History.create(initialState || State.createInitial());
						}
						else {
							const pgnProgress = m.lastIndex / pgn.length;
							const parseMovesCallback = !callback ? null : async (i, len, curDepth, maxDepth) => {
								if (curDepth > 0) {
									return;
								}
								await callback(pgnProgress, i / len);
							};
							await history.parseMoves(parseMovesMaxDepth, parseMovesCallback);
						}
						const game = new Game(history.initialState.clone(), meta);
						game.history = history;
						yield [null, game];
					}
					catch (err) {
						console.error(history.toPgn());
						throw err;
					}
					finally {
						headerName = null;
						str = null;
						meta = null;
						initialState = null;
						history = null;
						historyStack = [];
						prevMove = null;
					}
				}
				
				switch (m.patternId) {
					case 'headerName':
						if (!meta) {
							meta = {};
						}
						headerName = m.m[1];
					break;
					
					case 'strOpen':
						str = '';
					case 'strBsBs':
					case 'strBsQ':
					case 'strAny':
					case 'strClose':
						str += m.m[0];
					break;
					
					case 'headerClose':
						const headerValue = JSON.parse(str);
						if (meta[headerName] != null) {
							throw new Error(`Duplicate header '${headerName}'`);
						}
						meta[headerName] = headerValue;
						if (headerName.toUpperCase() === 'FEN') {
							initialState = headerValue;
						}
					break;
					
					case 'moveNumber':
						// TODO: check
					break;
					
					case 'moveText':
						prevMove = new MoveAbbr(m.m);
						historyStack[0].push(prevMove);
					break;
					
					case 'commentContents':
						prevMove.children.push(new Comment(m.m[0]));
					break;
					
					case 'altOpen':
						const childHistory = History.create(null);
						prevMove.children.push(childHistory);
						historyStack.unshift(childHistory);
					break;
					
					case 'altClose':
						historyStack.shift();
					break;
				}
			}
			catch (err) {
				yield [err, null];
			}
			if (callback && ++counter % 50 === 0) {
				const pgnProgress = m.lastIndex / pgn.length;
				await callback(pgnProgress, 0);
			}
		}
		if (callback) {
			await callback(1, 1);
		}
	}

	toPgn() {
		let res = '';
		for (const k in this.meta) {
			const v = JSON.stringify((this.meta[k] || '').toString());
			res += `\n[${k} ${v}]`;
		}
		const initialFen = this.history.initialState.toFen();
		if (initialFen !== State.INITIAL_FEN_CLASSIC) {
			const v = JSON.stringify(initialFen);
			res += `\n[FEN ${v}]`;
		}
		
		res += '\n' + this.history.toString();
		if (this.meta['Result']) {
			res += ' ' + this.meta['Result'];
		}
		return res.slice(1);
	}

	// wrap State:

	get(...args) {
		return this.state.get(...args);
	}

	get activeWhite() {
		return this.state.activeWhite;
	}

	normMove(...args) {
		return this.state.normMove(...args);
	}

	*listMoves(...args) {
		yield* this.state.listMoves(...args);
	}

	*listAttacks(...args) {
		yield* this.state.listAttacks(...args);
	}

	toFen(...args) {
		return this.state.toFen(...args);
	}

	findKing(...args) {
		return this.state.findKing(...args);
	}

	// wrap root History:

	get initialState() {
		return !this.history.initialState ? null : this.history.initialState.clone();
	}
}
