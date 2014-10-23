'use strict';

var helpers = require('../helpers'),
	mongoModels = require('./mongoModels'),
	mongoose = require('mongoose'),
	responses = require('../responses');

function PrivateMessages(db, response, opts) {
	this.schema = ['author', 'message', 'recipient', 'limit'];

	this.options = {
		limit: 10
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
		helpers.setShemaData(this.schema, this, opts);
	},

	publish: function() {
		var self = this;

		if (typeof self.recipient !== "string" || self.recipient.length == 0) {
			responses.badRequest(self.assets.response, "Bad or empty recipient");
			return;
		}

		// check recipient in chat
		mongoModels.models.User.findOne({
			name: self.recipient
		}, function(err, user) {
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
				recipient: user
			}).exec();

			promise.then(function(message) {
				responses.created(self.assets.response, {
					id: message.id
				})
			}, function(err) {
				return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
			});
		});
	},

	count: function() {
		var self = this;

		var promise = mongoModels.models.PublicMessage.count({
			author: author,
			isRead: false
		}).exec();

		promise.then(function(count) {
			responses.ok(self.assets.response, {
				count: count
			});
		}, function(err) {
			return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
		});
	},

	get: function() {
		var self = this,
			limit = Math.abs(self.limit) || self.options.limit,
			criteria = {};
		criteria[data.limit > 0 ? '$gt' : '$lt'] = data.time ? new Date(data.time) : new Date();

		// get limited num of messages from page * limit position
		var promise = mongoModels.models.PublicMessage.find({
				time: criteria
			})
			.sort({
				time: -1
			}).limit(limit + 1).exec();

		promise.then(function(messages) {
			var end = messages.length <= limit;
			!end && messages.pop();
			responses.ok(response, {
				messages: messages,
				end: end
			});
		}, function(err) {
			return helpers.handleDbErrors(err, self.assets.db, response);
		})
	}
}

module.exports = PublicMessage;