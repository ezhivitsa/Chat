(function () {
	'use strict';

	var HttpServer = require('./httpServer'),
		Db = require('./db'),
		server = new HttpServer(),
		db = new Db();

	server.get('/user/id/{id}', function () {

	});

	server.start();
	db.connect();

})();