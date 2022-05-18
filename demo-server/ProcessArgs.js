export default class ProcessArgs extends Array {
	params = {};
	arrays = {};
	
	constructor(args) {
		super();
		if (args && args.length) {
			this.parse(args);
		}
	}
	
	getValue(name, fallback) {
		return typeof this.params[name] !== 'undefined' ? this.params[name] : fallback;
	}
	
	parse(args) {
		var restPositional = false;
		var key, val;
		for (var i = 0; i < args.length; i++) {
			var cur = args[i];
			if (cur === '-' || cur === '--') {
				restPositional = true;
				continue;
			}
			var next = args[i + 1];
			if (cur[0] !== '-' || restPositional) {
				cur = cur[0] !== '\\' ? cur : cur.slice(1);
				this.push(cur);
				continue;
			}
			else if (cur[1] !== '-') {
				key = cur[1];
				if (cur.length > 2) {
					val = cur.slice(2);
				}
				else if (next === undefined || next[0] === '-') {
					val = true;
				}
				else {
					val = next[0] !== '\\' ? next : next.slice(1);
					i++;
				}
			}
			else if (next === undefined || next[0] === '-') {
				key = cur.replace(/^--?/, '');
				val = true;
			}
			else {
				key = cur.replace(/^--?/, '');
				val = next === undefined ? true : (
					next[0] !== '\\' ? next : next.slice(1)
				);
				i++;
			}
			this.params[key] = val;
			(this.arrays[key] = (this.arrays[key] || [])).push(val);
		}
		
		return this;
	}
	
	fillTree(tree, nameSeparator = '.') {
		const get = (obj, path) => {
			if (obj === undefined || path.length === 0) {
				return obj;
			}
			return get(obj[path[0]], path.slice(1));
		};
		const set = (obj, path, value) => {
			if (obj === undefined || path.length === 0) {
				return null;
			}
			if (path.length === 1) {
				obj[path[0]] = value;
				return obj;
			}
			else {
				return set(obj[path[0]], path.slice(1), value);
			}
		};
		
		for (const pathStr in this.params) {
			const path = pathStr.split(nameSeparator);
			const currentValue = get(tree, path);
			const currentType = typeof currentValue;
			let newValue = this.params[pathStr];
			if (currentValue instanceof Array) {
				currentValue.splice(0, currentValue.length, ...this.arrays[pathStr]);
			}
			else if (currentType === 'boolean') {
				newValue = newValue == 0 ? false : !!newValue;
				set(tree, path, newValue);
			}
			else if (currentType === 'number') {
				newValue = +newValue;
				set(tree, path, newValue);
			}
			else {
				set(tree, path, newValue);
			}
		}
		
		return tree;
	}
}
