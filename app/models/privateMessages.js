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

	this.res = {};
}

PrivateMessages.prototype = {

	constructor: PrivateMessages,

	init: function () {
		var self = this;

		self.assets.eventEmitter.on('publishPrivateMessage', function (message) {
			if ( self.res )
			responses.ok(self.res[i], { 
				messages: [message]
			});

			self.res = [];
		});
	},

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
			$or: [{user1: user._id}, {user2: user._id}]
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

	publish: function(response, db, data, user) {
		var self = this;

		if (typeof data.message !== "string" || data.message.length == 0) {
			responses.badRequest(self.assets.response, "Bad or empty recipient");
			return;
		}

		mongoModels.models.privateMessage.findOneAndUpdate(
		{ $or: [{user1: user._id}, {user2: user._id}] }, 
		{
			$push: {
				messages: {
					message: data.message,
					sender: mongoose.Types.ObjectId(data.id)
				}
			}
		}, 
		{safe: true, upsert: true},
		function (err, dialog) {
			if ( err ) {
				helpers.handleDbErrors(err, self.assets.db, self.assets.response);
			}

			// trigger event of send private message
			self.assets.eventEmitter.emit('publishPrivateMessage', message);
			responses.created(response, {
				message: message
			});
		});
	},

	get: function() {
		var self = this,
			limit = Math.abs(data.limit) || self.options.limit,
			criteria = {};
		criteria[data.limit > 0 ? '$gt' : '$lt'] = data.time ? new Date(data.time) : new Date();

		if ( data.limit < 0 ) {
			// old messages
			self._sendMessages(limit, criteria, response);
		}
		else {
			// new messages
			if ( !data.time ) {
				responses.badRequest(response);
			}
			else {
				if ( self.options.lastMessageTime && new Date(data.time).getTime() < self.options.lastMessageTime ) {
					self._sendMessages(limit, criteria, response);
				}
				else {
					self.res.push(response);
					response.on('close', function () {
						self.res.splice(self.res.indexOf(response), 1);
					});
				}
			}
		}		
	},

	_sendMessages: function (limit, criteria, response) {
		var self = this;

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
		});
	}
}

module.exports = PrivateMessages;