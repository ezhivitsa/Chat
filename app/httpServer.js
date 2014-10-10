(function () {
	'use strict';

	var http = require('http'),
		url = require('url'),
		cluster = require('cluster'),
		os = require('os'),
		helpers = require('./helpers');

	function HttpServer (opts) {
		this.defaults = {
			host: '127.0.0.10',
			port: 5555
		};

		this.handlers = {
			get: {},
			post: {}
		};

		this.init(opts);
	}

	HttpServer.prototype.init = function (opts) {
		this.options = helpers.extend(opts, this.defaults);
	}

	HttpServer.prototype.start = function () {
		if ( cluster.isMaster ) {
			
		}

		http.createServer(function (request, response) {

			// var pathname = url.parse(request.url).pathname,
			// 	method = request.method.toLowerCase();

			// if (  === 'get' ) {
			// 	processGetRequest(pathname, url, route, handle, request, response, session);
			// }
			// else if ( request.method.toLowerCase() === 'post' ) {
			// 	processPostRequest(pathname, route, handle, request, response, session);
			// }

		}).listen(this.port, this.host);
	}

	HttpServer.prototype.stop = function () {

	}

	HttpServer.prototype.get = function (path, handler) {
		this.handlers.get[path] = handler;
	}

	HttpServer.prototype.post = function (path, handler) {
		this.handlers.post[path] = handler;
	}

	module.exports = HttpServer;

})();