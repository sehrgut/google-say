var format = require('util').format;
var rt = require('./regexp-tools');
var client = require('./client');
var request = require('request');
var h2t = require('./soup').htmlToText;
var mt = require('./mimetools');

function stripTags (str) {
	return str.replace(/<[^>]+>/g, '');
}

function compressSpace (str) {
	return str.replace(/\s+/g, ' ');
}

function findPhrase(start, str) {	
	var pat = format("%s.+[\.!?]", rt.quote(start));
	var re = new RegExp(pat, "gi");
	
	return rt.findall(re, str).map(function (x) { return x[0]; });
}

var sentencePat = /[^.!?\s][^.!?]*(?:[.!?](?!['"]?\s|$)[^.!?]*)*[.!?]?['"]?(?=\s|$)/.source;

function findSentences(str) {
	var re = new RegExp(sentencePat, "gm");
	return rt.findall(re, str).map(function (x) { return x[0]; });
}

var results = [];

function onResult (res) {
	res.matches = findSentences(res.description)
		.map(function (s) { return findPhrase("libertarians are", s); })
		.reduce(function (out, val) { if (val.length) return out.concat(val); return out; }, []);
	
	if (res.matches.length) results.push(res);
}

function onEnd () {
	getNext();
}

var g = new client.Google('"libertarians are just"');

g.on("result", onResult)
	.on("end", onEnd)
	.start();

var allMatches = [];

function onResponse (err, resp, body) {
	var ct = resp.headers['content-type'] ? resp.headers['content-type'] : 'text/html';
	var ct = mt.MimeType.fromString(ct);
	
	if (ct.subtype.match(/html/)) {	
		var txt = compressSpace(h2t(body));
		var ss = findSentences(txt);
		var matches = ss.map(function (s) { if (s.match("libertarians are")) return s; })
			.reduce(function (out, val) { if (val) out.push(val); return out;}, []);
		allMatches = allMatches.concat(matches);
	}
	
	getNext();
}


var pagesVisited = 0;
var numResults = results.length;

function getNext() {
	var sr = results.pop();
	if (sr && pagesVisited < 10) {
		if(! (pagesVisited++ % 10)) {
			console.warn(format("Visiting #%d with %d remaining", pagesVisited, results.length));
		} else {
			console.warn(".");
		}
		console.warn(sr.link);
		request(sr.link, onResponse);
	} else {
		for (var j=0, n=allMatches.length; j<n; j++)
			console.log(allMatches[j]);
	}
}


