'use strict';

var helpers = require('../helpers'),
	mongoModels = require('./mongoModels'),
	mongoose = require('mongoose'),
	crypto = require('crypto'),
	responces = require('../responces');

function User (db, request, session, opts) {
	this.schema = ['id', 'name'];

	this.options = {
		standardName: 'anonimous'
	};

	this.assets = {
		db: db,
		request: request,
		session: session
	};

	this.init(opts);
}

User.prototype.init = function (opts) {
	helpers.setShemaData(this.schema, this, opts);
};

User.prototype.login = function (opts) {
	var self = this;

	// if in cookie exist id and token than try fo find this user in database
	var promise = null,
		id = this.assets.request.csession['id'],
		token = this.assets.request.csession['token'];
	if ( id && token ) {
		var objectId = mongoose.Types.ObjectId(id);
		
		promise = mongoModels.models.User.findById(objectId).exec();
		promise.then(function (err, user) {

		});
	}
	else {
		// creating user with name anonimous
		promise = this.countUsers();
		promise.then(function (err, count) {
			if ( err ) {
				responces.internalServerError(self.request);
				return;
			}


		});

		// // try to create user if now no exist active user with the same name
		// promise = mongoModels.models.User.findOne({ name: self.this }).exec();
		// promise.then(function (err, user) {
		// 	if ( user == null ) {
		// 		// user with this  name doesn't exist
		// 		// create token
		// 		crypto.randomBytes(48, function(ex, buf) {
		// 			token = buf.toString('hex');

		// 			mongoModels.models.User.create({
		// 				name: self.name,
		// 				token: token
		// 			});
		// 		});
		// 	}
		// 	else {
		// 		// this user already exist
		// 		//if ( usel.lastActivity )
		// 	}
		// });
	}
}

User.prototype.countUsers = function () {
	return mongoModels.models.User.count().exec();
}

User.prototype.createUser = function () {

}

User.prototype.createToken = function () {
	crypto.randomBytes(48, function(ex, buf) {
		var token = buf.toString('hex');
	});
}

module.exports = User;