define(['dataSource', 'helpers'], 
	function (DataSource, Helpers) {
		function PrivateMessages () {
			this.defaults = {
				parentSelector: "header",
				linkSelector: ".private-messages"
			};
		}

		PrivateMessages.prototype.init = function (options) {
			this.opts = Helpers.extend(options, this.defaults);

			this.opts.parent = document.querySelector(this.opts.parentSelector);
			this.opts.link = this.opts.parent.querySelector(this.opts.linkSelector);
		}

		PrivateMessages.prototype.appendCount = function () {
			var self = this;

			DataSource.countNewPrivateMessages(function (response) {
				self.opts.link.innerHTML = response.count;
			});
		}

		return PrivateMessages;
	}
);