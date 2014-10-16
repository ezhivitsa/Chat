'use strict';

var helpers = require('../helpers'),
	mongoModels = require('./mongoModels'),
	mongoose = require('mongoose'),
	responses = require('../responses');

function PrivateMessages(db, response, opts) {
	this.schema = ['author', 'message', 'recipient', 'limit', 'page'];

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

PrivateMessages.prototype = {

	constructor: PublicMessage,

	init: function(opts) {
		helpers.setShemaData(this.schema, this, opts, this.options);
	},

	publish: function() {
		var self = this;

		if (typeof self.recipient !== "string" || self.recipient.length == 0) {
			responses.badRequest(self.assets.response, "Bad or empty recipient");
			return;
		}

		// check recipient in chat
		mongoModels.models.User.findOne({
			name: recipient
		},function(err,user) {
			if (err) {
				helpers.handleDbErrors(err, self.assets.db, self.assets.response);
			}
			if (!user) {
				responses.badRequest(self.assets.response, "Recipient unavailable");
			}
			// check content of message field
			if (typeof self.message !== "string" || self.message.length == 0) {
				// reject bad request error
				responses.badRequest(self.assets.response, "Bad or empty message");
				return;
			}
			// save message
			var promise = mongoModels.models.PublicMessage.create({
				author: self.author,
				message: self.message,
				recipient: user,
				isRead: false
			});
			
			promise.then(function(message) {
				responses.created(self.assets.responses, {
					id: message.id
				})
			}, function(err) {
				return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
			});
		});
	}
}

module.exports = PublicMessage;