import Piece from './Piece.js';
import Coord from '../Coord.js';

export default class PieceB extends Piece {
	get name() {
		return 'B';
	}

	toString(pretty) {
		return !pretty
			? this.code
			: (this.isWhite ? "\u2657" : "\u265D") // ♗♝
		;
	}

	onMove(move) {
	}

	onCaptured(move) {
	}

	getMoves(state, src) {
		src = Coord.ensure(src);
		const res = {};
		
		Object.assign(res, this._getLineMoves(state, src, +1, +1)); // ne
		Object.assign(res, this._getLineMoves(state, src, +1, -1)); // nw
		Object.assign(res, this._getLineMoves(state, src, -1, +1)); // se
		Object.assign(res, this._getLineMoves(state, src, -1, -1)); // sw
		
		return res;
	}
}
Piece.registerImplementation(PieceB);
