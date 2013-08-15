var format = require('util').format;
var EventEmitter = require('events').EventEmitter;
var request = require('request');

var SentenceTokenizer = require('sentence').sentence.SentenceTokenizer;

var gc = require('./client');
var MimeType = require('./mimetools').MimeType;
var h2t = require('./soup').htmlToText;
var TaskMan = require('./taskman');

/*

	## TODO
	* Use Q or Async, rather than crapful operation counting logic
	* Use lodash for utility functions
	* rewrite google scraper
	* Only output unique isms.
	* pretty-print isms by stripping leading non-alpha

*/

function stripQuotes(str) {
	return str.replace(/^['"]|['"]$/g, '');
}

function canonicalize(str) {
	return str.replace(/[^a-z]/gi, '');
}

function getSentencesContaining(str, probe, cb) {

	var sentences = [];
	var re = new RegExp(canonicalize(probe), 'i');
	
	function onSentence(s) {
		if (canonicalize(s).match(re)) {
			sentences.push(s);
		}
	}
	
	function onEnd() {
		cb(sentences);
	}

	var tok = new SentenceTokenizer(onSentence, onEnd);
	tok.add(str);
	tok.setEof();
}

function getSentencesFromUrl(url, probe, cb) {

	function onResponse(err, resp, body) {
		if (err) {
			cb([]);
		} else {
			var ct = resp.headers['content-type'] ? resp.headers['content-type'] : 'text/html';
			var mt = MimeType.fromString(ct);
			if (mt.subtype.match(/html/)) {
				getSentencesContaining(h2t(body), probe, cb);
			} else {
				cb([]);
			}
		}
	}

	request({url: url, timeout: 8000}, onResponse);
}

function Googlism(deepSearch) {
	this.deepSearch = deepSearch ? Boolean(deepSearch) : false;
	this._status = {};
}

Googlism.prototype = new EventEmitter();

Googlism.prototype._opStart = function (id, op) {
	var task = this._status[id];
	if (task)
		task.start(op);
};

Googlism.prototype._opEnd = function (id, op) {
	var task = this._status[id];
	if (task)
		task.stop(op);
};

Googlism.prototype._processSearchResult = function (q, id, res) {
	var doSend = this._send.bind(this);
	
	
	function sendIsms(arr) {
		for (var i=0, n=arr.length; i<n; i++)
			doSend(arr[i], res.link, id);
		
		this._opEnd(id, res.link);
	}
	
	if (res.link) {
		if (this.deepSearch) {
				this._opStart(id, res.link);
				getSentencesFromUrl(res.link, q, sendIsms.bind(this));
		} else {
			this._opStart(id, res.link);
			getSentencesContaining(res.description, q, sendIsms.bind(this));
		}
	}
};

Googlism.prototype._send = function (msg, src, id) {
	this.emit('ism', { msg: msg, src: src, id: id });
};

Googlism.prototype._end = function (id) {
	if (this._status[id]) {
		this.emit('end', { id: id });
		delete this._status[id];
	}
};

Googlism.prototype.ask = function (q, id) {
	var g = new gc.Google();
	var task = this._status[id] = new TaskMan(id);

	task.on('end', (function onQueueDone(data) {
		this._end(data.name);
		console.error(format('[INFO] Processed %d queue items.', data.completedTasks));
	}).bind(this));
	
	
	g.on('result', this._processSearchResult.bind(this, q, id));
	
	g.on('end', (function onScrapeDone() {
		console.error(format('[INFO] Google scrape completed.'));
		this._opEnd(id, 'scrape google');
	}).bind(this));

	this._opStart(id, 'scrape google');
	g.start(format('"%s"', q));

};

module.exports = Googlism;

