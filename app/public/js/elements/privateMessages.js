define(['dataSource', 'helpers'], 
	function (DataSource, Helpers) {
		function PrivateMessages () {
			this.defaults = {
				parentSelector: "header",
				linkSelector: ".private-messages-count a",
				loadMoreSelector: '.load-more',
				wrapperSelector: 'section ul',
				textareaSelector: '#message',
				buttonSelector: 'footer .send-message',
				interlocutorSelector: '.interlocutor',
				limit: 10,
				isEnd: false,
				dateLastMessage: null,
				dateFirstMessage: new Date(),
				commonDialogTemplate: '<li><core-item icon="account-circle">' +
										'<div flex>'+
											'<a class="message-author" href="/private-messages.html/#$1" target="_self">$2</a>'+
											'<div class="number-of-messages">Number of messages: $3</div>'+
										'</div>'+
									 '</core-item></li>',
				dialogTemplate: '<span class="message"><paper-shadow z="1">$2</paper-shadow></span>'
			};

			this.init();
		}

		PrivateMessages.prototype.init = function (options) {
			this.opts = Helpers.extend(options, this.defaults);

			this.opts.parent = document.querySelector(this.opts.parentSelector);
			this.opts.link = document.querySelector(this.opts.linkSelector);
			this.opts.loadMore = document.querySelector(this.opts.loadMoreSelector);
			this.opts.wrapper = document.querySelector(this.opts.wrapperSelector);
			this.opts.textarea = document.querySelector(this.opts.textareaSelector);
			this.opts.button = document.querySelector(this.opts.buttonSelector);
			this.opts.interlocutor = document.querySelector(this.opts.interlocutorSelector);
		}

		PrivateMessages.prototype.appendCount = function () {
			var self = this;

			DataSource.countNewPrivateMessages(function (response) {
				self.opts.link.innerHTML = response.count || 0;
			});
		}

		PrivateMessages.prototype.appendAllDialogs = function () {
			var self = this;

			DataSource.getDialogs(function (response, status) {
				if ( status == 200 ) {
					var result = "";
					for ( var i = 0; i < response.dialogs.length; i++ ) {
						result += 
							self.opts.commonDialogTemplate
								.replace('$1', response.dialogs[i].interlocutor._id)
								.replace('$2', response.dialogs[i].interlocutor.name)
								.replace('$3', response.dialogs[i].messages.all);

					}
					self.opts.wrapper.innerHTML = result;
				}
			});
		}

		PrivateMessages.prototype.loadOldMessages = function (methodInsert) {
			var self = this,
				id = window.location.hash.substring(1);

			if ( !self.opts.isEnd ) {
				DataSource.getDialog(id, this.opts.dateLastMessage, -this.opts.limit, function (response, status) {
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

		PrivateMessages.prototype._addMessageOnPage = function (respMes, position) {
			position = position || 'append';

			var li = document.createElement('li');

			if ( respMes.sender ) {
				li.className = 'my';
			}

			li.innerHTML = 
				this.opts.dialogTemplate
					.replace('$2', respMes.message);

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

		PrivateMessages.prototype.appendDialogMessages = function () {
			var self = this,
				id = window.location.hash;

			DataSource.getDialog(id, self.opts.dateLastMessage, self.opts.limit, function (response, status) {
				if ( status == 200 ) {

				}
			});
		}

		PrivateMessages.prototype.appendInterlocutorName = function () {
			var self = this,
				id = (window.location.hash) ? window.location.hash.substring(1) : '';

			DataSource.getUserNameById(id, function (response, status) {
				if ( status == 200 ) {
					self.opts.interlocutor.innerHTML += response.user.name;
				}
			});
		}

		PrivateMessages.prototype.listenAddMessage = function () {
			var self = this,
				id = window.location.hash.substring(1);

			this.opts.button.addEventListener('click', function () {
				var text = self.opts.textarea.value;
				if ( text ) {
					DataSource.publishPrivateMessage(id, text, function (response, status) {
						if ( status == 201 ) {
							//self._addMessageOnPage(response.message);
							self.opts.textarea.value = '';
						}
					});
				}
			});
		}

		PrivateMessages.prototype.listenChat = function () {
			var self = this,
				id = window.location.hash.substring(1);

			DataSource.getDialog(id, self.opts.dateFirstMessage, this.opts.limit, function (response, status) {
				if ( status == 200 ) {
					var len = response.messages.length;
					for ( var i = len - 1; i >= 0 ; i-- ) {
						self._addMessageOnPage(response.messages[i]);
					}

					if ( len ) {
						if ( !self.opts.dateLastMessage ) {
							self.opts.dateLastMessage = response.messages[len - 1].time;
						}

						self.opts.dateFirstMessage = response.messages[0].time;
					}
				}

				self.listenChat();
			});
		}

		PrivateMessages.prototype.listenLoadMessages = function () {
			var self = this;

			this.opts.loadMore.addEventListener('click', function () {
				self.loadOldMessages('prepand');
			});
		}

		return PrivateMessages;
	}
);