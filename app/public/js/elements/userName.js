define(['dataSource', 'helpers'], 
	function (DataSource, Helpers) {
		function UserName (options) {
			this.defaults = {
				parentSelector: "header",
				elementSelector: ".name",
				inputSelector: '#name',
				buttonSelector: '.change',
				errorSelector: '.error'
			};

			this.init(options);
		}

		UserName.prototype.init = function (options) {
			this.opts = Helpers.extend(options, this.defaults);

			this.opts.parent = document.querySelector(this.opts.parentSelector);
			this.opts.element = this.opts.parent.querySelector(this.opts.elementSelector);
			this.opts.input = document.querySelector(this.opts.inputSelector);
			this.opts.button = document.querySelector(this.opts.buttonSelector);
			this.opts.error = document.querySelector(this.opts.errorSelector);
		}

		UserName.prototype.appendName = function (callback) {
			var self = this;

			DataSource.getUserName(function (response, status) {
				if ( status == 200 ) {
					self.opts.element.innerHTML = response.name;
					callback && callback(response.name);
				}
			});
		}

		UserName.prototype.listenChangeName = function () {
			var self = this;

			this.opts.button.addEventListener('click', function () {
				var newName = self.opts.input.value;

				if ( newName ) {
					DataSource.updateName(newName, function (response, status) {
						switch ( status ) {
							case 200:
								self.updateName(response.name);
								self.opts.input.value = "";
								self.opts.error.style.display = "none";
								break;
							case 403:
								self.opts.error.style.display = "block";
								self.opts.error.innerHTML = response.message;
								break;
						} 
					});
				}
			});
		}

		UserName.prototype.updateName = function (name) {
			this.opts.element.innerHTML = name;
		}

		return UserName;
	}
);