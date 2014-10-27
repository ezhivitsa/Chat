define(['helpers', 'dataSource'], 
	function (Helpers, DataSource) {
		function PublicMessages () {
			this.defaults = {
				limit: 10,
				isEnd: false,
				dateLastMessage: null,
				wrapperSelector: '.messages ul',
				textareaSelector: 'footer textarea',
				buttonSelector: 'footer button',
				messageTemplate: '<div>' +
									'<span class="author"><a href="$1">$2</a></span>' +
									'<span class="date">$3</span>' +
								  '</div>' +
								  '<div class="message">$4</div>'
			};

			this.init();
		}

		PublicMessages.prototype.init = function (options) {
			this.opts = Helpers.extend(options, this.defaults);

			this.opts.wrapper = document.querySelector(this.opts.wrapperSelector);
			this.opts.textarea = document.querySelector(this.opts.textareaSelector);
			this.opts.button = document.querySelector(this.opts.buttonSelector);
		}

		PublicMessages.prototype.getOldMessages = function () {
			var self = this;

			if ( !self.opts.isEnd ) {
				DataSource.getMessages(this.opts.dateLastMessage, -this.opts.limit, function (response, status) {
					if ( status == 200 ) {
						for ( var i = response.messages.length - 1; i >= 0 ; i-- ) {
							self._addMessageOnPage(response.messages[i]);
						}
					}
					self.opts.isEnd = response.isEnd;
				});
			}
		}

		PublicMessages.prototype.listenAddMessage = function () {
			var self = this;

			this.opts.button.addEventListener('click', function () {
				var text = self.opts.textarea.value;
				if ( text ) {
					DataSource.publishPublicMessage(text, function (response, status) {
						if ( status == 201 ) {
							self._addMessageOnPage(response.message);
							self.opts.textarea.value = '';
						}
					});
				}
			});
		}

		PublicMessages.prototype._addMessageOnPage = function (respMes) {
			var li = document.createElement('li');

			li.innerHTML = 
				this.opts.messageTemplate
					.replace('$1', respMes.author.id)
					.replace('$2', respMes.author.name)
					.replace('$3', respMes.time)
					.replace('$4', respMes.message);

			this.opts.wrapper.appendChild(li);
		}

		return PublicMessages;
	}
);