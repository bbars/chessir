import MoveBase from './MoveBase.js';
import Comment from './Comment.js';
import Coord from './Coord.js';
import History from './History.js';
import { EventTarget, CustomEvent } from './events.js';

function dispatchEvent(target, eventType, detail) {
	target.dispatchEvent(new CustomEvent(eventType, {
		detail: detail,
		bubbles: true,
	}));
}

export default class GameUiBridge {
	game;
	elBoard;
	elHistory;
	events;
	listeners = [];
	_selected = null;

	constructor({ game, elBoard, elHistory }) {
		this.game = game;
		this.elBoard = elBoard;
		this.elHistory = elHistory;
		this.events = new EventTarget();
		this._initListeners();
		if (this.elHistory) {
			this._historyInsert(game.history, this.elHistory);
			this.elHistory.tabIndex = this.elHistory.tabIndex;
		}
		if (this.elBoard) {
			// this.elBoard.state = this.game.state;
		}
		game.setPos(game.pos); // trigger event listeners
	}

	destroy() {
		this._deinitListeners();
	}

	_deinitListeners() {
		for (const { target, type, listener, options } of this.listeners) {
			target.removeEventListener(type, listener, options);
		}
		const res = this.listeners.length;
		this.listeners.splice(0, this.listeners.length);
		return res;
	}

	_initListener(target, type, listener, options) {
		target.addEventListener(type, listener, options);
		const listenerOpts = {
			target,
			type,
			listener,
			options,
		};
		return this.listeners.push(listenerOpts);
	}

	_initListeners() {
		if (this.elBoard) {
			this._initListener(this.elBoard, 'chessClick', this.$onBoardChessClick.bind(this));
		}
		if (this.game) {
			this._initListener(this.game.events, 'changePos', this.$onGameChangePos.bind(this));
			this._initListener(this.game.events, 'applyMove', this.$onGameApplyMove.bind(this));
		}
		if (this.elHistory) {
			this._initListener(this.elHistory, 'click', this.$onHistoryClick.bind(this));
			this._initListener(this.elHistory, 'keydown', this.$onHistoryKeyDown.bind(this));
		}
	}

	_createHistoryElement(item) {
		let elItem;
		if (item instanceof History) {
			elItem = document.createElement('span');
			elItem.dataset.type = 'history';
		}
		else if (item instanceof Comment) {
			elItem = document.createElement('span');
			elItem.dataset.type = 'comment';
			elItem.textContent = item.toString(true);
		}
		else if (item instanceof MoveBase) {
			elItem = document.createElement('span');
			elItem.dataset.type = 'move';
			elItem.dataset.color = !item.piece ? '' : item.piece.isWhite ? 'w' : 'b';
			const elItemContent = document.createElement('button');
			elItemContent.textContent = item.toString(true);
			elItem.appendChild(elItemContent);
		}
		elItem.dataset.constructorName = item.constructor.name;
		return elItem;
	}

	_historyInsert(item, elParent, pos = []) {
		if (!(elParent instanceof HTMLElement)) {
			throw new Error(`Parameter 'elParent' must be a HTMLElement`);
		}
		if (pos.length > 1) {
			const index = pos[0];
			const elIndex = elParent.dataset.type === 'move' ? index + 1 : index;
			if (!elParent.children[elIndex]) {
				const parentPos = this._historyResolvePos(elParent);
				const wrapper = this.game.history.getItem(parentPos.concat([index]));
				elParent.appendChild(this._createHistoryElement(wrapper));
			}
			return this._historyInsert(item, elParent.children[elIndex], pos.slice(1));
		}
		const elItem = this._createHistoryElement(item);
		if (item instanceof History) {
			for (let i = 0; i < item.length; i++) {
				this._historyInsert(item[i], elItem, [i]);
			}
		}
		else if (item instanceof MoveBase) {
			if (item.children && item.children.length) {
				for (let i = 0; i < item.children.length; i++) {
					this._historyInsert(item.children[i], elItem, [i]);
				}
				elItem.dataset.hasChildren = '';
			}
			elItem.dataset.fullmoveNumber = item.preFen.replace(/^.*?\s+(\d+)$/, '$1');
		}
		if (pos.length === 0) {
			while (elParent.children[0]) {
				elParent.removeChild(elParent.children[0]);
			}
			while (elItem.children[0]) {
				elParent.appendChild(elItem.children[0]);
			}
			for (const k in elItem.dataset) {
				elParent.dataset[k] = elItem.dataset[k];
			}
			return elParent;
		}
		const elIndex = elParent.dataset.type === 'move' ? pos[0] + 1 : pos[0];
		if (elParent.dataset.type === 'move') {
			elParent.dataset.hasChildren = '';
		}
		elParent.insertBefore(elItem, elParent.children[elIndex]);
		return elItem;
	}

