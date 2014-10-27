'use strict';

var HttpServer = require('./httpServer'),
	Db = require('./db'),
	User = require('./models/user'),
	PublicMessages = require('./models/publicMessages'),
	events = require('events');

var server = new HttpServer(),
	eventEmitter = new events.EventEmitter(),
	db = new Db(),
	publicMessages = new PublicMessages(db, eventEmitter);

server.get('user', function (request, response, data, session) {
	var user = new User(db, request, response, session, data);
	user.authorization()
		.then(function(currentUser) {
			user.sendName();
		});
});

server.post('user/update', function (request, response, data, session) {
	var user = new User(db, request, response, session, data);
	user.updateName(data.name);
});

server.get('publicMessages', function (request, response, data, session) {
	publicMessages.get(response, data);
});

server.post('publicMessages/message', function (request, response, data, session) {
	var user = new User(db, request, response, session, data);
	user.authorization()
		.then(function(currentUser) {
			publicMessages.publish(response, data, currentUser);
		});
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