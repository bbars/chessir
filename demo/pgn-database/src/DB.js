import sqlite3 from 'sqlite3';



export default class DB {
	sqlite;
	conf;
	
	constructor(conf) {
		this.sqlite = null;
		const defaultConf = {
			filename: ':memory:',
			mode: null,
			journalMode: null,
		};
		this.conf = conf && typeof conf === 'object' ? conf : {};
		for (const k in defaultConf) {
			if (typeof this.conf[k] === 'undefined') {
				this.conf[k] = defaultConf[k];
			}
		}
	}
	
	async init(models) {
		this.sqlite = new sqlite3.Database(this.conf.filename, this.conf.mode);
		
		if (this.conf.journalMode) {
			if (!/^(DELETE|TRUNCATE|PERSIST|MEMORY)$/.test(this.conf.journalMode)) {
				throw new Error("Invalid value for journalMode: " + this.conf.journalMode);
			}
			await this.run('PRAGMA journal_mode = ' + this.conf.journalMode);
		}
		
		if (models) {
			for (const model of models) {
				await this.run(model.getCreateTableSQL());
			}
		}
		
		return this;
	}
	
	async run(sql, values) {
		return new Promise((resolve, reject) => {
			this.sqlite.run(sql, values, function (err, res) {
				if (err) {
					reject(err);
				}
				else {
					resolve(this);
				}
			});
		});
	}

	async exec(sql) {
		return new Promise((resolve, reject) => {
			this.sqlite.exec(sql, function (err, res) {
				if (err) {
					reject(err);
				}
				else {
					resolve(res);
				}
			});
		});
	}

	async query(sql, values, model) {
		const fromSQL = !model ? null : model.fromSQL ? model.fromSQL.bind(model) : model;
		return new Promise((resolve, reject) => {
			this.sqlite.all(sql, values, function (err, res) {
				if (err) {
					reject(err);
				}
				else if (fromSQL) {
					resolve(res.map(fromSQL));
				}
				else {
					resolve(res);
				}
			});
		});
	}

	async queryOne(sql, values, model) {
		const fromSQL = !model ? null : model.fromSQL ? model.fromSQL.bind(model) : model;
		return new Promise((resolve, reject) => {
			this.sqlite.get(sql, values, function (err, res) {
				if (err) {
					reject(err);
				}
				else if (res == null) {
					resolve(null);
				}
				else if (fromSQL) {
					resolve(fromSQL(res));
				}
				else {
					resolve(res);
				}
			});
		});
	}

	async * queryEach(sql, values, model) {
		const fromSQL = !model ? null : model.fromSQL ? model.fromSQL.bind(model) : model;
		const ready = [];
		const queue = [];
		let isComplete = false;
		const EOF = Symbol('EOF');
		const cbFn = (err, item) => {
			const q = queue.shift();
			if (!q) {
				ready.push({ err, item });
				return;
			}
			if (err) {
				q.reject(err);
			}
			else {
				q.resolve(item);
			}
		};
		const completeFn = () => {
			isComplete = true;
			queue.forEach((q) => {
				q.resolve(EOF);
			});
		};
		this.sqlite.each(sql, values, cbFn, completeFn);
		let item;
		while (!isComplete || ready.length > 0) {
			const r = ready.shift();
			if (r) {
				if (r.err) {
					throw r.err;
				}
				item = r.item;
			}
			else if (isComplete) {
				break;
			}
			else {
				const promise = new Promise((resolve, reject) => {
					queue.push({ resolve, reject });
				});
				item = await promise;
				if (item === EOF) {
					break;
				}
			}
			yield !fromSQL ? item : fromSQL(item);
		}
	}

	static escapeLike(str) {
		if (typeof str !== 'string') {
			str = str == null ? '' : str.toString();
		}
		return str.replace(/[\\_%]/g, '\\$&');
	}
}
