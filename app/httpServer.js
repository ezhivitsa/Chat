'use strict';

var http = require('http'),
	url = require('url'),
	cluster = require('cluster'),
	os = require('os'),
	helpers = require('./helpers'),
	router = require('./router');

function HttpServer (opts) {
	this.defaults = {
		host: '127.0.0.1',
		port: 5555,
		publicFolder: "./public"
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
	if (cluster.isMaster) {
		var numCPUs = os.cpus().length;
		for (var i = 0; i < numCPUs; i++) {
			cluster.fork();
		}
	}
	else {
		console.log('server was started on process ' + process.pid);
		http.Server(function (request, response) {				
			var pathname = url.parse(request.url).pathname,
				method = request.method.toLowerCase();

			pathname = helpers.trimStr(pathname, "\/");
			router.route(pathname, method, self.handlers, self.options.publicFolder, request, response);

		}).listen(this.options.port, this.options.host);			
	}

}

HttpServer.prototype.stop = function () {

}

HttpServer.prototype.get = function (path, handler) {
	this.handlers.get[helpers.trimStr(path, "\/")] = handler;
}

HttpServer.prototype.post = function (path, handler) {
	this.handlers.post[helpers.trimStr(path, "\/")] = handler;
}

HttpServer.prototype.put = function (path, handler) {
	this.handlers.put[helpers.trimStr(path, "\/")] = handler;
}

HttpServer.prototype.delete = function (path, handler) {
	this.handlers.delete[helpers.trimStr(path, "\/")] = handler;
}

module.exports = HttpServer;