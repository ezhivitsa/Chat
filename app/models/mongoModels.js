'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

module.exports = {
	schemas: {
		user: new Schema({
			collection: 'users',
			name: String,
			token: String,
			lastActivity: { type: Date, default: Date.now }
		}),
		publicMessage: new Schema({
			collection: 'publicMessages',
			author: [{
				id: ObjectId,
				name: String
			}],
			message: String,
			time: { type: Date, default: Date.now }
		}),
		privateMessage: new Schema({
			collection: 'privateMessages',
			author: [{
				id: ObjectId,
				name: String
			}],
			recipient: [{
				id: ObjectId,
				name: String
			}]
			message: String,
			time: { type: Date, default: Date.now },
			isRead: Boolean
		}),
	},
	models: {
		User: mongoose.model('User', this.schemas.user),
		PublicMessage: mongoose.model('PublicMessage', this.schemas.publicMessage),
		privateMessage: mongoose.model('PrivateMessage', this.schemas.privateMessage)
	}
};