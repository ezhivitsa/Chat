define(['dataSource', 'helpers'], 
	function (DataSource, Helpers) {
		function PrivateMessages () {
			this.defaults = {
				parentSelector: "header",
				linkSelector: ".private-messages-count a",
				loadMoreSelector: '.load-more',
				ulSelector: 'section ul',
				limit: 10,
				isEnd: false,
				dateLastMessage: null,
				dateFirstMessage: new Date(),
				commonDialogTemplate: '<li><a href="/private-messages.js/#$1">$2 <span>$3</span></a></li>',
				dialogTemplate: '<li clas="$1"><span class="author">$2</span><span class="message">$3</span></li>'
			};

			this.init();
		}

		PrivateMessages.prototype.init = function (options) {
			this.opts = Helpers.extend(options, this.defaults);

			this.opts.parent = document.querySelector(this.opts.parentSelector);
			this.opts.link = document.querySelector(this.opts.linkSelector);
			this.opts.loadMore = document.querySelector(this.opts.loadMore);
			this.opts.ul = document.querySelector(this.opts.ul);
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

		PrivateMessages.prototype.appendInterlocutorName = function () {
			
		}

		return PrivateMessages;
	}
);