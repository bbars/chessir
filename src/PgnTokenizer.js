import tokenizerflow from './tokenizerflow.js';

export default class PgnTokenizer extends tokenizerflow.Tokenizer {
	conf;

	constructor(conf = {}) {
		super();
		
		this.conf = Object.assign({
			singleDocument: false,
		}, conf);
		
		this.definePatterns({
			headerOpen: /[\n\s]*\[/,
			headerName: /([^\s\]]+)\s*/,
			
			strOpen: /"/,
			strBsBs: /([^"]*?\\\\)/,
			strBsQ: /([^"]*?\\")/,
			strAny: /([^"]+)/,
			strClose: /"/,
			
			headerClose: /\s*\][\s\n]+/,
			
			body: /[\n\s]*/,
			
			moveNumber: /\s*(\d+)(\.+)/,
			moveText: /\s*((?<movemut>(?<srcdst>o-o-o|o-o|[a-z0-9]+)(?<mut>=[a-z])?)(?<ext>[\?!#\+]+)?)/i,
			
			commentOpen: /\s*\{/,
			commentContents: /\s*([^}]*?)(?=\s*\})/,
			commentClose: /\s*\}/,
			
			altOpen: /\s*\(/,
			altClose: /\s*\)/,
			
			end: /\s*(\d\/\d-\d\/\d|\d-\d\/\d|\d\/\d-\d|0-1|1-0|1|0|\*)/,
			
			eof: /[\s\n]*$/,
		});
		
		if (!this.conf.singleDocument) {
			this.definePatterns({
				documentSeparator: /\r\n\r\n|\n\n/,
				documentWeakSeparator: /\r\n|\n/,
			});
		}
		
		this._ctlCache.cache = {};
		this.setCtlResolver(this._resolveCtl.bind(this));
		
		this.setRootCtl(['headerOpen', 'moveNumber']);
	}

	_ctlCache(name, expectIds, extras) {
		let ctl = this._ctlCache[name];
		if (ctl) {
			ctl.extras = extras;
		}
		else {
			ctl = new tokenizerflow.Ctl(this.getPatterns(expectIds), extras);
			this._ctlCache[name] = ctl;
		}
		return ctl;
	}

	_resolveCtl(token) {
		const extras = {};
		switch (token.patternId) {
			case 'headerOpen':
				extras.prePush = extras.prePush || 'header';
				return this._ctlCache('1', ['headerName'], extras);
			
			case 'headerName':
				return this._ctlCache('2', ['strOpen'], extras);
			
			case 'strOpen':
				extras.prePush = extras.prePush || 'string';
			case 'strBsBs':
			case 'strBsQ':
			case 'strAny':
				return this._ctlCache('3', ['strBsBs', 'strBsQ', 'strAny', 'strClose'], extras);
			
			case 'strClose':
				extras.postPop = extras.postPop || 'string';
				return token.ctx.parent.ctxName === 'header'
					? this._ctlCache('4', ['headerClose'], extras)
					: null
				;
			
			case 'headerClose':
				extras.postPop = extras.postPop || 'header';
				return this._ctlCache('5', ['headerOpen', /*'body',*/ 'moveNumber'], extras);
			
			case 'commentOpen':
				extras.prePush = extras.prePush || 'comment';
				return this._ctlCache('6', ['commentContents'], extras);
			
			case 'commentContents':
				return this._ctlCache('7', ['commentClose'], extras);
			
			case 'altOpen':
				extras.prePush = extras.prePush || 'alt';
				return this._ctlCache('8', ['body'], extras);
			
			case 'body':
				return this._ctlCache('9', ['moveNumber', 'end', 'moveText', 'commentOpen', 'altOpen', 'altClose', 'eof'], extras);
			
			case 'moveNumber':
				return this._ctlCache('10', ['moveText'], extras);
			
			case 'end':
				return this.conf.singleDocument
					? this._ctlCache('11', ['eof'], extras)
					: this._ctlCache('12', ['documentSeparator', 'documentWeakSeparator', 'body'], extras)
				;
			
			case 'commentClose':
				extras.postPop = extras.postPop || 'comment';
			case 'altClose':
				extras.postPop = extras.postPop || 'alt';
			case 'moveText':
				return this.conf.singleDocument
					? this._ctlCache('13', ['body'], extras)
					: this._ctlCache('14', ['documentSeparator', 'body'], extras)
				;
			
			case 'documentSeparator':
			case 'documentWeakSeparator':
				return this._ctlCache('15', ['headerOpen', 'moveNumber'], extras);
		}
	}
}
