define(['helpers', 'dataSource'],
	function(Helpers, DataSource) {
		function PublicMessages() {
			this.defaults = {
				limit: 10,
				isEnd: false,
				dateLastMessage: null,
				animateSteps: 40,
				aniamteStepDuration: 3,
				dateFirstMessage: new Date(),
				wrapperSelector: '.messages ul',
				scrollWrapperSelector: '.scroll-wrapper',
				textareaSelector: '#message',
				buttonSelector: 'footer .send-message',
				loadMoreSelector: '.load-more',
				messageTemplate: '<core-item icon="input">' +
					'<div flex>' +
					'<a class="message-author" href="private-messages.html?id=$1" target="_self">$2</a>' +
					'<div class="date">$3</div>' +
					'<div class="message-text">$4</div>' +
					'</div>' +
					'</core-item>'
			};

			this.init();
		}

		PublicMessages.prototype.init = function(options) {
			this.opts = Helpers.extend(options, this.defaults);

			this.opts.wrapper = document.querySelector(this.opts.wrapperSelector);
			this.opts.textarea = document.querySelector(this.opts.textareaSelector);
			this.opts.button = document.querySelector(this.opts.buttonSelector);
			this.opts.loadMore = document.querySelector(this.opts.loadMoreSelector);
			this.opts.scrollWrapper = document.querySelector(this.opts.scrollWrapperSelector);
		}

		PublicMessages.prototype.getOldMessages = function(methodInsert) {
			var self = this;

			if (!self.opts.isEnd) {
				DataSource.getMessages(this.opts.dateLastMessage, -this.opts.limit, function(response, status) {
					if (status == 200) {
						var len = response.messages.length;
						var startHeight = self.opts.scrollWrapper.offsetHeight < self.opts.scrollWrapper.scrollHeight ? self.opts.scrollWrapper.scrollHeight : self.opts.scrollWrapper.offsetHeight;
						if (methodInsert === 'prepand') {
							for (var i = 0; i < len; i++) {
								self._addMessageOnPage(response.messages[i], methodInsert);
							}
							var endHeight = self.opts.scrollWrapper.offsetHeight < self.opts.scrollWrapper.scrollHeight ? self.opts.scrollWrapper.scrollHeight : self.opts.scrollWrapper.offsetHeight;
							self.opts.scrollWrapper.scrollTop = endHeight - startHeight;
						} else {
							for (var i = len - 1; i >= 0; i--) {
								self._addMessageOnPage(response.messages[i], methodInsert);
							}
							self.opts.scrollWrapper.scrollTop = self.opts.scrollWrapper.scrollHeight - self.opts.scrollWrapper.offsetHeight;
						}
						(len) && (self.opts.dateLastMessage = response.messages[len - 1].time);
						self.opts.isEnd = response.end;
						(response.end) && (self.opts.loadMore.style.display = "none");
					}
				});
			}
		}

		PublicMessages.prototype.listenAddMessage = function() {
			var self = this;

			var submitFunction = function() {
				var text = self.opts.textarea.value;
				console.log("submit",text)
				if (text) {
					DataSource.publishPublicMessage(text, function(response, status) {
						if (status == 201) {
							//self._addMessageOnPage(response.message);
							self.opts.textarea.value = '';
						}
					});
				}
			};
			this.opts.button.addEventListener('click', submitFunction);
			// this.opts.textarea.addEventListener('keydown', function(e) {
			// 	console.log("keydown")
			// 	if (e.keyCode == 13) {
			// 		console.log("enter")
			// 		e.preventDefault();
			// 		var event = document.createEvent("HTMLEvents");
   //  				event.initEvent("transitionend", true, true);
   //  				self.opts.textarea.dispatchEvent(event);
			// 		submitFunction();
			// 	}
			// });

		}

		PublicMessages.prototype.listenLoadMessages = function() {
			var self = this;

			this.opts.loadMore.addEventListener('click', function() {
				self.getOldMessages('prepand');
			});
		}

		PublicMessages.prototype._addMessageOnPage = function(respMes, position) {
			position = position || 'append';

			var li = document.createElement('li'),
				messageTime = new Date(respMes.time),
				time = messageTime.getDay() + '.' + (messageTime.getMonth() + 1) + '.' + messageTime.getFullYear();

			li.innerHTML =
				this.opts.messageTemplate
				.replace('$1', respMes.author._id)
				.replace('$2', respMes.author.name)
				.replace('$3', time)
				.replace('$4', respMes.message);

			if (position === 'append') {
				this.opts.wrapper.appendChild(li);
			} else {
				var children = this.opts.wrapper.childNodes;
				if (!children.length) {
					this.opts.wrapper.appendChild(li);
				} else {
					this.opts.wrapper.insertBefore(li, children[0]);
				}
			}
		}

		PublicMessages.prototype._animateToBottom = function(scrollingHeight, scrollInitial) {
			var self = this;
			this.animateTimer && clearTimeout(this.animateTimer);
			if (this.opts.scrollWrapper.scrollTop < scrollInitial + scrollingHeight) {
				var step = scrollingHeight / this.opts.animateSteps;
				this.opts.scrollWrapper.scrollTop += step;
				this.animateTimer = setTimeout(function() {
					self._animateToBottom.call(self, scrollingHeight, scrollInitial);
				}, this.opts.aniamteStepDuration);
			}
		};

		PublicMessages.prototype.listenChat = function() {
			var self = this;

			DataSource.getMessages(self.opts.dateFirstMessage, this.opts.limit, function(response, status) {
				if (status == 200) {
					var len = response.messages.length;
					var startHeight = self.opts.scrollWrapper.scrollHeight;
					for (var i = len - 1; i >= 0; i--) {
						self._addMessageOnPage(response.messages[i]);
					}
					var endHeight = self.opts.scrollWrapper.scrollHeight;
					if (endHeight > self.opts.scrollWrapper.offsetHeight) {
						self._animateToBottom.call(self, endHeight - startHeight, self.opts.scrollWrapper.scrollTop);
					}
					if (len) {
						if (!self.opts.dateLastMessage) {
							self.opts.dateLastMessage = response.messages[len - 1].time;
						}

						self.opts.dateFirstMessage = response.messages[0].time;
					}
				}

				self.listenChat();
			});
		}

		return PublicMessages;
	}
);