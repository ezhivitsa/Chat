'use strict';

var http = require('http'),
	cluster = require('cluster'),
	cs = require('client-session'),
    clientSession = cs('mysecretkey', {
    	maxAge: 172800000 // 2 days
    }),
	os = require('os'),
	helpers = require('./helpers'),
	processRequest = require('./processRequest');

function HttpServer (opts) {
	this.defaults = {
		host: 'localhost',
		port: 5555,
		publicFolder: "./public",		
		defaultFile: 'index.html'
	};

	this.handlers = {
		get: {},
		post: {},
		put: {},
		delete: {}
	};

	this.init(opts);
}

HttpServer.prototype.init = function (opts) {
	this.options = helpers.extend(opts, this.defaults);
}

HttpServer.prototype.start = function () {
	var self = this;
	// if (cluster.isMaster) {
	// 	var numCPUs = os.cpus().length;
	// 	for (var i = 0; i < numCPUs; i++) {
	// 		cluster.fork();
	// 	}
	// }
	// else {
	// 	console.log('server was started on process ' + process.pid);
		console.log('server was started');
		http.Server(function (request, response) {				

			clientSession.csget(request, response);
			processRequest(request, response, clientSession, self.handlers, self.options.publicFolder, self.options.defaultFile);

		}).listen(this.options.port, this.options.host);
	// }

}

HttpServer.prototype.stop = function () {

}

HttpServer.prototype.get = function (path, handler) {
	this.handlers.get[helpers.trimStr(path, "\/").toLowerCase()] = handler;
}

HttpServer.prototype.post = function (path, handler) {
	this.handlers.post[helpers.trimStr(path, "\/").toLowerCase()] = handler;
}

HttpServer.prototype.put = function (path, handler) {
	this.handlers.put[helpers.trimStr(path, "\/").toLowerCase()] = handler;
}

HttpServer.prototype.delete = function (path, handler) {
	this.handlers.delete[helpers.trimStr(path, "\/").toLowerCase()] = handler;
}

module.exports = HttpServer;