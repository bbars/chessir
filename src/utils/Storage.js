export default class Storage {
	constructor(onChange, rewriter) {
		if (onChange && typeof onChange !== 'function') {
			throw new Error(`Parameter 'onChange' must be a function (or empty)`);
		}
		if (rewriter && typeof rewriter !== 'function') {
			throw new Error(`Parameter 'rewriter' must be a function (or empty)`);
		}
		return new Proxy(this, {
			get: (target, name) => {
				return target[name];
			},
			set: (target, name, newValue) => {
				const oldValue = target[name];
				if (newValue === undefined) {
					delete target[name];
				}
				else {
					if (rewriter) {
						newValue = rewriter.call(this, newValue);
					}
					target[name] = newValue;
				}
				if (onChange) {
					onChange.call(this, name, newValue, oldValue, target);
				}
				return true;
			},
		});
	}
}
