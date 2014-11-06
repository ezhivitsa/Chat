define(['dataSource', 'helpers'],
	function(DataSource, Helpers) {

		function UsersLocationsPage(options) {
			this.defaults = {
				mapId: 'users-map',
				mapOptions: {
					center: new google.maps.LatLng(44.5403, -78.5463),
					zoom: 8,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				}
			}

			this.init(options);
		}

		UsersLocationsPage.prototype = {

			constructor: UsersLocationsPage,

			init: function(options) {
				this.opts = Helpers.extend(options, this.defaults);

				this.userLocationsMap = document.getElementById(this.opts.mapId);

				var map = new google.maps.Map(this.userLocationsMap, this.opts.mapOptions);
			}
		}

		return UsersLocationsPage;
	}
);