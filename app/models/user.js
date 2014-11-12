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
	this.schema = ['id', 'name', 'lat', 'long'];

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

User.prototype.authorization = function(isActivity) {
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
				self.registerNew(resolver);
			} else {
				// user identified
				self.name = user.name;
				if (typeof self.lat == "number" && typeof self.long == "number") {
					user.geolocation.lat = self.lat;
					user.geolocation.long = self.long;
				}

				if (isActivity) {
					// changing token and updating last activity
					createToken()(48)
						.then(function(buf) {
							var newToken = buf.toString('hex');
							self.setIdAndToken(id, newToken);

							user.set('token', newToken);
							user.set('lastActivity', new Date())
							user.save(function() {
								resolver.resolve(user);
							});
						});
				} else {
					resolver.resolve(user);
				}
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

User.prototype.registerNew = function(resolver) {
	var self = this;

	var promise = countUsers();
	promise.then(function(count) {

		self.name = self.options.standardName + count;

		createToken()(48)
			.then(function(buf) {
				var token = buf.toString('hex');
				self.token = token;
				var createPromise = self.createUser();

				createPromise.then(function(user) {
					// adding id and token to the user sessiom cookie
					self.setIdAndToken(user._id.toString(), user.token);
					resolver.resolve(user);
				});
			}, function(err) {
				return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
			});
	}, function(err) {
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
	opts = opts || {};

	var self = this,
		id = self.assets.request.csession['id'];

	if (!id) {
		return;
	}

	var objectId = mongoose.Types.ObjectId(id);
	createToken()(48)
		.then(function(buf) {
			var token = buf.toString('hex'),
				updates = helpers.extend({
					token: token,
					lastActivity: Date.now()
				}, opts);


			mongoModels.models.User.findByIdAndUpdate(
				objectId,
				updates, function(err, user) {
					if (err) {
						return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
					}

					self.setIdAndToken(id, token);
					(callback) && callback(updates.name);
				});

			if (updates.name) {
				self._updateName('PublicMessage', 'author._id', "author.name", objectId, updates.name);
				self._updateName('PrivateMessage', 'user1._id', "user1.name", objectId, updates.name);
				self._updateName('PrivateMessage', 'user2._id', "user2.name", objectId, updates.name);
			}
		});
}

User.prototype._updateName = function(model, idSelector, nameSelector, id, name) {
	var self = this,
		finder = {},
		setter = {};

	finder[idSelector] = id;
	setter[nameSelector] = name;

	mongoModels.models[model].update(
		finder, {
			$set: setter
		}, {
			multi: true
		},
		function(err, messages) {
			if (err) {
				return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
			}
		}
	);
}

User.prototype.updateGeolocation = function() {
	var self = this,
		id = self.assets.request.csession['id'],
		geolocation = {};
	if (!id) {
		return;
	}
	if (typeof self.lat == "number" && typeof self.long == "number") {
		geolocation.lat = self.lat;
		geolocation.long = self.long;
	}
	var objectId = mongoose.Types.ObjectId(id);
	mongoModels.models.User.findByIdAndUpdate(objectId, {
		geolocation: geolocation
	}, function(err, user) {
		if (err) {
			return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
		}
		responses.ok(self.assets.response)
	});
};

User.prototype.getGeolocations = function() {
	var self = this;

	var promise = mongoModels.models.User.find({}).exec();

	promise.then(function(users) {
		var res = [];
		for (var user in users) {
			res.push({
				name: user.name,
				geolocation: user.geolocation
			})
		}
		responses.ok(self.assets.response, res);
	}, function(err) {
		return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
	});
};

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
			self.updateUserInfo({
				name: name
			}, function(newName) {
				// 200 ok updated
				responses.ok(self.assets.response, {
					name: self.name
				});
			});
		} else {
			// account with such name already created
			if (new Date(user.lastActivity).getTime() + ONE_HOUR > Date.now()) {
				// not possible to use this name
				responses.forbidden(self.assets.response, "This name is already in use");
			} else {
				self.assets.request.csession['id'] = user._id;
				self.id = user._id;
				self.updateUserInfo({}, function() {
					responses.ok(self.assets.response, {
						name: self.name
					});
				});
			}
		}
	});
}

User.prototype.setIdAndToken = function(id, token) {
	this.id = id;
	this.token = token;
	this.assets.request.csession['id'] = id;
	this.assets.request.csession['token'] = token;
	this.assets.session.csset(this.assets.request, this.assets.response);
}

User.prototype.sendName = function() {
	var self = this;
	responses.ok(self.assets.response, {
		name: self.name
	});
}

User.prototype.getUserByName = function(name) {
	var resolver = Promise.defer(),
		name = name || self.name;

	mongoModels.models.User.findOne({
		name: name
	}, function(err, user) {
		if (err) {
			return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
		}

		resolver.resolve(user);
	});

	return resolver.promise;
}

User.prototype.sendUserInfo = function() {
	var self = this;

	mongoModels.models.User.findById({
		_id: mongoose.Types.ObjectId(self.id)
	}, function(err, user) {
		if (err) {
			return helpers.handleDbErrors(err, self.assets.db, self.assets.response);
		}

		responses.ok(self.assets.response, {
			user: {
				id: user.id,
				name: user.name
			}
		})
	});
}

module.exports = User;