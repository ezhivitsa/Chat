(function () {
	'use strict';
	
	module.exports = {
		// extend all options of the first object and unique options of the second object
		extend: function (obj1, obj2) {
			obj1 = obj1 || {};
			obj2 = obj2 || {};

			var result = obj2;

			for ( var opt in obj1 ) {
				result[opt] = obj1[opt];
			}

			return result;
		}
	};

})();