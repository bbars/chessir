import Piece from './Piece.js';
import Coord from '../Coord.js';

export default class PieceR extends Piece {
	get name() {
		return 'R';
	}

	toString(pretty) {
		return !pretty
			? this.code
			: (this.isWhite ? "\u2656" : "\u265C") // ♖♜
		;
	}

	onMove(move) {
	}

	onCaptured(move) {
		const castlingSide = this._getCastlingSide(move.cap);
		if (castlingSide) {
			move.patchStateCastling = move.patchStateCastling || {};
			move.patchStateCastling[castlingSide] = false;
		}
	}

	getMoves(state, src) {
		src = Coord.ensure(src);
		const res = {};
		
		Object.assign(res, this._getLineMoves(state, src,  0, +1)); // n
		Object.assign(res, this._getLineMoves(state, src,  0, -1)); // s
		Object.assign(res, this._getLineMoves(state, src, +1,  0)); // e
		Object.assign(res, this._getLineMoves(state, src, -1,  0)); // w
		
		const castlingSide = this._getCastlingSide(src);
		if (castlingSide && state.castling[castlingSide]) {
			for (const k in res) {
				res[k].patchStateCastling = {
					[castlingSide]: false,
				};
			}
		}
		
		return res;
	}

	canAttack(state, src, dst) {
		src = Coord.ensure(src);
		dst = Coord.ensure(dst);
		
		if (src.x !== dst.x && src.y !== dst.y) {
			return false;
		}
		
		return super.canAttack(state, src, dst);
	}

	_getCastlingSide(coord) {
		return null
			|| (coord.txt === 'a1' && 'Q')
			|| (coord.txt === 'h1' && 'K')
			|| (coord.txt === 'a8' && 'q')
			|| (coord.txt === 'h8' && 'k')
			|| null
		;
	}
}
Piece.registerImplementation(PieceR);
