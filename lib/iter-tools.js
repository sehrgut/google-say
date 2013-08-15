module.exports.iter = function (fn, args, max) {
	var out = [];
	if (! Array.isArray(args))
		args = [args];

	for (var i=0; i<max; i++) {
		var tmp = fn.apply(null,args);
		if (tmp === null) return out;
		out.push(tmp);
	}
	return out;
};

