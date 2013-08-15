var fmt = require('util').format;
var Googlism = require('../');

var g = new Googlism(true)

	.on('ism', function printIsm(data) {
		console.log(fmt('* "%s" [*](%s)', data.msg, data.src));
	})

	.on('end', function printEnd(data) {
		console.log(fmt('\n\nNO MOAR ISMS ABOUT "%s"', data.id));
	})

	.on('error', console.error);


var question = 'libertarians are just crazy';
console.log(fmt("#Google Say\n##about \"%s\"\n", question));
g.ask(question, question.split(' ')[0]);
