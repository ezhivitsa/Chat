'use strict';

var helpers = require('../helpers'),
	mongoModels = require('./mongoModels'),
	mongoose = require('mongoose'),
	responses = require('../responses');

function PublicMessages(db, response, opts) {
	this.schema = ['author', 'message', 'limit', 'page'];

	this.options = {
		limit: 10,
		page: 0
	}

	this.assets = {
		db: db,
		response: response
	};

	this.init(opts);
}

PublicMessages.prototype = {

	constructor: PublicMessage,

	init: function(opts) {
		helpers.setShemaData(this.schema, this, opts, this.options);
	},

	publish: function() {
		var self = this;

		// check content of message field
		if (typeof self.message === "string" && self.message.length != 0) {
			// save message
			var promise = mongoModels.models.PublicMessage.create({
				author: self.author,
				message: self.message
			});
			promise.then(function(message) {
				responses.created(self.assets.responses, {
					id: message.id
				})
			}, function(err) {
				return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
			});
		} else {
			// reject bad request error
			responses.badRequest(self.assets.response, "Bad or empty message");
			return;
		}
	},

	get: function() {
		var self = this;

		// get limited num of messages from page * limit position
		var promise = mongoModels.models.PublicMessage.skip(self.limit * self.page).limit(self.limit + 1).exec();

		promise.then(function(messages) {
			var end = messages.length <= self.limit;
			!end && messages.pop();
			responses.created(self.assets.responses, {
				messages: messages,
				end: end
			});
		}, function(err) {
			return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
		})
	}
}

module.exports = PublicMessage;