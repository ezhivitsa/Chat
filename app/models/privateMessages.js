'use strict';

var helpers = require('../helpers'),
	mongoModels = require('./mongoModels'),
	mongoose = require('mongoose'),
	responses = require('../responses');

function PrivateMessages(db, eventEmitter) {
	this.assets = {
		db: db,
		eventEmitter: eventEmitter
	};
}

PrivateMessages.prototype = {

	constructor: PrivateMessages,

	count: function(response, db, data) {
		var self = this;

		var promise = mongoModels.models.PrivateMessage.count({
			$or: [{user1: data.author._id}, {user2: data.author._id}],
			'message.$.isRead': false
		}).exec();

		promise.then(function(count) {
			responses.ok(response, {
				count: count
			});
		}, function(err) {
			return helpers.handleDbErrors(err, db, response);
		});
	},

	getDialogs: function (responce, db, user) {
		mongoModels.models.PrivateMessages.find({
			$or: [{user1: data.author._id}, {user2: data.author._id}]
		}, function (err, dialogs) {
			if (err) {
				helpers.handleDbErrors(err, self.assets.db, self.assets.response);
			}

			for ( var i = 0; i < dialogs.length; i++ ) {
				dialogs[i].messages = {
					all: dialogs[i].messages.length,
					new: dialogs[i].messages.filter(function (message) {
						return message.isRead === true;
					}).length
				}
			}

			responses.ok(response, {
				dialogs: dialogs
			});
		});
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
			var promise = mongoModels.models.privateMessage.create({
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

	get: function() {
		var self = this,
			limit = Math.abs(self.limit) || self.options.limit,
			criteria = {};
		if (self.start) {
			// get limited num of unreaded private messages 
			var promise = mongoModels.models.privateMessage.find({
					author: self.author,
					isRead: false
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
		} else {
			criteria[self.limit > 0 ? '$gt' : '$lt'] = self.time ? new Date(self.time) : new Date();

			// get limited num of all private messages
			var promise = mongoModels.models.privateMessage.find({
					time: criteria,
					author: self.author
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
}

module.exports = PrivateMessages;