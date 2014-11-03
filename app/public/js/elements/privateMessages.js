define(['dataSource', 'helpers'], 
	function (DataSource, Helpers) {
		function PrivateMessages () {
			this.defaults = {
				parentSelector: "header",
				linkSelector: ".private-messages-count a",
				loadMoreSelector: '.load-more',
				ulSelector: 'section ul',
				textareaSelector: '#message',
				buttonSelector: 'footer button',
				interlocutorSelector: '.interlocutor',
				limit: 10,
				isEnd: false,
				dateLastMessage: null,
				dateFirstMessage: new Date(),
				commonDialogTemplate: '<li><a href="/private-messages.js/#$1">$2 <span>$3</span></a></li>',
				dialogTemplate: '<li class="$1"><span class="author">$2</span><span class="message">$3</span></li>'
			};

			this.init();
		}

		PrivateMessages.prototype.init = function (options) {
			this.opts = Helpers.extend(options, this.defaults);

			this.opts.parent = document.querySelector(this.opts.parentSelector);
			this.opts.link = document.querySelector(this.opts.linkSelector);
			this.opts.loadMore = document.querySelector(this.opts.loadMoreSelector);
			this.opts.ul = document.querySelector(this.opts.ulSelector);
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
					for ( var i = 0; i < response.dialogs.length; i++ ) {

					}
				}
			});
		}

		PrivateMessages.prototype.loadOldMessages = function () {
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

		PublicMessages.prototype._addMessageOnPage = function (respMes, position) {
			position = position || 'append';

			var li = document.createElement('li');

			li.innerHTML = 
				this.opts.messageTemplate
					.replace('$1', respMes.author._id)
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

		PrivateMessages.prototype.appendDialogMessages = function () {
			var self = this,
				id = window.location.hash;

			DataSource.getDialog(id, self.opts.dateLastMessage, self.opts.limit, function (response, status) {
				if ( status == 200 ) {

				}
			});
		}

		PrivateMessages.prototype.hideLoadMore = function () {
			this.opts.loadMore.style.display = "none";
		}

		PrivateMessages.prototype.hideHideTextarea = function () {
			this.opts.textarea.style.display = "none";
			this.opts.button.style.display = "none";
		}

		PrivateMessages.prototype.appendInterlocutorName = function () {
			var self = this,
				id = (window.location.hash) ? window.location.hash.substring(1) : '';

			DataSource.getUserNameById(id, function (response, status) {
				if ( status == 200 ) {
					self.opts.interlocutor.innerHTML = response.user.name;
				}
			});
		}

		PublicMessages.prototype.listenAddMessage = function () {
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

		return PrivateMessages;
	}
);