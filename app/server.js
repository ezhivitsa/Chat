'use strict';

var HttpServer = require('./httpServer'),
	Db = require('./db'),
	server = new HttpServer(),
	db = new Db();

server.get('user/id/{userId}/file/id/{fileId}', function () {

});

server.start();
db.connect();