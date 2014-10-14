'use strict';

var helpers = require('../helpers'),
	mongoModels = require('./mongoModels'),
	mongoose = require('mongoose'),
	responses = require('../responses');

function PublicMessage(db, response, opts) {
	this.schema = ['author', 'message', 'limit', 'page'];

	this.options = {
		limit: 10,
		page: 1
	}

	this.assets = {
		db: db,
		response: response
	};

	this.init(opts);
}

PublicMessage.prototype = {

	constructor: PublicMessage,

	init: function(opts) {
		helpers.setShemaData(this.schema, this, opts, this.options);
	}

	publish: function(opts) {
		var self = this;

		if (typeof self.message === "string" && self.message.length != 0) {
			var message = new mongoModels.models.PublicMessage({ author: self.author, message: self.message });
		} else {
			responses.badRequest(self.assets.response,"Bad or empty message");
		}
	}
}

module.exports = PublicMessage;