import MoveBase from './MoveBase.js';
import Coord from './Coord.js';

export default class Move extends MoveBase {
	piece = null;
	src = null;
	dst = null;
	mut = null;
	fin = null;
	ext = null;
	patchStateEnPassant = null;
	patchStateCastling = null;
	preFen = null;
	postFen = null;

	constructor(piece, src, dst) {
		super();
		this.piece = piece;
		this.src = new Coord(src);
		this.dst = new Coord(dst);
		this.mut = null;
		this.fin = null;
		this.ext = null;
		this.patchStateEnPassant = false;
		this.patchStateCastling = null;
		piece.onMove(this);
	}

	toString(pretty) {
		return ''
			+ (this.piece.toString(pretty).toUpperCase())
			+ (this.src.toString(pretty).toLowerCase())
			+ (this.dst.toString(pretty).toLowerCase())
			+ (!this.mut ? '' : '=' + this.mut.toString(pretty).toUpperCase())
			+ (this.fin || '')
		;
	}

	toPgnString() {
		return ''
			+ (this.piece.toPgnString())
			+ (this.src.toPgnString())
			+ (this.dst.toPgnString())
			+ (!this.mut ? '' : '=' + this.mut.toPgnString())
			+ (this.fin || '')
		;
	}
}