	_historyResolvePos(el) {
		if (!(this.elHistory instanceof HTMLElement)) {
			throw new Error(`Can't resolve history pos: property 'elHistory' must be a HTMLElement`);
		}
		if (el === this.elHistory) {
			return [];
		}
		const elParent = el.parentElement;
		let index = Array.prototype.indexOf.call(elParent.children, el);
		if (elParent.dataset.type === 'move') {
			index -= 1;
		}
		if (elParent === this.elHistory) {
			return [index];
		}
		return this._historyResolvePos(elParent).concat([index]);
	}

	_historyResolveElement(pos, cb) {
		const run = (elHistory, pos) => {
			const elMove = elHistory.children[pos[0]];
			if (cb) {
				cb(elMove, elHistory);
			}
			if (pos.length === 1) {
				return elMove;
			}
			const elChildHistory = elMove.children[pos[1] + 1];
			return run(elChildHistory, pos.slice(2));
		};
		return run(this.elHistory, pos);
	}

	_historySelect(pos) {
		this.elHistory.querySelectorAll('.active, .selected, .altered').forEach((el) => {
			el.classList.remove('active', 'selected', 'altered');
		});
		const el = this._historyResolveElement(pos, (elMove, elHistory) => {
			elHistory.classList.add('active');
			if (!elMove) {
				return;
			}
			for (const el of elHistory.children) {
				if (el === elMove) {
					el.classList.add('altered');
					break;
				}
				el.classList.add('active');
			}
		});
		if (el) {
			el.classList.add('active', 'selected');
		}
		return el;
	}

	deselect() {
		this._selected = null;
		this.elBoard.dots = '';
	}

	select(coord) {
		coord = Coord.ensure(coord);
		this.deselect();
		const piece = this.game.get(coord);
		const moveDots = this.elBoard.showMoveDots(coord);
		this.elBoard.dots = moveDots;
		if (moveDots.length) {
			this._selected = { piece, coord };
		}
	}

	// abstracts:

	getPlayWhite() {
		throw new Error(`Not implemented`);
		// return true | false | null;
	}

	async beforeApplyMove(move, curPos) {
		throw new Error(`Not implemented`);
		/**
		 * Change move.mut if needed
		 */
	}

	// events:

	async $onBoardChessClick(event) {
		const game = this.game;
		const playWhite = this.getPlayWhite();
		if (playWhite === null || playWhite !== game.activeWhite) {
			return;
		}
		const coord = event.detail.coord;
		const piece = game.get(coord);
		
		if (this._selected) {
			if (coord.txt === this._selected.coord.txt) {
				this.deselect();
				return;
			}
			else if (piece && piece.isWhite === this._selected.piece.isWhite) {
				this.select(coord);
				return;
			}
			else {
				const moveAbbr = this._selected.coord.txt + coord.txt;
				let move = game.normMove(moveAbbr);
				const curPos = game.pos;
				move = await this.beforeApplyMove(move, curPos);
				if (!move) {
					return;
				}
				move = game.applyMove(move);
				this.deselect();
			}
		}
		else if (piece && piece.isWhite === game.activeWhite) {
			this.select(coord);
		}
	}

	$onGameChangePos(event) {
		const game = this.game;
		const pos = event.detail.pos;
		const move = game.getCurrentMove();
		if (this.elBoard) {
			this.elBoard.setState(game.state);
			this.elBoard.showArrows(move);
			this.elBoard.dots = '';
		}
		this._selected = false;
		if (this.elHistory) {
			const el = this._historySelect(pos);
			if (!el) {
				// do nothing
			}
			else if (el.scrollIntoViewIfNeeded) {
				el.scrollIntoViewIfNeeded();
			}
			else {
				el.scrollIntoView();
			}
		}
	}

	$onGameApplyMove(event) {
		if (this.elHistory) {
			const elMove = this._historyInsert(event.detail.move, this.elHistory, event.detail.pos);
			if (elMove.scrollIntoViewIfNeeded) {
				elMove.scrollIntoViewIfNeeded();
			}
			else {
				elMove.scrollIntoView();
			}
		}
		if (this.elBoard) {
			this.elBoard.dots = '';
		}
		this._selected = false;
	}

	$onHistoryClick(event) {
		if (!event.target.matches('button')) {
			return;
		}
		const elMove = event.target.closest('[data-type="move"]');
		if (!elMove) {
			return;
		}
		const pos = this._historyResolvePos(elMove);
		this.game.setPos(pos);
	}

	async $onHistoryKeyDown(event) {
		const pos = this.game.pos;
		if (event.keyCode === 37) {
			const pos2 = this.game.history.findPrevMovePath(pos);
			if (!pos2 || pos.length === pos2.length) {
				await this.game.seekPrev();
			}
		}
		else if (event.keyCode === 39) {
			const pos2 = this.game.history.findNextMovePath(pos);
			if (!pos2 || pos.length === pos2.length) {
				await this.game.seekNext();
			}
		}
		else if (event.keyCode === 38) {
			await this.game.seekOut();
		}
		else if (event.keyCode === 40) {
			await this.game.seekInto();
		}
		else {
			// console.log(event.keyCode, event);
			return;
		}
		event.preventDefault();
	}
}
