var it = require('./iter-tools');

module.exports.quote = function (str) {
// http://stackoverflow.com/questions/494035/how-do-you-pass-a-variable-to-a-regular-expression-javascript/494122#494122
    return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

module.exports.findall = function (re, str) {
// http://www.activestate.com/blog/2008/04/javascript-refindall-workalike
	return it.iter(re.exec.bind(re), str, 10000);
};

module.exports.match = function (re, str) {
	return str.match(re);
};