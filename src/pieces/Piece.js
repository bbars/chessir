import Coord from '../Coord.js';
import Move from '../Move.js';
import MoveCapture from '../MoveCapture.js';

export default class Piece {
	static _implementations = {};

	isWhite = null;

	constructor(isWhite) {
		if (new.target === Piece) {
			throw new Error(`Can't instantiate Piece, you shoud extend this class or use Piece.parse(...)`);
		}
		this.isWhite = isWhite;
	}

	get name() {
		throw new Error(`This method should be implemented`);
	}

	toString(pretty) {
		throw new Error(`This method should be implemented`);
		return this.toFenString();
	}

	toFenString() {
		return this.code;
	}

	toPgnString() {
		return this.name;
	}

	getMoves(state, src) {
		throw new Error(`This method should be implemented`);
	}

	onMove(move) {
		throw new Error(`This method should be implemented`);
	}

	onCaptured(move) {
		throw new Error(`This method should be implemented`);
	}

	canAttack(state, src, dst) {
		return this.getMoves(state, src)[Coord.ensure(dst).toString()];
	}

	get code() {
		return this._toCodeCase(this.name);
	}

	static registerImplementation(pieceClass) {
		const piece = new pieceClass();
		if (!(piece instanceof this)) {
			throw new Error(`Implementation must extend class ${this.name}`);
		}
		const name = piece.name;
		if (name !== name.toUpperCase()) {
			throw new Error(`Piece name must be an upper-case string`);
		}
		if (this._implementations[name] && this._implementations[name] !== pieceClass) {
			throw new Error(`Implementation conflict for ${pieceClass.name}: name ${name} already registered by another implementation ${this._implementations[name].name}`);
		}
		this._implementations[name] = pieceClass;
	}

	static parse(code) {
		code = (code || '').toString();
		const codeUpper = code.toUpperCase();
		const constructor = this._implementations[codeUpper];
		if (!constructor) {
			throw new Error(`Invalid piece code: '${code}'`);
		}
		const isWhite = codeUpper === code;
		return new constructor(isWhite);
	}

	static ensure(value) {
		return value instanceof this ? value : this.parse(value);
	}

	_toCodeCase(s) {
		return this.isWhite ? s.toUpperCase() : s.toLowerCase();
	}

	_prepareMutation(move) {
		if ((this.isWhite && move.dst.y === 7) || (!this.isWhite && move.dst.y === 0)) {
			// TODO: allow to select mut
			move.mut = Piece.parse(this._toCodeCase('Q'));
		}
		return move;
	}

	_getLineMoves(state, src, offX, offY, singleCell) {
		offX |= 0;
		offY |= 0;
		if (!offX && !offY) {
			throw new Error(`Invalid zero offsets`);
		}
		const res = {};
		let dst = src;
		let capPiece;
		while (dst = dst.offset(offX, offY)) {
			capPiece = state.get(dst);
			if (!capPiece) {
				res[dst] = new Move(this, src, dst);
			}
			else {
				if (capPiece.isWhite !== this.isWhite) {
					res[dst] = new MoveCapture(this, src, dst, capPiece);
				}
				break;
			}
			if (singleCell) {
				break;
			}
		}
		return res;
	}
}
