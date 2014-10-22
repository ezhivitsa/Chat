'use strict';

var helpers = require('../helpers'),
	mongoModels = require('./mongoModels'),
	mongoose = require('mongoose'),
	responses = require('../responses');

function PrivateMessages(db, response, opts) {
	// this.schema = ['author', 'message', 'recipient', 'limit', 'page'];

	this.options = {
		limit: 10
	}

	this.assets = {
		db: db
	};

	this.init(opts);
}

PrivateMessages.prototype = {

	constructor: PublicMessage,

	publish: function(response, data, author) {
		var self = this;

		if (typeof self.recipient !== "string" || self.recipient.length == 0) {
			responses.badRequest(response, "Bad or empty recipient");
			return;
		}

		// check recipient in chat
		mongoModels.models.User.findOne({
			name: recipient
		}, function(err, user) {
			if (err) {
				helpers.handleDbErrors(err, self.assets.db, self.assets.response);
			}
			if (!user) {
				responses.badRequest(response, "Recipient unavailable");
			}
			// check content of message field
			if (typeof self.message !== "string" || self.message.length == 0) {
				// reject bad request error
				responses.badRequest(response, "Bad or empty message");
				return;
			}
			// save message
			var promise = mongoModels.models.PublicMessage.create({
				author: self.author,
				message: self.message,
				recipient: user
			}).exec();

			promise.then(function(message) {
				responses.created(response, {
					id: message.id
				})
			}, function(err) {
				return helpers.handleDbErrors(err, self.assets.db, response);
			});
		});
	},

	count: function(response, user) {
		var self = this;

		var promise = mongoModels.models.PublicMessage.count({
			author: user,
			isRead: false
		}).exec();

		promise.then(function(count) {
			responses.ok(response, {
				count: count
			});
		}, function(err) {
			return helpers.handleDbErrors(err, self.assets.db, response);
		});
	}
}

module.exports = PublicMessage;