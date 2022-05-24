import MoveBase from './MoveBase.js';
import Comment from './Comment.js';
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
		this._historyInsert(game.history, this.elHistory);
		this.elBoard.state = this.game.state;
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
			if (item.children) {
				for (let i = 0; i < item.children.length; i++) {
					this._historyInsert(item.children[i], elItem, [i]);
				}
			}
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
		elParent.insertBefore(elItem, elParent.children[pos[0]]);
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

	_historyResolveElement(pos) {
		const run = (elHistory, pos) => {
			if (pos.length === 1) {
				elHistory.children[pos[0]].classList.add('selected');
				return elHistory.children[pos[0]];
			}
			const elMove = elHistory.children[pos[0]];
			let elChildHistory = elMove.children[pos[1] + 1];
			return run(elChildHistory, pos.slice(2));
		};
		return run(this.elHistory, pos);
	}

	_historySelect(pos) {
		this.elHistory.querySelectorAll('.selected').forEach((el) => {
			el.classList.remove('selected');
		});
		const el = this._historyResolveElement(pos);
		el.classList.add('selected');
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
				this.elBoard.dots = '';
				this._selected = null;
				return;
			}
			else if (piece && piece.isWhite === this._selected.piece.isWhite) {
				this.elBoard.dots = '';
				this._selected = null;
				return await this.$onBoardChessClick(event);
			}
			else {
				const moveAbbr = this._selected.coord.txt + coord.txt;
				let move = game.normMove(moveAbbr);
				const curPos = game.pos;
				move = (await this.beforeApplyMove(move, curPos)) || move;
				move = game.applyMove(move);
				this._selected = null;
			}
		}
		else if (piece && piece.isWhite === game.activeWhite) {
			const moveDots = this.elBoard.showMoveDots(coord);
			this.elBoard.dots = moveDots;
			if (moveDots.length) {
				this._selected = { piece, coord };
			}
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
			this._historySelect(pos);
		}
	}

	$onGameApplyMove(event) {
		if (this.elHistory) {
			this._historyInsert(event.detail.move, this.elHistory, event.detail.pos);
		}
		if (this.elBoard) {
			this.elBoard.dots = '';
		}
		this._selected = false;
	}

	$onHistoryClick(event) {
		const elMove = event.target.closest('[data-type="move"]');
		if (!elMove) {
			return;
		}
		const pos = this._historyResolvePos(elMove);
		this.game.setPos(pos);
	}
}
