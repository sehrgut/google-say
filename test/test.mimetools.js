var mt = require('../lib/mimetools');

var cases = {
	html: 'text/html',
	xhtml: 'application/xhtml+xml; charset=UTF-8',
	rss: 'application/rss+xml; charset=UTF-8; access-type=URL; URL*0=http://; URL*1=example.com/index.rss',
	rss_canonical: 'application/rss+xml; charset=UTF-8; access-type=URL; URL=http://example.com/index.rss',
	rfc_continuation: 'message/external-body; access-type=URL; URL*0="ftp://"; URL*1="cs.utk.edu/pub/moore/bulk-mailer/bulk-mailer.tar',
};

var tests = module.exports;

tests['parse simple'] = function (test) {
	var m = null;
	test.expect(4);
	
	test.doesNotThrow(function () {
		m = mt.MimeType.fromString(cases.html);
	}, Error, "parse");
	
	test.equal(m.type, 'text', 'correct type');
	test.equal(m.subtype, 'html', 'correct subtype');
	test.equal(m.toString(), cases.html, 'correct reconstruction');
	
	test.done();
};

tests['parse with parameter'] = function (test) {
	var m = null;
	test.expect(6);
	
	test.doesNotThrow(function () {
		m = mt.MimeType.fromString(cases.xhtml);
	}, Error, "parse failure");
	
	test.equal(m.type, 'application', 'incorrect type');
	test.equal(m.subtype, 'xhtml+xml', 'incorrect subtype');
	test.ok(m.params['charset'], 'missing charset parameter');
	test.equals(m.params['charset'], 'UTF-8', 'incorrect charset parameter');
	test.equal(m.toString(), cases.xhtml, 'incorrect reconstruction');
	
	test.done();

};

function olength(o) {
	var i = 0;
	for (k in o)
		if (o.hasOwnProperty(k))
			i++;
	return i
}

tests['RFC 2231.3 parameter continuation'] = function (test) {
	var m = null;
	test.expect(6);
	
	test.doesNotThrow(function () {
		m = mt.MimeType.fromString(cases.rfc_continuation);
	}, Error, "parse failure");
	
	test.equal(m.type, 'message', 'incorrect type');
	test.equal(m.subtype, 'external-body', 'incorrect subtype');
	test.equal(olength(m.params), 2, 'incorrect parameter count');
	test.ok(m.params['URL'], 'missing URL parameter');
	test.equal(m.params['URL'], '"ftp://cs.utk.edu/pub/moore/bulk-mailer/bulk-mailer.tar"', 'incorrect URL parameter');
	test.done();
};









