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

	constructor: PublicMessages,

	publish: function(response, data, author) {
		var self = this;

		// check content of message field
		if (typeof data.message === "string" && self.message.length != 0) {
			// save message
			var promise = mongoModels.models.PublicMessage.create({
				author: author,
				message: data.message
			}).exec();
			promise.then(function(message) {
				responses.created(response, {
					id: message.id
				})
			}, function(err) {
				return helpers.handleDbErrors(err, self.assets.db, response);
			});
		} else {
			// reject bad request error
			responses.badRequest(response, "Bad or empty message");
			return;
		}
	},

	get: function(response, data) {
		var self = this,
			limit = Math.abs(data.limit) || self.limit,
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

module.exports = PublicMessages;