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

				this.map = new google.maps.Map(this.userLocationsMap, this.opts.mapOptions);
				this.addUsersMarkers();

			},

			addUsersMarkers: function() {
				var self = this;
				DataSource.getUsersLocations(function(resp, status) {
					if (status == 200) {
						for (var user in resp) {
							(new google.maps.Marker({
								position: new google.maps.LatLng(resp[user].geolocation.lat, resp[user].geolocation.long),
								map: self.map,
								title: resp[user].name
							}));
						}
					} else {
						alert("Impossible to identify users locations");
					}
				});
			}
		}

		return UsersLocationsPage;
	}
);