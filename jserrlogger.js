/*
jserrlogger.js v1.0.0

Installs an onerror handler to catch javascript errors and logs them on a server
via a JSONP call to an endpoint on a server to allow the server to log these errors.

LICENSE: GNU Affero General Public License v3.0

Permissions of this strongest copyleft license are conditioned on making available complete source code of licensed
works and modifications, which include larger works using a licensed work, under the same license. Copyright and license 
notices must be preserved. Contributors provide an express grant of patent rights. When a modified version is used to 
provide a service over a network, the complete source code of the modified version must be made available.

*/

(function(wnd) {

	var errId = 1,
		timeout,
		url,
		debugMode,
		upperLimit,
		prevOnError,
		_addScript,
		_log,
		_consoleLog,
		_assert;

	_assert = function(cond, errStr) {
		if(!cond){
			throw errStr;
		}
	};

	_consoleLog = function() {
		if(debugMode && wnd.console && wnd.console.log) {
			try {
				wnd.console.log.apply(0, arguments);
			} catch(e){}
		}
	};

	_addScript = function(src) {
		try {
			var script = wnd.document.createElement("script"),
				script_id = "jserrlog" + errId;
			script.id = script_id;
			script.src = src;

			wnd.document.getElementsByTagName("head")[0].appendChild(script);

			wnd.setTimeout(function() {
				try {
					var script = wnd.document.getElementById(script_id);
					wnd.document.getElementsByTagName("head")[0].removeChild(script);
				}
				catch (e) {
					_consoleLog("internal error:", e);
				}
			}, timeout);
		}
		catch (e) {
			_consoleLog("internal error:", e);
		}
	};

	_log = function(err_msg, file, line_number) {
		_consoleLog("_log:", err_msg, file, line_number);

		// format the data for the request
		var src = url + "?i=" + errId;
		src += "&sn=" + escape(document.URL);
		src += "&fl=" + escape(file);
		src += "&ln=" + line_number;
		src += "&err=";
		var m = escape(err_msg);
		try {
			m = m.substr(0, 2083 - src.length);
		}
		catch(e){}
		src += m;
		
		_addScript(src);
		return errId++;
	};

	wnd.jserrlogger = {
		
		install: function(url_, options) {
			_assert(url_, "install needs a url");
			url = url_;
			options = options||{};
			timeout = options.timeout||3000;
			upperLimit = options.upperLimit;
			debugMode = options.debug;

			prevOnError = wnd.onerror;
			wnd.onerror = function(err_msg, file, line_number) {
				_log(err_msg, file, line_number);
				if(prevOnError) {
					prevOnError(err_msg, file, line_number);
				}
			};
		},

		uninstall: function() {
			_assert(url, "jserrlogger not installed");
			wnd.onerror = prevOnError;
			url = null;
			errId = 1;
		},

		logErr: function(err_msg, file, line_number) {
			_assert(url, "jserrlogger not installed");
			if(upperLimit && errId > upperLimit) { return; }
			return _log(err_msg, file, line_number);
		}
	};
	
	return wnd.jserrlogger;

})(window);
