export default class Comment extends String {
	toString() {
		return super.toString();
	}

	toPgnString() {
		return '{ ' + super.toString() + ' }';
	}
}
