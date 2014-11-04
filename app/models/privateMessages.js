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

	this.options = {
		limit: 10
	};

	this.res = {};
}

PrivateMessages.prototype = {

	constructor: PrivateMessages,

	init: function () {
		var self = this;

		self.assets.eventEmitter.on('publishPrivateMessage', function (message, user1, user2) {
			console.log(user1);
			console.log(user2);

			self._sendMessageToUser(user1);
			self._sendMessageToUser(user2);
		});
	},

	_sendMessageToUser: function (id) {
		if ( self.res.id ) {
			responses.ok(self.res.id, { 
				messages: [message]
			});
			
			self.res.id = null;
		}
	},

	count: function(response, db, data) {
		var self = this;

		var promise = mongoModels.models.PrivateMessage.count({
			$or: [{'user1._id': data.author._id}, {'user2._id': data.author._id}],
			'message.isRead': false
		}).exec();

		promise.then(function(count) {
			responses.ok(response, {
				count: count
			});
		}, function(err) {
			return helpers.handleDbErrors(err, db, response);
		});
	},

	getDialogs: function (response, db, user) {
		mongoModels.models.PrivateMessage.find({
			$or: [{'user1._id': user._id}, {'user2._id': user._id}]
		}, function (err, dialogs) {
			if (err) {
				helpers.handleDbErrors(err, self.assets.db, response);
			}

			var result = [];

			for ( var i = 0; i < dialogs.length; i++ ) {
				result[i] = {
					messages: {
						all: dialogs[i].messages.length,
						new: dialogs[i].messages.filter(function (message) {
							return (message.isRead === true) && ( message.sender._id.toString() !== user._id.toString() );
						}).length
					},
					interlocutor: ( dialogs[i].user1._id.toString() !== user._id.toString() ) ? dialogs[i].user1 : dialogs[i].user2
				};
			}

			responses.ok(response, {
				dialogs: result
			});
		});
	},

	publish: function(response, db, data, user) {
		var self = this,
			message = {},
			objectId = mongoose.Types.ObjectId(data.id);

		if (typeof data.message !== "string" || data.message.length == 0) {
			responses.badRequest(self.assets.response, "Bad or empty recipient");
			return;
		}

		message = {
			message: data.message,
			sender: {
				_id: user._id
			},
			time: new Date(),
			isRead: false
		};

		self.assets.eventEmitter.emit('publishPrivateMessage', message, id1, id2);

		mongoModels.models.PrivateMessage.findOne({ 
			$or: [
					{
						$and: [{'user1._id': user._id}, {'user2._id': objectId} ]
					},
					{
						$and: [{'user1._id': objectId}, {'user2._id': user._id} ],
					}
				]
		}, function (err, dialog) {
			if ( err ) {
				helpers.handleDbErrors(err, self.assets.db, response);
			}

			self._updateDialog(response, message, user._id, objectId);
		});		
	},

	_updateDialog: function (response, message, id1, id2) {
		var self = this;

		mongoModels.models.PrivateMessage.findOneAndUpdate(
			{ 
				$or: [
					{
						$and: [{'user1._id': id1}, {'user2._id': id2} ]
					},
					{
						$and: [{'user1._id': id2}, {'user2._id': id1} ],
					}
				]
			}, 
			{
				$push: {
					messages: message
				}
			}, 
			{safe: true, upsert: true},
			function (err, dialog) {
				if ( err ) {
					helpers.handleDbErrors(err, self.assets.db, response);
				}

				// trigger event of send private message
				self.assets.eventEmitter.emit('publishPrivateMessage', message, id1, id2);
				responses.created(response, {
					message: message
				});
			}
		);
	},

	get: function(response, data, user) {
		var self = this,
			limit = Math.abs(data.limit) || self.options.limit,
			criteria = {};
		criteria[data.limit > 0 ? '$gt' : '$lt'] = data.time ? new Date(data.time) : new Date();

		if ( data.limit && data.limit < 0 ) {
			// old messages
			self._sendMessages(response, data, user, limit, criteria);
		}
		else {
			// new messages
			self.res[user._id] = {};
			self.res[user._id][data.id] = response;

			response.on('close', function () {
				self.res[user._id][data.id] = null;
			});
		}		
	},

	_sendMessages: function (response, data, user, limit, criteria) {
		var self = this,
			objectId = mongoose.Types.ObjectId(data.id);

		var promise = mongoModels.models.PrivateMessage.findOne(
			{ 
				$or: [
					{
						$and: [{'user1._id': user._id}, {'user2._id': objectId} ]
					},
					{
						$and: [{'user1._id': objectId}, {'user2._id': user._id} ],
					}
				]
			}
			)
			.exec();

		promise.then(function(privateMessages) {

			if ( !privateMessages.length ) {
				self._checkExistingDialog(response, user, objectId);
			}

			var time = (data.time) ? new Date(data.time).getTime() : Date.now(),
				messages = ( privateMessages.messages.length ) ? privateMessages.messages : [];

			//console.log(messages)

			messages = messages.filter(function (message) {
				return message.time.getTime() < time;
			}).reverse().slice(0, limit + 1);

			for ( var i = 0; i < messages.length; i++ ) {
				messages[i].sender = user._id.toString() === messages[i].sender._id.toString();
			}

			var end = messages.length <= limit;
			!end && messages.pop();
			responses.ok(response, {
				messages: messages,
				end: end
			});
		}, function(err) {
			return helpers.handleDbErrors(err, self.assets.db, response);
		});
	},

	_checkExistingDialog: function (response, user, objectId) {
		mongoModels.models.PrivateMessage.findOne({ 
			$or: [
					{
						$and: [{'user1._id': user._id}, {'user2._id': objectId} ]
					},
					{
						$and: [{'user1._id': objectId}, {'user2._id': user._id} ],
					}
				]
		}, function (err, dialog) {
			if ( err ) {
				helpers.handleDbErrors(err, self.assets.db, response);
			}

			if ( !dialog ) {
				// dialog doesn't exist and it's need to create it
				mongoModels.models.User.findById(objectId, function (err, interlocutor) {
					if ( err ) {
						helpers.handleDbErrors(err, self.assets.db, response);
					}

					mongoModels.models.PrivateMessage.create({
						user1: {
							_id: user._id,
							name: user.name
						},
						user2: {
							_id: objectId,
							name: interlocutor.name
						},
						messages: []
					});
				});
			}
		});
	}
}

module.exports = PrivateMessages;