'use strict';

var helpers = require('../helpers'),
	mongoModels = require('./mongoModels'),
	mongoose = require('mongoose'),
	crypto = require('crypto'),
	responses = require('../responses'),
	promise = require("bluebird");

var ONE_HOUR = 3600000;

function countUsers () {
	return mongoModels.models.User.count().exec();
}

function createToken (callback) {
	return promise.promisify(require("crypto").randomBytes);
	// crypto.randomBytes(48, function(ex, buf) {
	// 	var token = buf.toString('hex');

	// 	( callback ) && callback(token);
	// });
}

function User (db, request, response, session, opts) {
	this.schema = ['id', 'name'];

	this.options = {
		standardName: 'anonimous'
	};

	this.assets = {
		db: db,
		response: response,
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
		promise.then(function (user, onReject) {
			if ( onReject ) {
				return helpers.handleDbErrors(onReject, self.assets.db, self.assets.response);
			}

			if ( !user || user.token != token ) {
				// user was not found or some anouther user already use this account
				self.setIdAndToken(null, null);
				self.login();
			}
		});
	}
	else {
		// creating user with name anonimous
		promise = countUsers();
		promise.then(function (count, onReject) {
			if ( onReject ) {
				return helpers.handleDbErrors(onReject, self.assets.db, self.assets.response);
			}

			self.name = self.options.standardName + count;

			createToken(function (token) {
				self.token = token;
				var createPromise = self.createUser();

				createPromise.then(function (user, onReject) {
					if ( onReject ) {
						return helpers.handleDbErrors(onReject, self.assets.db, self.assets.response);
					}

					// adding id and token to the user sessiom cookie
					self.setIdAndToken(user._id, user.token);

					responses.created(self.assets.response, {
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

User.prototype.updateUserInfo = function (opts, callback) {
	var self = this,
		id = self.assets.request.csession['id'];

	if ( !id ) {
		return;
	}

	var objectId = mongoose.Types.ObjectId(id);
	createToken(48)
		.then(function (token) {
			var updates = helpers.extend({ token: token, lastActivity: Date.now() }, opts);
			mongoModels.models.User.findOneAndUpdate( { _id: id }, updates, function (err, user) {
				if ( err ) {
					return helpers.handleDbErrors(onReject, self.assets.db, self.assets.response);
				}

				self.setIdAndToken(id, token);
				( callback ) && callback();
			});
		});
}

User.prototype.updateName = function () {
	var self = this;

	mongoModels.models.User.findOne({ name: self.name }, function (err, user) {
		if ( err ) {
			return helpers.handleDbErrors(onReject, self.assets.db, self.assets.response);
		}

		if ( !user ) {
			// name available to use
		}
		else {
			// account with such name already created
			if ( user.lastActivity + ONE_HOUR > new Date() ) {
				// not possible to use this name
				responses.forbidden(self.assets.response, "This name is already in use");
			}
			else {
				self.assets.request.csession['id'] = user._id;
				self.updateUserInfo();
			}
		}
	});
	this.updateUserInfo({ name: this.name }, function () {
		// 200 ok updated
	});
}

User.prototype.setIdAndToken = function (id, token) {
	this.assets.request.csession['id'] = id;
	this.assets.request.csession['token'] = token;
	this.assets.session.csset(this.assets.request, this.assets.response);
}

module.exports = User;