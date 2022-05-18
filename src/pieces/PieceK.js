import Piece from './Piece.js';
import PieceQ from './PieceQ.js';
import Coord from '../Coord.js';
import MoveCastling from '../MoveCastling.js';

export default class PieceK extends Piece {
	get name() {
		return 'K';
	}

	toString(pretty) {
		return !pretty
			? this.code
			: (this.isWhite ? "\u2654" : "\u265A") // ♔♚
		;
	}

	onMove(move) {
	}

	onCaptured(move) {
	}

	getMoves(state, src) {
		src = Coord.ensure(src);
		const res = {};
		
		Object.assign(res, this._getLineMoves(state, src,  0, +1, true)); // n
		Object.assign(res, this._getLineMoves(state, src,  0, -1, true)); // s
		Object.assign(res, this._getLineMoves(state, src, +1,  0, true)); // e
		Object.assign(res, this._getLineMoves(state, src, -1,  0, true)); // w
		Object.assign(res, this._getLineMoves(state, src, +1, +1, true)); // ne
		Object.assign(res, this._getLineMoves(state, src, +1, -1, true)); // nw
		Object.assign(res, this._getLineMoves(state, src, -1, +1, true)); // se
		Object.assign(res, this._getLineMoves(state, src, -1, -1, true)); // sw
		
		const kingIsAttacked = state.isAttacked(src, !this.isWhite);
		let pos = [];
		let pathAvailable;
		let dummyPiece;
		let state2;
		pathAvailable = !kingIsAttacked
			&& (state.castling[this._toCodeCase('Q')])
			&& (pos[0] = src.offset(-1, 0)) && !state.get(pos[0])
			&& (pos[1] = src.offset(-2, 0)) && !state.get(pos[1])
			&& (pos[2] = src.offset(-3, 0)) && !state.get(pos[2])
			&& (pos[3] = src.offset(-4, 0)) && state.get(pos[3])
			&& (!state.isAttacked(pos[0], !this.isWhite))
			&& (!state.isAttacked(pos[1], !this.isWhite))
		;
		if (pathAvailable) {
			const dst = src.offset(-2, 0);
			const src2 = src.offset(-4, 0);
			const dst2 = src2 && src2.offset(+3, 0);
			const piece2 = src2 && state.get(src2);
			if (!dst || !src2 || !dst2 || !piece2) {
				// skip
			}
			else if (this.isWhite && state.castling.Q) {
				res[dst] = new MoveCastling(this, src, dst, piece2, src2, dst2);
			}
			else if (!this.isWhite && state.castling.q) {
				res[dst] = new MoveCastling(this, src, dst, piece2, src2, dst2);
			}
		}
		pathAvailable = !kingIsAttacked
			&& (state.castling[this._toCodeCase('K')])
			&& (pos[0] = src.offset(+1, 0)) && !state.get(pos[0])
			&& (pos[1] = src.offset(+2, 0)) && !state.get(pos[1])
			&& (pos[2] = src.offset(+3, 0)) && state.get(pos[2])
			&& (!state.isAttacked(pos[0], !this.isWhite))
			&& (!state.isAttacked(pos[1], !this.isWhite))
		;
		if (pathAvailable) {
			const dst = src.offset(+2, 0);
			const src2 = src.offset(+3, 0);
			const dst2 = src2 && src2.offset(-2, 0);
			const piece2 = src2 && state.get(src2);
			if (!dst || !src2 || !dst2 || !piece2) {
				// skip
			}
			else if (this.isWhite && state.castling.K) {
				res[dst] = new MoveCastling(this, src, dst, piece2, src2, dst2);
			}
			else if (!this.isWhite && state.castling.k) {
				res[dst] = new MoveCastling(this, src, dst, piece2, src2, dst2);
			}
		}
		
		for (const k in res) {
			res[k].patchStateCastling = {
				[this.isWhite ? 'Q' : 'q']: false,
				[this.isWhite ? 'K' : 'k']: false,
			};
		}
		
		return res;
	}

	canAttack(state, src, dst) {
		src = Coord.ensure(src);
		dst = Coord.ensure(dst);
		const dstTxt = dst.txt;
		
		if (Math.abs(dst.x - src.x) > 1 || Math.abs(dst.y - src.y) > 1) {
			return false;
		}
		
		return null != (false
			|| this._getLineMoves(state, src,  0, +1, true)[dstTxt]  // n
			|| this._getLineMoves(state, src,  0, -1, true)[dstTxt]  // s
			|| this._getLineMoves(state, src, +1,  0, true)[dstTxt]  // e
			|| this._getLineMoves(state, src, -1,  0, true)[dstTxt]  // w
			|| this._getLineMoves(state, src, +1, +1, true)[dstTxt]  // ne
			|| this._getLineMoves(state, src, +1, -1, true)[dstTxt]  // nw
			|| this._getLineMoves(state, src, -1, +1, true)[dstTxt]  // se
			|| this._getLineMoves(state, src, -1, -1, true)[dstTxt]  // sw
		);
	}
}
Piece.registerImplementation(PieceK);
