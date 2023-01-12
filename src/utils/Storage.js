export default class Storage {
	constructor(onChange) {
		if (typeof onChange !== 'function') {
			onChange = null;
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
					newValue = String(newValue);
					target[name] = newValue;
				}
				if (onChange) {
					onChange(name, newValue, oldValue, target);
				}
				return true;
			},
		});
	}
}
