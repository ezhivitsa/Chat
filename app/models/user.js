'use strict';

var helpers = require('../helpers'),
	mongoModels = require('./mongoModels'),
	mongoose = require('mongoose'),
	crypto = require('crypto'),
	responces = require('../responces');

function countUsers () {
	return mongoModels.models.User.count({}).exec();
}

function createToken (callback) {
	crypto.randomBytes(48, function(ex, buf) {
		var token = buf.toString('hex');

		( callback ) && callback(token);
	});
}

function User (db, request, responce, session, opts) {
	this.schema = ['id', 'name'];

	this.options = {
		standardName: 'anonimous'
	};

	this.assets = {
		db: db,
		responce: responce,
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
		promise = countUsers();
		promise.then(function (err, count) {
			if ( err ) {
				return helpers.handleDbErrors(err, self.assets.db, self.assets.responce);
			}

			self.name = self.options.standardName + count;

			createToken(function (token) {
				self.token = token;
				promise = self.createUser();

				promise.then(function (err, user) {
					if ( err ) {
						return helpers.handleDbErrors(err, self.assets.db, self.assets.responce);
					}

					console.log(user);

					responces.created({
						id: user._id,
						token: user.token
					});
				});
			});
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


User.prototype.createUser = function () {
	var self = this;

	return mongoModels.models.User.create({
		name: self.name,
		token: self.token
	});
}


module.exports = User;