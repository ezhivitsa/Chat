define(['dataSource', 'helpers'], 
	function (DataSource, Helpers) {
		function PrivateMessages () {
			this.defaults = {
				parentSelector: "header",
				linkSelector: ".private-messages-count a"
			};

			this.init();
		}

		PrivateMessages.prototype.init = function (options) {
			this.opts = Helpers.extend(options, this.defaults);

			this.opts.parent = document.querySelector(this.opts.parentSelector);
			this.opts.link = document.querySelector(this.opts.linkSelector);
		}

		PrivateMessages.prototype.appendCount = function () {
			var self = this;

			DataSource.countNewPrivateMessages(function (response) {
				self.opts.link.innerHTML = response.count || 0;
			});
		}

		return PrivateMessages;
	}
);