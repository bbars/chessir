import Coord from './Coord.js';
import * as pieces from './pieces/index.js';
import MoveAbbr from './MoveAbbr.js';
import Move from './Move.js';
import MoveCapture from './MoveCapture.js';
import MoveCastling from './MoveCastling.js';

const FIN_DRAW = new String('1/2-1/2');
const FIN_DRAW_RULE_50 = new String('0-0');
const FIN_CHECK = new String('+');
const FIN_CHECKMATE = new String('#');
const INITIAL_FEN_CLASSIC = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default class State {
	static SIZE = 8;
	static PIECE_NUMS = {
		// black:
		'p': 1 << 1 | 0,
		'n': 2 << 1 | 0,
		'b': 3 << 1 | 0,
		'r': 4 << 1 | 0,
		'q': 5 << 1 | 0,
		'k': 6 << 1 | 0,
		// white:
		'P': 1 << 1 | 1,
		'N': 2 << 1 | 1,
		'B': 3 << 1 | 1,
		'R': 4 << 1 | 1,
		'Q': 5 << 1 | 1,
		'K': 6 << 1 | 1,
	};
	static FIN_DRAW = FIN_DRAW;
	static FIN_CHECK = FIN_CHECK;
	static FIN_CHECKMATE = FIN_CHECKMATE;
	static INITIAL_FEN_CLASSIC = INITIAL_FEN_CLASSIC;

	_board = [];
	_activeWhite = null;
	_castling = null;
	_enPassant = null;
	_halfmoveClock = null;
	_fullmoveNumber = null;
	_cache = { K: null, k: null };

	get board() {
		return this._board;
	}

	get activeWhite() {
		return this._activeWhite;
	}

	get castling() {
		return this._castling;
	}

	get enPassant() {
		return this._enPassant;
	}

	get halfmoveClock() {
		return this._halfmoveClock;
	}

	get fullmoveNumber() {
		return this._fullmoveNumber;
	}

	static fromFen(fen) {
		const res = new State();
		fen = (fen || '').toString().trim().split(/\s+/);
		const len = this.SIZE * this.SIZE;
		
		// board:
		let x = -1;
		let charPos = 0;
		let boardLen = fen[0].length;
		let kings = {
			K: null,
			k: null,
		};
		for (let j = 0; j < boardLen; j++) {
			const c = fen[0][j];
			x++;
			charPos++;
			if (c === '/') {
				for (let i = this.SIZE - x; i > 0; i--) {
					res._board.push(null);
				}
				x = -1;
			}
			else if (x >= this.SIZE) {
				throw new Error(`Row overflow at position ${charPos}`);
			}
			else if (!isNaN(c)) {
				for (let i = +c; i > 0; i--) {
					res._board.push(null);
				}
				x += c - 1;
			}
			else {
				if (c === 'K' || c === 'k') {
					if (kings[c]) {
						throw new Error(`Duplicate at position ${charPos}`);
					}
					kings[c] = res._board.length;
				}
				res._board.push(pieces.Piece.parse(c));
			}
			if (res._board.length > len) {
				throw new Error(`Cell overflow at position ${charPos}`);
			}
		}
		if (res._board.length < len) {
			throw new Error(`Cell underflow: ${res._board.length}`);
		}
		if (kings.K === null) {
			throw new Error(`White king is missing`);
		}
		if (kings.k === null) {
			throw new Error(`Black king is missing`);
		}
		res._cache.K = Coord.fromIndex(kings.K);
		res._cache.k = Coord.fromIndex(kings.k);
		
		// active color:
		fen[1] = fen[1].toLowerCase();
		if (fen[1] === 'w') {
			res._activeWhite = true;
		}
		else if (fen[1] === 'b') {
			res._activeWhite = false;
		}
		else {
			throw new Error(`Invalid value for active color`);
		}
		
		// castling:
		if (/[^KQkq-]/.test(fen[2])) {
			throw new Error(`Invalid value for castling`);
		}
		
		res._castling = {
			K: fen[2].indexOf('K') > -1,
			Q: fen[2].indexOf('Q') > -1,
			k: fen[2].indexOf('k') > -1,
			q: fen[2].indexOf('q') > -1,
		};
		
		// en-passant:
		if (fen[3] === '-') {
			res._enPassant = false;
		}
		else {
			try {
				res._enPassant = Coord.fromTxt(fen[3]);
			}
			catch (err) {
				throw new Error(`Invalid value for en-passant`);
			}
		}
		
		// halfmove clock:
		if (isNaN(fen[4]) || fen[4] % 1 > 0) {
			throw new Error(`Invalid value for halfmove clock`);
		}
		res._halfmoveClock = fen[4] | 0;
		
		// fullmove number:
		if (isNaN(fen[5]) || fen[5] % 1 > 0) {
			throw new Error(`Invalid value for fullmove number`);
		}
		res._fullmoveNumber = fen[5] | 0;
		
		return res;
	}

	toFen() {
		let res = '';
		
		// board:
		let skip = 0;
		for (let i = 0; i < this._board.length; i++) {
			const piece = this._board[i];
			if (i && i % this.constructor.SIZE === 0) {
				if (skip) {
					res += skip.toString();
					skip = 0;
				}
				res += '/';
			}
			if (piece == null) {
				skip++;
			}
			else {
				if (skip) {
					res += skip;
					skip = 0;
				}
				res += piece.code;
			}
		}
		if (skip) {
			res += skip.toString();
		}
		
		// active color:
		res += ' ';
		res += this._activeWhite ? 'w' : 'b';
		
		// castling:
		res += ' ';
		if (!this._castling) {
			res += '?';
		}
		else if (!this._castling.K && !this._castling.Q && !this._castling.k && !this._castling.q) {
			res += '-';
		}
		else {
			res += this._castling.K ? 'K' : '';
			res += this._castling.Q ? 'Q' : '';
			res += this._castling.k ? 'k' : '';
			res += this._castling.q ? 'q' : '';
		}
		
		// en-passant:
		res += ' ';
		res += !this._enPassant ? '-' : this._enPassant.toString();
		
		// halfmove clock:
		res += ' ';
		res += this._halfmoveClock.toString();
		
		// fullmove number:
		res += ' ';
		res += this._fullmoveNumber.toString();
		
		return res;
	}

	static createInitial() {
		return this.fromFen(this.INITIAL_FEN_CLASSIC);
	}

	toString() {
		return this.toFen();
	}

	_setValues(data) {
		if (!this._board) {
			this._board = [];
		}
		else {
			this._board.splice(0, this._board.length);
		}
		this._board.push(...data._board);
		this._activeWhite = data._activeWhite;
		this._castling = Object.assign(this._castling || {}, data._castling);
		this._enPassant = data._enPassant;
		this._halfmoveClock = data._halfmoveClock;
		this._fullmoveNumber = data._fullmoveNumber;
		this._cache = Object.assign(this._cache || {}, data._cache);
		return this;
	}

	clone() {
		return new this.constructor()._setValues(this);
	}

	boardToNums() {
		const pieceNums = this.constructor.PIECE_NUMS;
		const nums = new Array(this.constructor.SIZE * this.constructor.SIZE).fill(0);
		for (let i = 0; i < this._board.length; i++) {
			const piece = this._board[i];
			if (piece == null) {
				continue;
			}
			const num = pieceNums[piece] ?? false;
			if (num === false) {
				throw new Error(`Unknown piece '${piece}'`);
			}
			nums[i] = num;
		}
		return nums;
	}

	boardToBytes() {
		const nums = this.boardToNums();
		const byteLen = Math.ceil(nums.length / 2);
		const bytes = new Array(byteLen);
		for (let i = 0; i < byteLen; i++) {
			bytes[i] = 0
				| nums[i * 2 + 0] << 4
				| nums[i * 2 + 1] << 0
			;
		}
		return bytes;
	}

	boardToBin() {
		return this.boardToBytes()
			.map(byte => String.fromCharCode(byte))
			.join('')
		;
	}

	boardToHex() {
		return this.boardToBytes()
			.map(byte => ('00' + byte.toString(16)).slice(-2))
			.join('')
		;
	}

	setBoardFromBin(bin) {
		const bytes = bin
			.split('')
			.map(char => char.charCodeAt(0))
		;
		if (bin.length !== this.constructor.SIZE * this.constructor.SIZE / 2) {
			throw new Error(`Invalid binary data`);
		}
		
		const numPieces = {};
		for (const k in this.constructor.PIECE_NUMS) {
			numPieces[this.constructor.PIECE_NUMS[k]] = k;
		}
		
		const board = [];
		let halfByte;
		let piece;
		for (let i = 0; i < bytes.length; i++) {
			const byte = bytes[i];
			
			halfByte = (byte & (0x0f << 4)) >> 4;
			piece = !halfByte ? null : (numPieces[halfByte] ?? false);
			if (piece === false) {
				throw new Error(`Unknown piece at offset ${i} (hi quartet)`);
			}
			board.push(!piece ? null : pieces.Piece.parse(piece));
			
			halfByte = (byte & (0x0f << 0)) >> 0;
			piece = !halfByte ? null : (numPieces[halfByte] ?? false);
			if (piece === false) {
				throw new Error(`Unknown piece at offset ${i} (hi quartet)`);
			}
			board.push(!piece ? null : pieces.Piece.parse(piece));
		}
		
		this._board = board;
		this._cache = {};
		return this;
	}

	get(coord) {
		coord = Coord.ensure(coord);
		return this._board[coord.valueOf()];
	}

	set(coord, piece) {
		piece = pieces.Piece.ensure(piece);
		coord = Coord.ensure(coord);
		this._board[coord.valueOf()] = piece;
		if (piece.name === 'K') {
			this._cache[piece.code] = coord;
		}
		return this;
	}

	delete(coord) {
		coord = Coord.ensure(coord);
		const piece = this._board[coord.valueOf()];
		this._board[coord.valueOf()] = null;
		if (piece.name === 'K') {
			this._cache[piece.code] = null;
		}
		return this;
	}

	count() {
		return this._board.reduce((res, piece) => res + (piece ? 1 : 0), 0);
	}

	*listEntries(isWhite) {
		isWhite = isWhite == null ? null : !!isWhite;
		for (let i = 0; i < this._board.length; i++) {
			const piece = this._board[i];
			if (!piece) {
				continue;
			}
			if (isWhite != null && piece.isWhite !== isWhite) {
				continue;
			}
			yield [i, piece];
		}
	}

	findKing(isWhite) {
		if (isWhite == null) {
			throw new Error(`Parameter isWhite is required`);
		}
		isWhite = !!isWhite;
		const pieceCode = isWhite ? 'K' : 'k';
		if (this._cache[pieceCode]) {
			return this._cache[pieceCode];
		}
		for (const [coordI, piece] of this.listEntries(isWhite)) {
			if (piece && piece.name === 'K') {
				const coord = Coord.fromIndex(coordI);
				this._cache[pieceCode] = coord;
				return coord;
			}
		}
		throw isWhite ? new Error(`White king is missing`) : new Error(`Black king is missing`);
	}

	isAttacked(dst, byWhite) {
		if (byWhite == null) {
			throw new Error(`Parameter byWhite is required`);
		}
		for (const src of this.listAttacks(dst, byWhite)) {
			return true;
		}
		return false;
	}

	*_listMoves(src, skipFinCheck) {
		src = Coord.ensure(src);
		const piece = this.get(src);
		if (!piece) {
			return;
		}
		const moves = piece.getMoves(this, src);
		for (const dst in moves) {
			const move = moves[dst];
			if (move instanceof MoveCapture && move.capPiece.name === 'K') {
				continue;
			}
			const state = this.clone();
			state._applyMove(move, true);
			const kingCoord = state.findKing(piece.isWhite);
			if (state.isAttacked(kingCoord, !piece.isWhite)) {
				continue;
			}
			if (!skipFinCheck) {
				move.fin = state._checkFin(piece.isWhite);
			}
			yield move;
		}
	}

	*listMoves(src) {
		yield* this._listMoves(src, false);
	}

	*listAttacks(dst, byWhite) {
		if (byWhite == null) {
			throw new Error(`Parameter byWhite is required`);
		}
		dst = Coord.ensure(dst);
		for (const [srcIndex, piece] of this.listEntries(byWhite)) {
			const src = Coord.fromIndex(srcIndex);
			if (piece.canAttack(this, src, dst)) {
				yield src;
			}
		}
	}

	_applyMove(move, skipFinCheck) {
		const preFen = move.preFen ? null : this.toFen();
		move = this.normMove(move);
		if (move instanceof MoveCapture) {
			this.delete(move.cap);
		}
		if (move.mut) {
			// TODO: CHECK!!!
			this.set(move.dst, move.mut);
		}
		else {
			this.set(move.dst, move.piece);
		}
		this.delete(move.src);
		if (move instanceof MoveCastling) {
			this.delete(move.src2);
			this.set(move.dst2, move.piece2);
		}
		if (move.patchStateEnPassant != null && String(this._enPassant) !== String(move.patchStateEnPassant)) {
			this._enPassant = move.patchStateEnPassant;
		}
		else {
			this._enPassant = null;
		}
		if (move.patchStateCastling != null) {
			for (const k in move.patchStateCastling) {
				if (this._castling[k] === move.patchStateCastling[k]) {
					delete move.patchStateCastling[k];
				}
				else {
					this._castling[k] = move.patchStateCastling[k];
				}
			}
		}
		this._activeWhite = !this._activeWhite;
		
		if (move instanceof MoveCapture || move.piece instanceof pieces.PieceP) {
			this._halfmoveClock = 0;
		}
		else {
			this._halfmoveClock++;
		}
		if (this._activeWhite) {
			this._fullmoveNumber++;
		}
		
		if (!skipFinCheck) {
			move.fin = this.checkFin();
		}
		if (!move.preFen) {
			move.preFen = preFen;
		}
		move.postFen = this.toFen();
		return move;
	}

	applyMove(move) {
		return this._applyMove(move, false);
	}

	normMove(abbr) {
		if (abbr instanceof Move) {
			const move = abbr;
			if (move.mut) {
				move.mut = pieces.Piece.ensure(move.mut);
				move.mut.isWhite = move.piece.isWhite;
			}
			return move;
		}
		const preChecks = {
			srcA: null,
			srcN: null,
			srcPiece: null,
		};
		const checks = {
			castling: null,
			dstA: null,
			dstN: null,
			capture: null,
			capA: null,
			capN: null,
			// capPiece: null,
			mut: null,
		};
		let s = abbr.toString();
		let m;
		s = s.replace(/[+#!?]*$/g, '');
		if (m = /=([A-Z])$/i.exec(s)) {
			checks.mut = m[1];
			s = s.slice(0, -2);
		}
		s = s.replace(/[+#!?]*$/g, '');
		if (m = /^o-o(-o)?$/i.exec(s)) {
			checks.castling = m[1] ? true : false;
		}
		else if (m = /^([a-z])(\d)x?([a-z])(\d)$/.exec(s)) {
			preChecks.srcA = m[1];
			preChecks.srcN = m[2];
			checks.dstA = m[3];
			checks.dstN = m[4];
		}
		else if (m = /^([A-Z])x([a-z])(\d)$/.exec(s)) {
			preChecks.srcPiece = m[1];
			checks.capture = true;
			checks.dstA = m[2];
			checks.dstN = m[3];
		}
		else if (m = /^([a-z])x([a-z])(\d)$/.exec(s)) {
			preChecks.srcA = m[1];
			checks.capture = true;
			checks.dstA = m[2];
			checks.dstN = m[3];
		}
		else if (m = /^([a-z])(\d)$/.exec(s)) {
			preChecks.srcPiece = 'P';
			checks.dstA = m[1];
			checks.dstN = m[2];
		}
		else if (m = /^([A-Z])([a-z])(\d)$/.exec(s)) {
			preChecks.srcPiece = m[1];
			checks.dstA = m[2];
			checks.dstN = m[3];
		}
		else if (m = /^([A-Z])([a-z])([a-z])(\d)$/.exec(s)) {
			preChecks.srcPiece = m[1];
			preChecks.srcA = m[2];
			checks.dstA = m[3];
			checks.dstN = m[4];
		}
		else if (m = /^([A-Z])?([a-z])(\d)(x)?([A-Z])?([a-z])(\d)$/.exec(s)) {
			preChecks.srcPiece = m[1];
			preChecks.srcA = m[2];
			preChecks.srcN = m[3];
			checks.capture = m[4] ? true : null;
			// checks.capPiece = m[5];
			checks.dstA = m[6];
			checks.dstN = m[7];
		}
		else {
			throw new Error(`Unable to parse move ${JSON.stringify(s)}`);
		}
		
		let res;
		
		for (const [coordI, piece] of this.listEntries(this.activeWhite)) {
			if (preChecks.srcPiece != null && piece.name !== preChecks.srcPiece) {
				continue;
			}
			const coord = Coord.fromIndex(coordI);
			if (preChecks.srcA != null && coord.a !== preChecks.srcA) {
				continue;
			}
			if (preChecks.srcN != null && coord.n !== preChecks.srcN) {
				continue;
			}
			for (const move of this._listMoves(coord, true)) {
				if (checks.castling != null) {
					if (move instanceof MoveCastling === false || checks.castling !== move.isLong) {
						continue;
					}
				}
				if (checks.dstA != null && checks.dstA !== move.dst.a) {
					continue;
				}
				if (checks.dstN != null && checks.dstN !== move.dst.n) {
					continue;
				}
				if (checks.capture != null && checks.capture !== move instanceof MoveCapture) {
					continue;
				}
				if (checks.mut != null) {
					if (move.mut == null) {
						continue;
					}
					move.mut = pieces.Piece.parse(checks.mut);
					move.mut.isWhite = piece.isWhite;
				}
				
				const state = this.constructor.fromFen(move.postFen);
				if (state._checkFin(!piece.isWhite) !== false) {
					continue;
				}
				
				if (res) {
					throw new Error(`Ambigous move ${JSON.stringify(s)}`);
				}
				res = move;
			}
		}
		
		if (!res) {
			throw new Error(`Unable to find move ${JSON.stringify(s)}`);
		}
		if (abbr instanceof MoveAbbr) {
			res.children = abbr.children;
			if (abbr.match.groups.ext != null) {
				res.ext = abbr.match.groups.ext;
			}
		}
		return res;
	}

	_checkFin(byWhite) {
		if (byWhite == null) {
			throw new Error(`Parameter byWhite is required`);
		}
		if (this._halfmoveClock > 50) {
			return FIN_DRAW_RULE_50;
		}
		const kingCoord = this.findKing(!byWhite);
		const isKingAttacked = this.isAttacked(kingCoord, byWhite);
		let canEscape = false;
		for (const [coordI, piece] of this.listEntries(!byWhite)) {
			const src = Coord.fromIndex(coordI);
			for (const move of this._listMoves(src, true)) {
				const state = this.clone();
				state._applyMove(move, true);
				const kingCoord2 = kingCoord.index === move.src.index
					? move.dst // king moved
					: kingCoord // another piece moved, king stand still
				;
				if (!state.isAttacked(kingCoord2, byWhite)) {
					canEscape = true;
					break;
				}
			}
			if (canEscape) {
				break;
			}
		}
		if (!isKingAttacked && !canEscape) {
			return FIN_DRAW;
		}
		else if (isKingAttacked && canEscape) {
			return FIN_CHECK;
		}
		else if (isKingAttacked && !canEscape) {
			return FIN_CHECKMATE;
		}
		return false;
	}

	checkFin() {
		return this._checkFin(!this.activeWhite);
	}

	guessMove(state2) {
		if (!(state2 instanceof this.constructor)) {
			state2 = this.constructor.fromFen(state2);
		}
		const add = [];
		const del = [];
		const mod = [];
		for (let coordI = this.constructor.SIZE * this.constructor.SIZE - 1; coordI >= 0; coordI--) {
			const piece1 = this._board[coordI];
			const piece2 = state2._board[coordI];
			if (piece2 && !piece1) {
				add.push({ coordI, piece: piece2 });
			}
			else if (piece1 && !piece2) {
				del.push({ coordI, piece: piece1 });
			}
			else if (piece1 && piece2 && piece1.code !== piece2.code) {
				mod.push({ coordI, piece1, piece2 });
			}
		}
		let src, dst, mut;
		// if (add.length === 1 && del.length === 1 && mod.length === 1) {
		if (add.length === 2 && del.length === 2 && mod.length === 0) {
			if (del[0].piece.name === 'K') {
				src = Coord.fromIndex(del[0].coordI);
			}
			else {
				src = Coord.fromIndex(del[1].coordI);
			}
			if (add[0].piece.name === 'K') {
				dst = Coord.fromIndex(add[0].coordI);
			}
			else {
				dst = Coord.fromIndex(add[1].coordI);
			}
		}
		if (add.length === 1 && del.length === 1 && mod.length === 0) {
			src = Coord.fromIndex(del[0].coordI);
			dst = Coord.fromIndex(add[0].coordI);
			if (del[0].piece.isWhite === add[0].piece.isWhite && del[0].piece.name !== add[0].piece.name) {
				mut = pieces.Piece.parse(add[0].piece.code);
			}
		}
		if (add.length === 0 && del.length === 1 && mod.length === 1) {
			src = Coord.fromIndex(del[0].coordI);
			dst = Coord.fromIndex(mod[0].coordI);
			if (del[0].piece.isWhite === mod[0].piece2.isWhite && del[0].piece.name !== mod[0].piece2.name) {
				mut = pieces.Piece.parse(mod[0].piece2.code);
			}
		}
		if (add.length === 1 && del.length === 2 && mod.length === 0) {
			// enPassant
			src = Coord.fromIndex(del[0].coordI);
			dst = Coord.fromIndex(add[0].coordI);
			if (src.x === dst.x) {
				src = Coord.fromIndex(del[1].coordI);
			}
		}
		if (!src || !dst) {
			throw new Error(`Unable to guess move`);
		}
		const moveAbbr = src.txt + dst.txt + (!mut ? '' : `=${mut.code}`);
		const move = this.clone().applyMove(moveAbbr);
		if (move.postFen !== state2.toFen()) {
			throw new Error(`Move found, but target state mismatch`);
		}
		return move;
	}
}
