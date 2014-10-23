define(['dataSource', 'helpers'], 
	function (DataSource, Helpers) {
		function UserName (options) {
			this.defaults = {
				parentSelector: "header",
				elementSelector: ".name"
			};

			this.init(options);
		}

		UserName.prototype.init = function (options) {
			this.opts = Helpers.extend(options, this.defaults);

			this.opts.parent = document.querySelector(this.opts.parentSelector);
			this.opts.element = this.opts.parent.querySelector(this.opts.elementSelector);
		}

		UserName.prototype.appendName = function () {
			var self = this;

			DataSource.getUserName(function (response) {
				self.opts.element.innerHTML = response.name;
			});
		}

		return UserName;
	}
);