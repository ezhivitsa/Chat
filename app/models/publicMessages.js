'use strict';

var helpers = require('../helpers'),
	mongoModels = require('./mongoModels'),
	mongoose = require('mongoose'),
	responses = require('../responses');

function PublicMessages(db) {

	this.options = {
		limit: 10
	}

	this.assets = {
		db: db
	};
}

PublicMessages.prototype = {

	constructor: PublicMessage,

	publish: function (response, data, author) {
		var self = this;

		// check content of message field
		if (typeof data.message === "string" && self.message.length != 0) {
			// save message
			var promise = mongoModels.models.PublicMessage.create({
				author: author,
				message: data.message
			});
			promise.then(function(message) {
				responses.created(response, {
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

	get: function (response, data) {
		var self = this,
			limit = data.limit || self.limit,
			skip = data.skip || 0;

		// get limited num of messages from page * limit position
		var promise = mongoModels.models.PublicMessage.sort({ time: -1 }).skip(skip).limit(limit + 1).exec();

		promise.then(function(messages) {
			var end = messages.length <= self.limit;
			!end && messages.pop();
			responses.ok(self.assets.responses, {
				messages: messages,
				end: end
			});
		}, function(err) {
			return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
		})
	},

	getLast: function (response, data) {
		var self = this,
			time = parseInt(data.time);

		if (time != time) {
			responses.badRequest(self.assets.responses, { messages: messages });
			return;
		}

		mongoModels.models.PublicMessage.find({ time: { $gt: new Date(time) } }, function (err, messages) {
			function(err) {
				return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
			}

			responses.ok(self.assets.responses, { messages: messages });
		});
	}
}

module.exports = PublicMessage;