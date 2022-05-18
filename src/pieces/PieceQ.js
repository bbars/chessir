import Piece from './Piece.js';
import Coord from '../Coord.js';

export default class PieceQ extends Piece {
	get name() {
		return 'Q';
	}

	toString(pretty) {
		return !pretty
			? this.code
			: (this.isWhite ? "\u2655" : "\u265B") // ♕♛
		;
	}

	onMove(move) {
	}

	onCaptured(move) {
	}

	getMoves(state, src) {
		src = Coord.ensure(src);
		const res = {};
		
		Object.assign(res, this._getLineMoves(state, src,  0, +1)); // n
		Object.assign(res, this._getLineMoves(state, src,  0, -1)); // s
		Object.assign(res, this._getLineMoves(state, src, +1,  0)); // e
		Object.assign(res, this._getLineMoves(state, src, -1,  0)); // w
		Object.assign(res, this._getLineMoves(state, src, +1, +1)); // ne
		Object.assign(res, this._getLineMoves(state, src, +1, -1)); // nw
		Object.assign(res, this._getLineMoves(state, src, -1, +1)); // se
		Object.assign(res, this._getLineMoves(state, src, -1, -1)); // sw
		
		return res;
	}
}
Piece.registerImplementation(PieceQ);
