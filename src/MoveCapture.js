import Move from './Move.js';
import Coord from './Coord.js';

export default class MoveCapture extends Move {
	piece2 = null;
	src2 = null;
	dst2 = null;

	constructor(piece, src, dst, capPiece, cap = null) {
		super(piece, src, dst);
		this.capPiece = capPiece;
		this.cap = new Coord(cap || dst);
		capPiece.onCaptured(this);
	}

	toString(pretty) {
		return ''
			+ (this.piece.toString(pretty).toUpperCase())
			+ (this.src.toString(pretty).toLowerCase())
			+ (!pretty ? 'x' : '\u00D7')
			+ (!this.capPiece ? '' : this.capPiece.toString(pretty).toUpperCase())
			+ (this.dst.toString(pretty).toLowerCase())
			+ (!this.mut ? '' : '=' + this.mut.toString(pretty).toUpperCase())
			+ (this.fin || '')
		;
	}

	toPgnString() {
		return ''
			+ (this.piece.toPgnString())
			+ (this.src.toPgnString())
			+ ('x')
			+ (this.dst.toPgnString())
			+ (!this.mut ? '' : '=' + this.mut.toPgnString())
			+ (this.fin || '')
		;
	}
}
