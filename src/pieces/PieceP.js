import Piece from './Piece.js';
import Coord from '../Coord.js';
import Move from '../Move.js';
import MoveCapture from '../MoveCapture.js';

export default class PieceP extends Piece {
	get name() {
		return 'P';
	}

	toString(pretty) {
		return !pretty
			? this.code
			: (this.isWhite ? "\u2659" : "\u265F") // ♙♟
		;
	}

	onMove(move) {
	}

	onCaptured(move) {
	}

	getMoves(state, src) {
		src = Coord.ensure(src);
		const res = {};
		const offY = this.isWhite ? +1 : -1;
		let dst;
		let capPiece;
		let move;
		
		if ((dst = src.offset(0, offY)) && !state.get(dst)) {
			move = new Move(this, src, dst);
			move = this._prepareMutation(move);
			res[dst.txt] = move;
			
			const atStart = src.y === (this.isWhite ? 1 : 6);
			if (atStart && (dst = src.offset(0, offY * 2)) && !state.get(dst)) {
				move = new Move(this, src, dst);
				move.patchStateEnPassant = move.dst;
				res[dst.txt] = move;
			}
		}
		if ((dst = src.offset(-1, offY)) && (capPiece = state.get(dst)) && capPiece.isWhite != this.isWhite) {
			move = new MoveCapture(this, src, dst, capPiece);
			move = this._prepareMutation(move);
			res[dst.txt] = move;
		}
		if ((dst = src.offset(+1, offY)) && (capPiece = state.get(dst)) && capPiece.isWhite != this.isWhite) {
			move = new MoveCapture(this, src, dst, capPiece);
			move = this._prepareMutation(move);
			res[dst.txt] = move;
		}
		if (move = this._getEnPassantMoveIfAvailable(state, src)) {
			res[move.dst.txt] = move;
		}
		return res;
	}

	canAttack(state, src, dst) {
		src = Coord.ensure(src);
		dst = Coord.ensure(dst);
		const offY = this.isWhite ? +1 : -1;
		
		if (Math.abs(dst.x - src.x) === 1 && (dst.y - src.y) === offY) {
			return true;
		}
		const move = this._getEnPassantMoveIfAvailable(state, src);
		if (move && move.cap.txt === dst.txt) {
			return true;
		}
		return false;
	}

	_getEnPassantMoveIfAvailable(state, src) {
		const ep = state.enPassant;
		const capPiece = !ep ? null : state.get(ep);
		const offY = this.isWhite ? +1 : -1;
		if (ep
		&& capPiece
		&& capPiece.isWhite != this.isWhite
		&& src.y === ep.y
		&& Math.abs(ep.x - src.x) === 1) {
			const dst = ep.offset(0, offY);
			return new MoveCapture(this, src, dst, capPiece, ep);
		}
		return null;
	}
}
Piece.registerImplementation(PieceP);
