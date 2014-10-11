'use strict';

var HttpServer = require('./httpServer'),
	Db = require('./db'),
	server = new HttpServer(),
	db = new Db();

server.get('user/id/{userId}', function (request, response, data) {
	console.log('get', data)
});

server.post('user/id/{userId}', function (request, response, data) {
	console.log('post', data)
});

server.start();
db.connect();