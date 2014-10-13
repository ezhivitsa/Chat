'use strict';

module.exports = {
	created: function (responce, responseJSON) {
		responseJSON = responseJSON || {};
		response.writeHead(201, {'Content-Type': 'application/json'});
		response.end(JSON.stringify(responseJSON));
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