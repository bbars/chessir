export default class Coord {
	static ALPHA_NUMERIC = {
		'a': 0 + 1,
		'b': 1 + 1,
		'c': 2 + 1,
		'd': 3 + 1,
		'e': 4 + 1,
		'f': 5 + 1,
		'g': 6 + 1,
		'h': 7 + 1,
	};
	static ALPHAS = Object.keys(this.ALPHA_NUMERIC);

	#txt = null;
	#x = null;
	#y = null;

	constructor(h, v) {
		if (h instanceof this.constructor) {
			v = h.n;
			h = h.a;
		}
		else if (h instanceof Array) {
			v = h[1];
			h = h[0];
		}
		if (isNaN(h)) {
			const num = this.constructor.txtToNum(h, v);
			this.#txt = h.toString() + v.toString();
			this.#x = +num[0];
			this.#y = +num[1];
		}
		else {
			const txt = this.constructor.numToTxt(h, v);
			this.#txt = txt[0].toString() + txt[1].toString();
			this.#x = +h;
			this.#y = +v;
		}
	}

	get txt() {
		return this.#txt;
	}

	get num() {
		return [this.x, this.y];
	}

	get x() {
		return this.#x;
	}

	get y() {
		return this.#y;
	}

	get a() {
		return this.#txt[0];
	}

	get n() {
		return this.#txt[1];
	}

	get index() {
		return (8 - 1 - this.y) * 8 + this.x;
	}

	toString() {
		return this.txt;
	}

	toPgnString() {
		return this.txt;
	}

	valueOf() {
		return this.index;
	}

	offset(offX, offY) {
		const x = this.x + offX;
		const y = this.y + offY;
		return 0 <= x && x < 8 && 0 <= y && y < 8
			? new this.constructor(x, y)
			: null
		;
	}

	static ensure(value) {
		return value instanceof this ? value : this.parse(value);
	}

	static parse(txtOrNum) {
		const m = /^(?:([abcdefgh][12345678])|([0-7][0-7]))$/i.exec(txtOrNum);
		if (!m) {
			throw new Error(`Invalid coord: '${txtOrNum}'`);
		}
		return m[1]
			? new this(m[1][0], m[1][1])
			: new this(m[2][0], m[2][1])
		;
	}

	static fromTxt(txt) {
		txt = txt.trim().toLowerCase();
		const m = /^[abcdefgh][12345678]$/.exec(txt);
		if (!m) {
			throw new Error(`Invalid txt coord: '${txt}'`);
		}
		return new this(m[0][0], m[0][1]);
	}

	static fromIndex(index) {
		const y = 8 - 1 - (index / 8 | 0);
		const x = index % 8;
		return new this(x, y);
	}

	static txtToNum(a, n) {
		if (!this.ALPHA_NUMERIC[a] || isNaN(n) || n < 1 || n > 8) {
			throw new Error(`Invalid coord: [${a}, ${n}]`);
		}
		return [
			this.ALPHA_NUMERIC[a] - 1,
			n - 1,
		];
	}

	static numToTxt(x, y) {
		if (!this.ALPHAS[x] || isNaN(y) || y < 0 || y > 7 || y % 1) {
			throw new Error(`Invalid coord: ${x}, ${y}`);
		}
		return [
			this.ALPHAS[x],
			(+y) + 1,
		];
	}
}
