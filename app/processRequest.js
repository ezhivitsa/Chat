'use strict';

var url = require('url'),
	querystring = require("querystring"),	
	helpers = require('./helpers'),
	router = require('./router');

module.exports = function (request, response, handlers, publicFolder) {
	var pathname = url.parse(request.url).pathname,
		method = request.method.toLowerCase();

	pathname = helpers.trimStr(pathname, "\/");

	if ( method == "get" ) {
		// process get method
		var queryData = url.parse(request.url, true).query;

		router.route(request, response, pathname, method, handlers, publicFolder, queryData);
	}
	else {
		// process post, put and delete
		var postData = '';
		request.on("data", function(postDataChunk) {
			postData += postDataChunk;
		});

		request.on("end", function() {
			router.route(request, response, pathname, method, handlers, publicFolder, querystring.parse(postData));
		});
	}
};