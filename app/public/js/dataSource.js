define([],
	function () {
		var domain = '/',
			urlPatterns = {
				user: domain + 'user'
			};

		function createHttpRequest (method, url, callback) {
			var xhr = new XMLHttpRequest();
			xhr.open(method, url, true);
			xhr.onreadystatechange = function() {
			  if (xhr.readyState == 4) {
			    // JSON.parse does not evaluate the attacker's scripts.
			    var resp = JSON.parse(xhr.responseText);
			    ( callback ) && callback(resp);
			  }
			}
			xhr.send();
		}

		return {
			getUserName: function (callback) {
				createHttpRequest('get', urlPatterns.user, callback);
			}
		};
	}
);