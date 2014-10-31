define(['elements/header', 'elements/userName', 'elements/privateMessages'],
	function (Header, UserName, PrivateMessages) {
		function PrivateMessagesPage () {
			var header = new Header(),
				privateMessages = new PrivateMessages();

			if ( window.location.hash ) {

			}
		}

		return PrivateMessagesPage;
	}
);