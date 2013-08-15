var it = require('../lib/iter-tools');

var count = (function () {
	var i = 0;
	return function () {
		return i++;
	};
})();

var countBy = (function () {
	var i = 0;
	return function (a) {
		return i++ * a;
	};
})();

var gen = (function () {

	var i = 0;
	
	return function (a, b, c) {
		if (i++ < 10) return [a * i, b * i, c * i];
		return null;
	}

})();

console.dir(it.iter(count, null, 10));
console.dir(it.iter(countBy, 1, 10));
console.dir(it.iter(countBy, 2, 10));