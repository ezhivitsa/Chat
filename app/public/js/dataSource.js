define([],
	function() {
		var domain = 'http://192.168.1.147/',
			urlPatterns = {
				user: domain + 'user',
				userInfo: domain + 'user/id/$1/info',
				userLoaction: domain + 'user/geolocate',
				countNewPrivateMessages: domain + 'privateMessages/count',
				publicMessages: domain + 'publicMessages',
				message: domain + 'publicMessages/message',
				userUpdate: domain + 'user/update',
				dialogs: domain + 'dialogs/all',
				dialog: domain + 'dialogs/dialog/id/$1',
				locations: domain + 'geolocations'
			};

		function createHttpGet(url, callback) {
			var xhr = new XMLHttpRequest();
			xhr.open('get', url, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					var resp = (xhr.responseText) ? JSON.parse(xhr.responseText) : {};
					(callback) && callback(resp, xhr.status);
				}
			}
			xhr.send();
		}

		function createHttpPost(data, url, callback) {
			var xhr = new XMLHttpRequest();
			var params = JSON.stringify(data);
			xhr.open("POST", url, true);

			//Send the proper header information along with the request
			xhr.setRequestHeader("Content-type", "application/json");

			xhr.onreadystatechange = function() {
				//Call a function when the state changes.
				if (xhr.readyState == 4) {
					var resp = (xhr.responseText) ? JSON.parse(xhr.responseText) : {};
					(callback) && callback(resp, xhr.status);
				}
			}
			xhr.send(params);
		}

		return {
			getUserName: function(callback) {
				createHttpGet(urlPatterns.user, callback);
			},
			getUserNameById: function(id, callback) {
				var url = urlPatterns.userInfo.replace('$1', id);
				createHttpGet(url, callback);
			},
			countNewPrivateMessages: function(callback) {
				createHttpGet(urlPatterns.countNewPrivateMessages, callback);
			},
			getMessages: function(time, limit, callback) {
				var url = urlPatterns.publicMessages + '?';
				(time) && (url += 'time=' + time + '&');
				(limit) && (url += 'limit=' + limit);

				createHttpGet(url, callback);
			},
			publishPublicMessage: function(message, callback) {
				createHttpPost({
					message: message
				}, urlPatterns.message, callback);
			},
			updateName: function(name, callback) {
				createHttpPost({
					name: name
				}, urlPatterns.userUpdate, callback);
			},
			getDialogs: function(callback) {
				createHttpGet(urlPatterns.dialogs, callback);
			},
			getDialog: function(id, time, limit, callback) {
				var url = urlPatterns.dialog.replace('$1', id) + '?';
				(time) && (url += 'time=' + time + '&');
				(limit) && (url += 'limit=' + limit);
				createHttpGet(url, callback);
			},
			publishPrivateMessage: function(id, message, callback) {
				var url = urlPatterns.dialog.replace('$1', id);

				createHttpPost({
					message: message
				}, url, callback);
			},
			publishLocation: function(location, callback) {
				createHttpPost(location, urlPatterns.userLoaction, callback);
			},
			getUsersLocations: function(callback) {
				createHttpGet(urlPatterns.locations, callback);
			},
		};
	}
);