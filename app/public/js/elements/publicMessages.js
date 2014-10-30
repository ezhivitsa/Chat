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
				loadMoreSelector: '.load-more',
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
			this.opts.loadMore = document.querySelector(this.opts.loadMoreSelector);
		}

		PublicMessages.prototype.getOldMessages = function (methodInsert) {
			var self = this;

			if ( !self.opts.isEnd ) {
				DataSource.getMessages(this.opts.dateLastMessage, -this.opts.limit, function (response, status) {
					if ( status == 200 ) {
						var len = response.messages.length;
						if ( methodInsert === 'prepand' ) {
							for ( var i = 0; i < len ; i++ ) {
								self._addMessageOnPage(response.messages[i], methodInsert);
							}
						}
						else {
							for ( var i = len - 1; i >= 0 ; i-- ) {
								self._addMessageOnPage(response.messages[i], methodInsert);
							}							
						}
						( len ) && ( self.opts.dateLastMessage = response.messages[len - 1].time );
						self.opts.isEnd = response.end;
						( response.end ) && ( self.opts.loadMore.style.display = "none" );
					}
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

		PublicMessages.prototype.listenLoadMessages = function () {
			var self = this;

			this.opts.loadMore.addEventListener('click', function () {
				self.getOldMessages('prepand');
			});
		}

		PublicMessages.prototype._addMessageOnPage = function (respMes, position) {
			position = position || 'append';

			var li = document.createElement('li');

			li.innerHTML = 
				this.opts.messageTemplate
					.replace('$1', respMes.author.id)
					.replace('$2', respMes.author.name)
					.replace('$3', respMes.time)
					.replace('$4', respMes.message);

			if ( position === 'append' ) {
				this.opts.wrapper.appendChild(li);
			}
			else {
				var children = this.opts.wrapper.childNodes;
				if ( !children.length ) {
					this.opts.wrapper.appendChild(li);
				}
				else {
					this.opts.wrapper.insertBefore(li, children[0]);
				}
			}
		}

		return PublicMessages;
	}
);