'use strict';

var helpers = require('./helpers'),
	mongoModels = require('./models/mongoModels'),
	mongoose = require('mongoose');

function User (db, request, session, opts) {
	this.schema = ['id', 'name'];

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
	// if in cookie exist id and token than try fo find this user in database
	var id = this.assets.request.csession['id'],
		token = this.assets.request.csession['token']
	if ( id && token ) {
		var objectId = mongoose.Types.ObjectId(id);
		mongoModels.models.User.findById(objectId);		
	}
	else {
		// try to create user if now no exist active user with the same name
	}
}

module.exports = User;