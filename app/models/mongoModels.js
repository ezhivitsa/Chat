'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var modelsAndSchemas = {
	schemas: {
		user: new Schema({
			name: String,
			token: String,
			lastActivity: { type: Date, default: Date.now }
		}, {
			collection: 'users'
		}),
		publicMessage: new Schema({
			author: {
				_id: Schema.Types.ObjectId,
				name: String
			},
			message: String,
			time: { type: Date, default: Date.now }
		}, {
			collection: 'publicMessages'
		}),
		privateMessage: new Schema({
			author: {
				_id: Schema.Types.ObjectId,
				name: String
			},
			recipient: {
				_id: Schema.Types.ObjectId,
				name: String
			},
			message: String,
			time: { type: Date, default: Date.now },
			isRead: { type: Boolean, default: false }
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