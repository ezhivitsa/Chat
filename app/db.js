'use strict';

var mongoose = require('mongoose'),
	helpers = require('./helpers');

function Db (opts) {
	this.defaults = {
		dbName: 'chat',
		user: 'ezhivitsa',
		password: '290494jen',
		host: 'ds043350.mongolab.com',
		port: '43350'
	};

	this.init(opts);
}

Db.prototype.init = function (opts) {
	this.options = helpers.extend(opts, this.defaults);
}

Db.prototype.connect = function () {
	var connectString = 'mongodb://';
	if ( this.options.user ) {
		connectString += this.options.user + ':' + this.options.password + '@';
	}
	connectString += this.options.host + ':' + this.options.port + '/' + this.options.dbName;

	mongoose.connect( connectString )
}

Db.prototype.disconnect = function () {
	mongoose.disconnect();
}

module.exports = Db;