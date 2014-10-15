'use strict';

module.exports = {
	created: function (response, responseJSON) {
		responseJSON = responseJSON || {};
		response.writeHead(201, {'Content-Type': 'application/json'});
		response.end(JSON.stringify(responseJSON));
	},
	badRequest: function (response, message) {
		message = message || "This request doesn't processed by the server";
		var responseJSON = {
			message: message
		};
		response.writeHead(400, {'Content-Type': 'application/json'});
	    response.end(JSON.stringify(responseJSON));
	},
	internalServerError: function (response, message) {
		message = message || "Server error. I apologize for any inconvenience";
		var responseJSON = {
			message: message
		};
		response.writeHead(500, {'Content-Type': 'application/json'});
	    response.end(JSON.stringify(responseJSON));
	},
	forbidden: function (response, message) {
		message = message || "This action is forbidden";
		var responseJSON = {
			message: message
		};
		response.writeHead(403, {'Content-Type': 'application/json'});
	    response.end(JSON.stringify(responseJSON));
	}
};