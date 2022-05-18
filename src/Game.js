import State from './State.js';
import Coord from './Coord.js';
import Move from './Move.js';
import MoveCapture from './MoveCapture.js';
import MoveCastling from './MoveCastling.js';
import MoveAbbr from './MoveAbbr.js';
import * as pieces from './pieces/index.js';
import Comment from './Comment.js';
import History from './History.js';
import PgnTokenizer from './PgnTokenizer.js';
import tokenizerflow from './tokenizerflow.js';

export default class Game extends State {
	history;
	state;
	pos = [-1];
	meta = {};

	constructor(initialState, meta) {
		super();
		this.history = new History(initialState || State.createInitial());
		this._setValues(this.history.initialState);
		this.pos = [-1];
		this.meta = Object.assign(this.meta, meta);
	}

	toString() {
		return this.toPgn();
	}

	applyMove(move) {
		move = super.applyMove(move);
		const nextPos = this.history.addNextMove(this.pos, move);
		this.pos = nextPos;
		return move;
	}

	undoMove() {
		const curMove = this.history.getMove(this.pos);
		if (!curMove) {
			return null;
		}
		const prevPos = this.history.findPrevMovePath(this.pos);
		let prevMove = null;
		if (prevPos.length === 1 && prevPos[0] < 0) {
			this._setValues(State.fromFen(curMove.preFen));
			prevPos[0] = -1;
		}
		else {
			prevMove = this.history.getMove(prevPos);
			this._setValues(State.fromFen(prevMove.postFen));
		}
		this.pos = prevPos;
		return prevMove;
	}

	async setPos(pos) {
		pos = [].concat(pos);
		let move;
		if (pos.length === 1 && pos[0] < 0) {
			pos[0] = -1;
			this._setValues(this.history.initialState || State.createInitial());
		}
		else {
			move = await this.history.getMoveParsed(pos);
			if (!move) {
				throw new Error(`Invalid historical position`);
			}
			this._setValues(State.fromFen(move.postFen));
		}
		this.pos = pos;
		return move;
	}

	async seekToStart() {
		return this.setPos([-1]);
	}

	async seekToEnd() {
		return this.setPos([this.history.length - 1]);
	}

	getCurrentMove() {
		return this.history.getMove(this.pos);
	}

	static async parsePgn(pgn, parseMovesMaxDepth = 1) {
		const pgnTokenizer = new PgnTokenizer({
			singleDocument: true,
		});
		const root = pgnTokenizer.process(pgn);
		let initialState;
		let meta = {};
		let history;
		
		const fillHistory = (initialState, ctx, startingIndex = 0) => {
			const history = new History(initialState);
			let prevMove;
			for (let i = startingIndex; i < ctx.length; i++) {
				const item = ctx[i];
				if (item instanceof tokenizerflow.Context && item.ctxName === 'comment') {
					prevMove.children.push(new Comment(item[0][0]));
				}
				else if (item instanceof tokenizerflow.Context && item.ctxName === 'alt') {
					prevMove.children.push(fillHistory(null, item));
				}
				else if (item instanceof tokenizerflow.Match && item.patternId === 'moveNumber') {
					// TODO: check
				}
				else if (item instanceof tokenizerflow.Match && item.patternId === 'moveText') {
					prevMove = new MoveAbbr(item);
					history.push(prevMove);
				}
			}
			return history;
		};
		
		let i;
		for (i = 0; i < root.length; i++) {
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
				break;
			}
		}
		history = fillHistory(initialState || State.createInitial(), root, i);
		
		await history.parseMoves(parseMovesMaxDepth);
		
		const res = new Game(null, meta);
		res.history = history;
		res.state = history.initialState.clone();
		return res;
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
}
