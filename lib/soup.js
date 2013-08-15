var util = require('util');
var parser = require('htmlparser2');
var domutils = require('domutils');
var etype = require('domelementtype');

function formattedText(el) {
	if(!el) return '';
	if(Array.isArray(el)) return el.map(formattedText).join('');
	if(el.type == etype.Text || el.type == etype.CDATA) return el.data;
	if(etype.isTag(el))
		switch (el.name) {
			case 'p':
				return util.format("%s\n\n", formattedText(el.children));
			case 'code':
				return util.format("`%s`", formattedText(el.children));
			case 'li':
				return util.format("* %s\n", formattedText(el.children));
			case 'tr':
				return util.format("%s\n", formattedText(el.children));
			case 'br':
				return "\n";
			case 'h1':
				return util.format("#%s\n", formattedText(el.children));
			case 'h2':
				return util.format("##%s\n", formattedText(el.children));
			case 'h3':
				return util.format("###%s\n", formattedText(el.children));
			case 'h4':
				return util.format("####%s\n", formattedText(el.children));
			case 'h5':
				return util.format("#####%s\n", formattedText(el.children));
			case 'h6':
				return util.format("######%s\n", formattedText(el.children));
			case 'hr':
				return '----------';
			case 'script':
			case 'link':
			case 'style':
			case 'img':
			case 'meta':
				return '';
			default: 
				return formattedText(el.children);				
		}
	return '';
}

function htmlToText(html) {

	var hopts = {
		verbose: true,
		ignoreWhitespace: true
		};
	
	var handler = new parser.DomHandler(function () {}, hopts);
	
	new parser.Parser(handler).parseComplete(html);

	var dom = domutils.getElementsByTagName('body', handler.dom)[0];
/*
	var stripTags = [ 'script', 'style', 'img', 'link', 'meta' ];
	
	for (var i=0, n=stripTags.length; i<n; i++)
		domutils
			.getElementsByTagName(stripTags[i], dom)
			.map(domutils.removeElement);
*/
	return formattedText(dom).trim();
}

module.exports = {
	htmlToText: htmlToText
};