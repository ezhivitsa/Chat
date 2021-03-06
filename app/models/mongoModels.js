'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var modelsAndSchemas = {
	schemas: {
		user: new Schema({
			name: String,
			token: String,
			lastActivity: {
				type: Date,
				default: Date.now
			},
			geolocation: {
				type: {
					lat: Number,
					long: Number
				},
				default: {
					lat: 40.7127837,
					long: 74.0059413
				}
			}
		}, {
			collection: 'users'
		}),
		publicMessage: new Schema({
			author: {
				_id: Schema.Types.ObjectId,
				name: String
			},
			message: String,
			time: {
				type: Date,
				default: Date.now
			}
		}, {
			collection: 'publicMessages'
		}),
		privateMessage: new Schema({
			user1: {
				_id: Schema.Types.ObjectId,
				name: String
			},
			user2: {
				_id: Schema.Types.ObjectId,
				name: String
			},
			messages: [{
				message: String,
				time: {
					type: Date,
					default: Date.now
				},
				sender: {
					_id: Schema.Types.ObjectId
				},
				isRead: {
					type: Boolean,
					default: false
				}
			}]
		}, {
			collection: 'privateMessages'
		}),
	},
	models: {}
};


modelsAndSchemas.models.User = mongoose.model('User', modelsAndSchemas.schemas.user);
modelsAndSchemas.models.PublicMessage = mongoose.model('PublicMessage', modelsAndSchemas.schemas.publicMessage);
modelsAndSchemas.models.PrivateMessage = mongoose.model('PrivateMessage', modelsAndSchemas.schemas.privateMessage);

module.exports = modelsAndSchemas;