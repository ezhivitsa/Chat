define([],
	function () {
		var domain = '/',
			urlPatterns = {
				user: domain + 'user',
				countNewPrivateMessages: domain + 'privateMessages/count',
				publicMessages: domain + 'publicMessages'
			};

		function createHttpGet (url, callback) {
			var xhr = new XMLHttpRequest();
			xhr.open('get', url, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					var resp = JSON.parse(xhr.responseText);
					( callback ) && callback(resp, xhr.status);
				}
			}
			xhr.send();
		}

		function createHttpPost (data, url, callback) {
			var http = new XMLHttpRequest();
			var params = JSON.stringify(data);
			http.open("POST", url, true);

			//Send the proper header information along with the request
			http.setRequestHeader("Content-type", "application/json");
			http.setRequestHeader("Content-length", params.length);
			http.setRequestHeader("Connection", "close");

			http.onreadystatechange = function() {
				//Call a function when the state changes.
			    if (xhr.readyState == 4) {
					var resp = JSON.parse(xhr.responseText);
					( callback ) && callback(resp, xhr.status);
				}
			}
			http.send(params);
		}

		return {
			getUserName: function (callback) {
				createHttpRequest('get', urlPatterns.user, callback);
			},
			countNewPrivateMessages: function (callback) {
				createHttpRequest('get', urlPatterns.countNewPrivateMessages, callback);
				createHttpGet(urlPatterns.user, callback);
			},
			getMessages: function (time, limit, callback) {
				var url = urlPatterns.user + '?';
				( time ) && ( url += 'time=' + time + '&' );
				( limit ) && ( url += 'limit=' + limit );

				createHttpGet(url, callback);
			},
			publishPublicMessage: function (message, callback) {
				createHttpPost({ message: message });
			}
		};
	}
);