import Move from './Move.js';
import Coord from './Coord.js';

export default class MoveCastling extends Move {
	piece2 = null;
	src2 = null;
	dst2 = null;

	constructor(piece, src, dst, piece2, src2, dst2) {
		super(piece, src, dst);
		this.piece2 = piece2;
		this.src2 = new Coord(src2);
		this.dst2 = new Coord(dst2);
	}

	get isLong() {
		const x1 = (this.piece.name === 'K' ? this.src : this.src2).x;
		const x2 = (this.piece.name !== 'K' ? this.src : this.src2).x;
		return x1 > x2;
	}

	toString(pretty) {
		const s = this.isLong ? 'O-O-O' : 'O-O';
		return (this.piece.isWhite ? s : s.toLowerCase())
			+ (this.fin || '')
		;
	}

	toPgnString() {
		return this.isLong ? 'O-O-O' : 'O-O';
	}
}
