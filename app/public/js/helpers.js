define([],
	function () {
		return {
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
			}
		}
	}
);