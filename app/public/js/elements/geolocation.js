define(['dataSource', 'helpers'],
	function(DataSource, Helpers) {

		function Geolocation() {
			this.attempt = 0;
			this.getLocation();
		}

		Geolocation.prototype = {

			constructor: Geolocation,

			getLocation: function() {
				var self = this;
				self.attempt++;

				navigator.geolocation.getCurrentPosition(function(position) {
					self.attempt = 0;
					DataSource.publishLocation({
						lat: position.coords.latitude,
						long: position.coords.longitude
					},function() {
						self.updateLocation.call(self);
					})
				}, function(err) {
					if (self.attempt < 3) {
						self.getLocation.call(self);
					} else {
						self.attempt = 0;
						self.updateLocation.call(self);
					}
				});
			},

			updateLocation: function() {
				var self = this;
				setTimeout(function() {
					self.getLocation.call(self);
				},1800000);
			}
		};

		return Geolocation;
	}
);