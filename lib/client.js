var google = require('google');
var EventEmitter = require('events').EventEmitter;

google.resultsPerPage = 100;

function Google () {

}

Google.prototype = new EventEmitter();

Google.prototype._onPage = function (err, next, res) {
	var cancelled = false;
	
	function setCancelled () {
		cancelled = true;
		this.emit("end");
	}

	if (err) this.emit('error', err);
	
	for (var i=0, n=res.length; i<n; i++) {
		this.emit("result", res[i]);
		if (cancelled) return;
	}
	
	if (next) {
		next();
	} else {
		this.emit("end");
	}
};

Google.prototype.start = function (q) {
	google(q, this._onPage.bind(this));
//	this.start = function () {};
};

module.exports = {
	Google: Google
};