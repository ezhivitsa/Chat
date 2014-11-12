define(['dataSource', 'helpers','elements/header'],
	function(DataSource, Helpers, Header) {

		function UsersLocationsPage(options) {
			var header = new Header(),
				self = this;

			this.defaults = {
				mapId: 'users-map',
				mapOptions: {
					center: new google.maps.LatLng(44.5403, -78.5463),
					zoom: 10,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				}
			}
			header.getName(function (name) {
				self._username = name
				self.init(options);
			});
		}

		UsersLocationsPage.prototype = {

			constructor: UsersLocationsPage,

			init: function(options) {
				this.opts = Helpers.extend(options, this.defaults);

				this.userLocationsMap = document.getElementById(this.opts.mapId);

				this._map = new google.maps.Map(this.userLocationsMap, this.opts.mapOptions);
				this.addUsersMarkers();

			},

			addUsersMarkers: function() {
				var self = this;
				DataSource.getUsersLocations(function(resp, status) {
					if (status == 200) {
						var coords = null;
						for (var user in resp) {
							coords = new google.maps.LatLng(resp[user].geolocation.lat, resp[user].geolocation.long);
							(new google.maps.Marker({
								position: coords,
								map: self._map,
								title: resp[user].name
							}));
							if (self._username == resp[user].name) {
								self._map.setCenter(coords);
							}
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