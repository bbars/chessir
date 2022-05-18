import Piece from './Piece.js';
import Coord from '../Coord.js';
import Move from '../Move.js';
import MoveCapture from '../MoveCapture.js';

export default class PieceN extends Piece {
	get name() {
		return 'N';
	}

	toString(pretty) {
		return !pretty
			? this.code
			: (this.isWhite ? "\u2658" : "\u265E") // ♘♞
		;
	}

	onMove(move) {
	}

	onCaptured(move) {
	}

	getMoves(state, src) {
		src = Coord.ensure(src);
		const res = {};
		
		this._appendMoveOffset(res, state, src, -1, -2);
		this._appendMoveOffset(res, state, src, -1, +2);
		this._appendMoveOffset(res, state, src, +1, -2);
		this._appendMoveOffset(res, state, src, +1, +2);
		this._appendMoveOffset(res, state, src, -2, -1);
		this._appendMoveOffset(res, state, src, -2, +1);
		this._appendMoveOffset(res, state, src, +2, -1);
		this._appendMoveOffset(res, state, src, +2, +1);
		
		return res;
	}

	_appendMoveOffset(res, state, src, offX, offY) {
		const dst = src.offset(offX, offY);
		if (!dst) {
			return;
		}
		const capPiece = state.get(dst);
		if (!capPiece) {
			res[dst] = new Move(this, src, dst);
		}
		else if (capPiece.isWhite != this.isWhite) {
			res[dst] = new MoveCapture(this, src, dst, capPiece);
		}
	}
}
Piece.registerImplementation(PieceN);
