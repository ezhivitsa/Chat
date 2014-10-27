'use strict';

var HttpServer = require('./httpServer'),
	Db = require('./db'),
	User = require('./models/user'),
	PublicMessages = require('./models/publicMessages');

var server = new HttpServer(),
	db = new Db(),
	publicMessages = new PublicMessages(db);

server.get('user', function (request, response, data, session) {
	var user = new User(db, request, response, session, data);
	user.authorization()
		.then(function(currentUser) {
			user.sendName();
		});
});

server.get('publicMessages', function (request, response, data, session) {
	publicMessages.get(response, data);
});

server.post('publicMessage', function (request, response, data, session) {
	var user = new User(db, request, response, session, data);
	user.authorization()
		.then(function(currentUser) {
			publicMessages.publish(response, data, currentUser);
		});
});

server.get('publicMessages/last/{time}', function (request, response, data, session) {
	publicMessages.getLast(response, data);
});

server.get('privateMessages/count', function (request, response, data, session) {
	var user = new User(db, request, response, session, data);
	user.authorization()
		.then(function(currentUser) {
			var privateMessages = new PrivateMessages(db, response, { author: user });
			privateMessages.count();
		});
});

server.start();
db.connect();