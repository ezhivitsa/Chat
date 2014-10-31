define([],
	function () {
		var domain = '/',
			urlPatterns = {
				user: domain + 'user',
				countNewPrivateMessages: domain + 'privateMessages/count',
				publicMessages: domain + 'publicMessages',
				message: domain + 'publicMessages/message',
				userUpdate: domain + 'user/update'
			};

		function createHttpGet (url, callback) {
			var xhr = new XMLHttpRequest();
			xhr.open('get', url, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					var resp = (xhr.responseText) ? JSON.parse(xhr.responseText) : {};
					( callback ) && callback(resp, xhr.status);
				}
			}
			xhr.send();
		}

		function createHttpPost (data, url, callback) {
			var xhr = new XMLHttpRequest();
			var params = JSON.stringify(data);
			xhr.open("POST", url, true);

			//Send the proper header information along with the request
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onreadystatechange = function() {
				//Call a function when the state changes.
			    if (xhr.readyState == 4) {
					var resp = (xhr.responseText) ? JSON.parse(xhr.responseText) : {};
					( callback ) && callback(resp, xhr.status);
				}
			}
			xhr.send(params);
		}

		return {
			getUserName: function (callback) {
				createHttpGet(urlPatterns.user, callback);
			},
			countNewPrivateMessages: function (callback) {
				createHttpGet(urlPatterns.countNewPrivateMessages, callback);
				createHttpGet(urlPatterns.user, callback);
			},
			getMessages: function (time, limit, callback) {
				var url = urlPatterns.publicMessages + '?';
				( time ) && ( url += 'time=' + time + '&' );
				( limit ) && ( url += 'limit=' + limit );

				createHttpGet(url, callback);
			},
			publishPublicMessage: function (message, callback) {
				createHttpPost({ message: message }, urlPatterns.message, callback);
			},
			updateName: function (name, callback) {
				createHttpPost({ name: name }, urlPatterns.userUpdate, callback);
			}
		};
	}
);