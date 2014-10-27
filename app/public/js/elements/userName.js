define(['dataSource', 'helpers'], 
	function (DataSource, Helpers) {
		function UserName (options) {
			this.defaults = {
				parentSelector: "header",
				elementSelector: ".name a",
				inputSelector: '#name',
				buttonSelector: 'button.change'
			};

			this.init(options);
		}

		UserName.prototype.init = function (options) {
			this.opts = Helpers.extend(options, this.defaults);

			this.opts.parent = document.querySelector(this.opts.parentSelector);
			this.opts.element = this.opts.parent.querySelector(this.opts.elementSelector);
			this.opts.input = document.querySelector(this.opts.inputSelector);
			this.opts.button = document.querySelector(this.opts.buttonSelector);
		}

		UserName.prototype.appendName = function () {
			var self = this;

			DataSource.getUserName(function (response, status) {
				if ( status == 200 ) {
					self.opts.element.innerHTML = response.name;
				}
			});
		}

		UserName.prototype.listenChangeName = function () {
			var self = this;

			this.opts.button.addEventListener('click', function () {
				var newName = self.opts.input.value;

				if ( newName ) {
					DataSource.updateName(newName, function () {
						
					});
				}
			});
		}

		return UserName;
	}
);