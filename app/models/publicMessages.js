'use strict';

var helpers = require('../helpers'),
	mongoModels = require('./mongoModels'),
	mongoose = require('mongoose'),
	responses = require('../responses');

function PublicMessages(db, eventEmitter) {

	this.options = {
		limit: 10
	}

	this.assets = {
		db: db,
		eventEmitter: eventEmitter
	};

	this.res = [];
}

PublicMessages.prototype = {

	constructor: PublicMessages,

	addListener: function () {
		var self = this;

		self.assets.eventEmitter.on('publishPublicMessage', function (message) {
			self.res.forEach(function () {
				responses.ok(response, { messages: message });
			});
		});		
	},

	publish: function(response, data, author) {
		var self = this;

		// check content of message field
		if (typeof data.message === "string" && data.message.length != 0) {
			var messageObj = {
				author: author,
				message: data.message
			};

			// save message
			var promise = mongoModels.models.PublicMessage.create(messageObj).exec();

			// trigger event of adding public message
			self.assets.emit('publishPublicMessage', messageObj);
			self.options.lastMessageTime = Date.now();
			
			promise.then(function(message) {
				responses.created(response, {
					message: message
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
			limit = Math.abs(data.limit) || self.options.limit,
			criteria = {};
		criteria[data.limit > 0 ? '$gt' : '$lt'] = data.time ? new Date(data.time) : new Date();

		if ( !data.time || data.time < self.options.lastMessageTime ) {
			// in the database exist message that we haven't got

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
		else {
			self.res.push(response);
			self.res.on('close', function () {
				self.res.splice(self.res.indexOf(response), 1);
			});
		}
	}
}

module.exports = PublicMessages;