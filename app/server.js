'use strict';

var HttpServer = require('./httpServer'),
	Db = require('./db'),
	server = new HttpServer(),
	db = new Db(),
	User = require('./models/user');

server.post('login', function (request, response, data, session) {
	var user = new User(db, request, response, session, data);
	user.login();
});

server.get('user/id/{userId}', function (request, response, data, session) {
	console.log('get', data)
});

server.post('user/id/{userId}', function (request, response, data, session) {
	console.log('post', data)
});

server.start();
db.connect();