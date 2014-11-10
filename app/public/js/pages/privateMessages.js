define(['elements/header', 'elements/userName', 'elements/privateMessages'],
	function (Header, UserName, PrivateMessages) {
		function PrivateMessagesPage () {
			var header = new Header(),
				privateMessages = new PrivateMessages();

			if ( window.location.hash ) {
				// show interlocutor info and dialog with him
				privateMessages.appendInterlocutorName();
				privateMessages.loadOldMessages();
				privateMessages.listenAddMessage();
				privateMessages.listenChat();
				privateMessages.listenLoadMessages();
			}
			else {
				// show all dialogs
				document.querySelector('body').classList.add('dialogs');
				privateMessages.appendAllDialogs();
			}
		}

		return PrivateMessagesPage;
	}
);