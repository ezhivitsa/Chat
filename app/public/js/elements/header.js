define(['elements/userName', 'elements/privateMessages'],
	function(UserName, PrivateMessages) {
		function Header() {
			var userName = new UserName(),
				privateMessages = new PrivateMessages(),
				self = this;

			userName.appendName(function(name) {
				self._userName = name;
			});
			// privateMessages.appendCount();
		}

		Header.prototype.getName = function(callback) {
			var self = this;
			if (this._userName) {
				return callback ? callback(this._userName) : this._userName;
			} else {
				setTimeout(function() {
					self.getName.call(self, callback);
				}, 100)
			}
		};

		return Header;
	}
);