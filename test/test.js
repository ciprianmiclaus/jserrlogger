var assert = chai.assert,
	jserrlogger = window.jserrlogger;

var _getErrLoggerScriptElems = function() {
	var elems = document.getElementsByTagName('script'),
		ret = [];
	for(var i = 0; i < elems.length; ++i) {
		var id = elems[i].id || "";
		if(id.match((/^jserrlog\d*$/))) {
			ret.push(elems[i]);
		}
	}
	return ret;
};
	
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
	
	it("uninstall fails when jserrlogger hasn't been installed.", function() {
		assert.throws(
			function() {
				jserrlogger.uninstall();
			},
			"jserrlogger not installed"
		);
	});

});


describe("jserrlogger tests where logErr is called from window.onerror", function () {

	it("jserrlogger intercepts and reprots errors via window.onerror", function(done) {
		var prevErr = window.onerror;
		window.onerror = null;
		jserrlogger.install("http://localhost/endpoint.js", {timeout:500, debug:1});
		try {
			window.onerror('some error', 'some_file.js', 454);
		} catch(e) {}
		jserrlogger.uninstall();
		window.onerror = prevErr;

		//check the script was added as expected
		var ret = _getErrLoggerScriptElems();
		assert.equal(ret.length, 1);
		var el = ret[0];

		assert.equal(el.localName, "script");
		var urlInfo = URI.parse(el.src);
		assert.equal(urlInfo.protocol, 'http');
		assert.equal(urlInfo.hostname, 'localhost');
		assert.equal(urlInfo.path, '/endpoint.js');
		assert.isNotOk(urlInfo.user);
		assert.isNotOk(urlInfo.password);
		var queryInfo = URI.parseQuery(urlInfo.query);
		assert.equal(queryInfo.i, "" + "1");
		assert.equal(queryInfo.fl, 'some_file.js');
		assert.equal(queryInfo.err, 'some error');
		assert.match(queryInfo.sn, /test[\\\/]{0,1}example\.html$/);

		window.setTimeout(function() {
			done();
		}, 500);
	});

});


describe("jserrlogger tests where logErr is called directly", function () {

	var _doInstall = function(options) {
		options = options || {
			timeout: 500,
			debug: 1
		};
		jserrlogger.install("http://localhost/endpoint.js", options);
	};
	
	var _assertNoScript = function(err_id) {
		var el = document.getElementById('jserrlog' + err_id);
		assert.isNull(el);
	};
	
	var _doLogErr = function(done) {
		var err_id = jserrlogger.logErr('some error', 'some_file.js', 454);
		var el = document.getElementById('jserrlog' + err_id);
		assert.isNotNull(el);
		assert.equal(el.localName, "script");
		var urlInfo = URI.parse(el.src);
		assert.equal(urlInfo.protocol, 'http');
		assert.equal(urlInfo.hostname, 'localhost');
		assert.equal(urlInfo.path, '/endpoint.js');
		assert.isNotOk(urlInfo.user);
		assert.isNotOk(urlInfo.password);
		var queryInfo = URI.parseQuery(urlInfo.query);
		assert.equal(queryInfo.i, "" + err_id);
		assert.equal(queryInfo.fl, 'some_file.js');
		assert.equal(queryInfo.err, 'some error');
		assert.match(queryInfo.sn, /test[\\\/]{0,1}example\.html$/);

		window.setTimeout(function() {
			_assertNoScript(err_id);
			done();
		}, 500);
	};

	it("jserrlogger can be installed without options", function() {
		jserrlogger.install("http://localhost/err.js");
		jserrlogger.uninstall();
	});

	it("logErr adds a script and removes it after timeout", function(done) {
		_doInstall();
		_doLogErr(done);
		jserrlogger.uninstall();
	});

	it("logErr after an uninstall throws", function(done) {
		_doInstall();
		_doLogErr(done);
		jserrlogger.uninstall();
		assert.throws(
			function() {
				jserrlogger.logErr('some error that will not work', 'some_file2.js', 123);
			},
			"jserrlogger not installed"
		);
	});
	
	it("only upperLimit errors are logged when upperLimit is set", function(done) {
		_doInstall({upperLimit:2, timeout:500});
		var ret1 = jserrlogger.logErr("error1", "file1", 1);
		assert.isOk(ret1);
		var ret2 = jserrlogger.logErr("error2", "file2", 2);
		assert.isOk(ret2);
		
		//not done
		var ret = jserrlogger.logErr("error3", "file3", 3);
		assert.isNotOk(ret);
		ret = jserrlogger.logErr("error4", "file4", 4);
		assert.isNotOk(ret);

		var elems = _getErrLoggerScriptElems();
		assert.equal(elems.length, 2);
		
		window.setTimeout(function() {
			_assertNoScript(ret1);
			_assertNoScript(ret2);
			done();
		}, 1000);
	});
	
	it("uninstall reinstates the previous window.onerror", function() {
		var errHandler = function() { throw "never called"; },
			prevHandler = window.onerror;
		window.onerror = errHandler;
		assert.equal(window.onerror, errHandler); // just check equality works as expected
		_doInstall();
		assert.notEqual(window.onerror, errHandler);
		jserrlogger.uninstall();
		//check we're back to errHandler
		assert.equal(window.onerror, errHandler);
		//revert onerror
		window.onerror = prevHandler;
	});

});
