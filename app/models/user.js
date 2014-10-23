'use strict';

var helpers = require('../helpers'),
	mongoModels = require('./mongoModels'),
	mongoose = require('mongoose'),
	crypto = require('crypto'),
	responses = require('../responses'),
	Promise = require("bluebird");

var ONE_HOUR = 3600000;

function countUsers() {
	return mongoModels.models.User.count().exec();
}

function createToken() {
	return Promise.promisify(crypto.randomBytes);
}

function User(db, request, response, session, opts) {
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

User.prototype.init = function(opts) {
	helpers.setShemaData(this.schema, this, opts);
};

User.prototype.authorization = function(opts) {
	var self = this,
		resolver = Promise.defer();

	// if in cookie exist id and token than try fo find this user in database
	var promise = null,
		id = this.assets.request.csession['id'],
		token = this.assets.request.csession['token'];
	if (id && token) {
		var objectId = mongoose.Types.ObjectId(id);

		promise = mongoModels.models.User.findById(objectId).exec();
		promise.then(function(user) {
			if (!user || user.token != token) {
				// user was not found or some anouther user already use this account
				self.setIdAndToken(null, null);
				self.registerNew(resolver);
			}
			else {
				// user identified
				self.setIdAndToken(user._id, user.token);
				self.name = user.name;
				resolver.resolve(user);
			}
		}, function(err) {
			return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
		});
	} else {
		// creating user with name anonimous
		self.registerNew(resolver);
	}

	return resolver.promise;
}

User.prototype.registerNew = function (resolver) {
	var self = this;

	var promise = countUsers();
	promise.then(function (count) {

		self.name = self.options.standardName + count;

		createToken()(48)
			.then(function (buf) {
				var token = buf.toString('hex');
				self.token = token;
				var createPromise = self.createUser();

				createPromise.then(function(user) {
					// adding id and token to the user sessiom cookie
					self.setIdAndToken(user._id, user.token);
					resolver.resolve(user);

					// responses.created(self.assets.response, {
					// 	id: user._id,
					// 	token: user.token
					// });
				});
			}, function (err) {
				return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
			});
	}, function (err) {
		return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
	});
}

User.prototype.createUser = function() {
	var self = this;

	return mongoModels.models.User.create({
		name: self.name,
		token: self.token
	});
}

User.prototype.updateUserInfo = function(opts, callback) {
	var self = this,
		id = self.assets.request.csession['id'];

	if (!id) {
		return;
	}

	var objectId = mongoose.Types.ObjectId(id);
	createToken(48)
		.then(function(token) {
			var updates = helpers.extend({
				token: token,
				lastActivity: Date.now()
			}, opts);


			mongoModels.models.User.findOneAndUpdate({
				_id: objectId
			}, updates, function(err, user) {
				if (err) {
					return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
				}

				self.setIdAndToken(id, token);
				(callback) && callback(user);
			});
		});
}

User.prototype.updateName = function(name) {
	var self = this;

	self.name = name || self.name;

	mongoModels.models.User.findOne({
		name: self.name
	}, function(err, user) {
		if (err) {
			return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
		}

		if (!user) {
			// name available to use
		} else {
			// account with such name already created
			if (user.lastActivity + ONE_HOUR > new Date()) {
				// not possible to use this name
				responses.forbidden(self.assets.response, "This name is already in use");
			} else {
				self.assets.request.csession['id'] = user._id;
				self.id = user._id;
				self.updateUserInfo();
			}
		}
	});
	this.updateUserInfo({
		name: this.name
	}, function() {
		// 200 ok updated
	});
}

User.prototype.setIdAndToken = function(id, token) {
	this.id = id;
	this.token = token;
	this.assets.request.csession['id'] = id;
	this.assets.request.csession['token'] = token;
	this.assets.session.csset(this.assets.request, this.assets.response);
}

User.prototype.sendName = function () {
	var self = this;
	responses.ok(self.assets.response, { name: self.name });
}

User.prototype.getUserByName = function (name) {
	var resolver = Promise.defer(),
		name = name || self.name;

	mongoModels.models.User.findOne({ name: name }, function (err, user) {
		if ( err ) {
			return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
		}

		resolver.resolve(user);
	});

	return resolver.promise;
}

module.exports = User;