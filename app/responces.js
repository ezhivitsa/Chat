'use strict';

module.exports = {
	ok: function (responce, message) {

	},
	badRequest: function (response, message) {
		message = message || "This request doesn't processed by the server";		
		response.writeHead(400);
	    response.end(message);
	},
	internalServerError: function (response, message) {
		response.writeHead(500);
	    response.end(message);
	}
};