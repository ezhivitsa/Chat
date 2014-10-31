'use strict';

var helpers = require('../helpers'),
	mongoModels = require('./mongoModels'),
	mongoose = require('mongoose'),
	responses = require('../responses');

function PublicMessages(db, eventEmitter) {
	var self = this;

	this.options = {
		limit: 10
	}

	this.assets = {
		db: db,
		eventEmitter: eventEmitter
	};

	this.res = [];
	this.addListener();

	mongoModels.models.PublicMessage.findOne({}, null, {sort: {time: -1 }}, function (err, message) {
		self.options.lastMessageTime = (message) ? message.time.getTime() : null;
	});

}

PublicMessages.prototype = {

	constructor: PublicMessages,

	addListener: function () {
		var self = this;

		self.assets.eventEmitter.on('publishPublicMessage', function (message) {
			for ( var i = 0; i < self.res.length; i++ ) {
				responses.ok(self.res[i], { 
					messages: [message]
				});
			}

			self.res = [];
		});		
	},

	publish: function(response, data, author) {
		var self = this;

		// check content of message field
		if (typeof data.message === "string" && data.message.length != 0) {
			var messageObj = {
				author: {
					_id: author._id,
					name: author.name
				},
				message: data.message
			};

			// save message
			var promise = mongoModels.models.PublicMessage.create(messageObj);

			// trigger event of adding public message
			self.options.lastMessageTime = Date.now();
			
			promise.then(function(message) {
				self.assets.eventEmitter.emit('publishPublicMessage', message);
				responses.created(response, {
					message: message
				})
			}, function(err) {
				return helpers.handleDbErrors(err, self.assets.db, response);
			});
		}
		else {
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

		// if ( data.limit < 0 ) {
		// 	//get old messages
		// 	if ( !data.time || !self.options.lastMessageTime || data.time.getTime() < self.options.lastMessageTime.getTime() ) {
		// 		// get limited num of messages from page * limit position
				
		// 	}
		// 	else {
				
		// 	}
		// }
		// else {
		// 	self.res.push(response);
		// 	response.on('close', function () {
		// 		self.res.splice(self.res.indexOf(response), 1);
		// 	});
		// }
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

module.exports = PublicMessages;