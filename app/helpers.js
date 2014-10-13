(function () {
	'use strict';

	var responces = require('./responces');
	
	module.exports = {
		// extend all options of the first object and unique options of the second object
		extend: function (obj1, obj2) {
			obj1 = obj1 || {};
			obj2 = obj2 || {};

			var result = {},
				opt = null;

			for ( opt in obj2 ) {
				result[opt] = obj2[opt];
			}

			for ( opt in obj1 ) {
				result[opt] = obj1[opt];
			}

			return result;
		},
		trimStr: function (str, strExp) {
			str = str || "";
			return str.replace(new RegExp("^" + strExp + "+|" + strExp + "+$", 'g'), '');
		},
		// set options in first oject that exist in array shema and in second object
		setShemaData: function (schema, obj1, obj2, defaults) {
			for ( var opt in defaults ) {
				if ( schema.indexOf(opt) + 1 ) {
					obj1[opt] = defaults[opt];
				}
			}
			for ( var opt in obj2 ) {
				if ( schema.indexOf(opt) + 1 ) {
					obj1[opt] = obj2[opt];
				}
			}
		},
		handleDbErrors: function (err, db, responce) {
			if ( err ) {
				console.log(err);
				responces.internalServerError(responce);
				db.reconnect();
				return false;
			}
			return true;
		}
	};

})();