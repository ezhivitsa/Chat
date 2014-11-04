'use strict';

var HttpServer = require('./httpServer'),
	Db = require('./db'),
	User = require('./models/user'),
	PublicMessages = require('./models/publicMessages'),
	PrivateMessages = require('./models/privateMessages'),
	events = require('events');

var server = new HttpServer(),
	eventEmitter = new events.EventEmitter(),
	db = new Db(),
	publicMessages = new PublicMessages(db, eventEmitter),
	privateMessages = new PrivateMessages(db, eventEmitter);

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

server.post('user/geolocate', function (request, response, data, session) {
	var user = new User(db, request, response, session, data);
	user.updateGeolocation();
});

server.get('user/id/{id}/info', function (request, response, data, session) {
	var user = new User(db, request, response, session, data);
	user.sendUserInfo();
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
			privateMessages.count(response, db, { author: currentUser });
		});
});

server.get('dialogs/all', function (request, response, data, session) {
	var user = new User(db, request, response, session, data);
	user.authorization()
		.then(function(currentUser) {
			privateMessages.getDialogs(response, db, currentUser);
		});
});

server.post('dialogs/dialog/id/{id}', function (request, response, data, session) {
	var user = new User(db, request, response, session, data);
	user.authorization()
		.then(function(currentUser) {
			privateMessages.publish(response, db, data, currentUser);
		});
});

server.get('dialogs/dialog/id/{id}', function (request, response, data, session) {
	var user = new User(db, request, response, session, data);
	user.authorization()
		.then(function(currentUser) {
			privateMessages.get(response, data, currentUser);
		});
});

server.start();
db.connect();