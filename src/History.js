import State from './State.js';
import Move from './Move.js';

export default class History extends Array {
	initialState;

	constructor(initialState) {
		super();
		this.initialState = initialState ? State.fromFen(initialState) : null;
	}

	toString() {
		return this.toPgn();
	}

	toPgn() {
		return this._toPgn(this.initialState.activeWhite, this.initialState.fullmoveNumber);
	}

	_toPgn(activeWhite, fullmoveNumber) {
		let res = '';
		const renderMove = (move, activeWhite, fullmoveNumber) => {
			if (fullmoveNumber) {
				res += ' '
					+ fullmoveNumber.toString()
					+ (activeWhite ? '.' : '...')
				;
			}
			res += ' ' + move.toPgnString();
			let childrenRendered = false;
			for (const child of move.children) {
				childrenRendered = true;
				if (child instanceof this.constructor) {
					res += ' (' + child._toPgn(activeWhite, fullmoveNumber) + ')';
				}
				else if (child instanceof Comment) {
					res += ' ' + child.toPgnString();
				}
				else {
					res += ' { ' + child.toString() + ' }';
				}
			}
			return childrenRendered;
		};
		let i = 0;
		if (!activeWhite) {
			renderMove(this[0], false, fullmoveNumber);
			fullmoveNumber++;
			i++;
		}
		let childrenRendered;
		for (i; i < this.length; i += 2) {
			childrenRendered = renderMove(this[i], true, fullmoveNumber);
			if (!this[i + 1]) {
				break;
			}
			renderMove(this[i + 1], false, childrenRendered ? fullmoveNumber : null);
			fullmoveNumber++;
		}
		return res.slice(1);
	}

	async parseMoves(maxDepth = 1) {
		const state = this.initialState.clone();
		let counter = 0;
		for (let i = 0; i < this.length; i++) {
			const item = this[i];
			let move = item instanceof Move
				? item
				: state.normMove(item)
			;
			
			if (maxDepth > 1 && move.children.length > 0) {
				for (const child of move.children) {
					if (child instanceof this.constructor) {
						if (!child.initialState) {
							child.initialState = state.clone()
						}
						child.parseMoves(maxDepth - 1);
					}
				}
			}
			
			state.applyMove(move);
			
			if (move !== item) {
				this[i] = move;
			}
			
			if (++counter % 20 === 0) {
				await new Promise(r => setTimeout(r));
			}
		}
	}

	*_resolvePathElements(path) {
		path = path instanceof Array ? path : [path];
		if (path.length % 2 === 0) {
			throw new Error(`Unable to resolve move by path: pointing to a History, but not a move`);
		}
		let history = this;
		yield [history, path[0]];
		for (let i = 0; i < path.length - 2; i += 2) {
			let move = history[path[i]];
			history = move.children[path[i + 1]];
			yield [history, path[i + 2]];
			if (!(history instanceof this.constructor)) {
				throw new Error(`Unable to resolve move by path: not a History`);
			}
		}
	}

	getMove(path) {
		let history;
		let moveIndex;
		for ([history, moveIndex] of this._resolvePathElements(path)) {}
		return history[moveIndex] || null;
	}

	async getMoveParsed(path) {
		let history;
		let moveIndex;
		let lastMove;
		for ([history, moveIndex] of this._resolvePathElements(path)) {
			if (!(history[moveIndex] instanceof Move)) {
				if (!history.initialState) {
					history.initialState = State.fromFen(lastMove.preFen);
				}
				await history.parseMoves(1);
			}
			lastMove = history[moveIndex];
		}
		return lastMove;
	}

	findNextMovePath(path) {
		path = [].concat(path);
		path[path.length - 1] += 1;
		while (path.length >= 1) {
			const move = this.getMove(path);
			if (move) {
				return path;
			}
			path.splice(-2);
		}
	}

	findPrevMovePath(path) {
		path = [].concat(path);
		path[path.length - 1] -= 1;
		while (path.length >= 1) {
			if (path[path.length - 1] >= 0) {
				return path;
			}
			path.splice(-2);
		}
	}

	addNextMove(path, move) {
		path = [].concat(path);
		path[path.length - 1] += 1;
		let nextMove = this.getMove(path);
		if (nextMove) {
			path.push(nextMove.children.length, 0);
			nextMove.children.push(new this.constructor(nextMove instanceof Move ? nextMove.preFen : null));
		}
		let history;
		let moveIndex;
		for ([history, moveIndex] of this._resolvePathElements(path)) {}
		history[moveIndex] = move;
		return path;
	}
}
