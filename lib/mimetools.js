var format = require('util').format;

var mimetools = module.exports;
/*
	## Description
	Parses MIME type strings with RFC 2231 paramters.

	## Bugs
	* Does not implement RFC 2231.4 (Parameter Value Character Set and Language Information)
	* Later copies of a single parameter name clobber earlier copies
	
	## TODO
	* MimeType#serialize(lineLength): split long parameters as RFC 2231.3
	* Strict RFC 2231.3 mode (enforce parameter continuation numbering consistency)
	* Canonicalize parameters to alphabetical
	
*/
function omap(o, cb) {
	var out = [];
	
	for (key in o)
		if (o.hasOwnProperty(key))
			out.push(cb(o[key], key, o));
	
	return out;
}

function firstMatch(re, arr) {
	return arr.map(function (x) {
		return x.match(re);
	}).reduce(function (val, el) {
		return val || el;
	});
}

function joinQuoted(arr, sep) {
	sep = sep ? sep : '';	
	var q = firstMatch(/^['"]/, arr) || '';
	
	arr = arr.slice(0).map(function (x) {
		return x.replace(/^['"]|['"]$/g, '');
	});

	return format('%s%s%s', q[0], arr.join(sep), q[0]);
}

mimetools.MimeType = function(type, subtype, params) {
	this.type = type ? type : '';
	this.subtype = subtype ? subtype : '';
	this.params = {};
}

mimetools.MimeType.prototype.toString = function () {
	var parts = [ (this.subtype ? format('%s/%s', this.type, this.subtype) : this.type) ];
	parts = parts.concat(omap(this.params, function (v, k) { return format('%s=%s', k, v); }));
	return parts.join('; ');
};

function assembleParamContinuations(paramArray) {
	// RFC 2231.3 compliance
	var parts = paramArray.slice(0);
	var params = {};
	
	var part = null;
	while (part = parts.pop()) {
		if (part[0].match(/\*[0-9]+$/)) {
			var param = part[0].split('*');
			var pname = param[0];
			var pnum = Number(param[1]);
			var pval = part[1];
			
			if (! params[param[0]])
				params[pname] = [];
			
			params[pname][pnum] = pval;
			
		} else {
			params[part[0]] = part[1];
		}
	}
	
	params = omap(params, function (v, k) {
		if (Array.isArray(v))
			v = joinQuoted(v, '');
		return [k, v];
	});
	
	return params;
}

mimetools.MimeType.parse = function (str) {
	var parts = str
		.replace(/\s+/g, ' ')
		.split(';')
		.map(function (x) { return x.trim(); });
	
	var types = parts.splice(0, 1)[0].split('/');
	
	var params = parts
		.map(function (x) { return x.split('='); });
	
	params = assembleParamContinuations(params);
	
	return { types: types, params: params };
}

mimetools.MimeType.fromString = function (str) {
	var out = new mimetools.MimeType();
	var parts = mimetools.MimeType.parse(str);
	
	out.type = parts.types[0];
	
	if (parts.types.length > 1)
		out.subtype = parts.types[1];
	
	if (parts.params.length)
		parts.params.reduce(function (out, x) {
			out[x[0]] = x[1];
			return out;
		}, out.params);
	
	return out;
}

