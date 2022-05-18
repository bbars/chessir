import MoveBase from './MoveBase.js';

export default class MoveAbbr extends MoveBase {
	constructor(match) {
		super();
		this.text = match.groups.movemut;
		this.match = match;
	}

	toString() {
		return this.text;
	}
}
