var assert = chai.assert,
	jserrlogger = window.jserrlogger;

describe("jserrlogger negative tests", function () {

	it("install fails when the url is not passed in.", function() {
		assert.throws(jserrlogger.install, "install needs a url");
	});

	it("logErr fails when jserrlogger hasn't been installed.", function() {
		assert.throws(
			function() {
				jserrlogger.logErr("Fail me a river.", "app.js", 134);
			},
			"jserrlogger not installed"
		);
	});

});

describe("jserrlogger tests", function () {

	var timeout = 1000;

	before(function() {
		jserrlogger.install("http://someurl.com/endpoint.js", timeout, 1);
	});

	it("logErr adds a script and removes it after timeout", function(done) {
		jserrlogger.logErr('some error', 'some_file.js', 454);
		var el = document.getElementById('jserrlog0');
		assert.isNotNull(el);
		assert.equal(el.localName, "script");
		var urlInfo = URI.parse(el.src);
		assert.equal(urlInfo.protocol, 'http');
		assert.equal(urlInfo.hostname, 'someurl.com');
		assert.equal(urlInfo.path, '/endpoint.js');
		assert.isNotOk(urlInfo.user);
		assert.isNotOk(urlInfo.password);
		var queryInfo = URI.parseQuery(urlInfo.query);
		assert.equal(queryInfo.i, "0");
		assert.equal(queryInfo.fl, 'some_file.js');
		assert.equal(queryInfo.err, 'some error');
		assert.match(queryInfo.sn, /test\/example\.html$/);

		this.timeout(timeout + 1000);
		window.setTimeout(function() {
			var el = document.getElementById('jserrlog0');
			assert.isNull(el);
			done();
		}, timeout);
	});

});
