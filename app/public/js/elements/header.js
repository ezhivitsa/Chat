define(['elements/userName', 'elements/publicMessages', 'elements/privateMessages'],
	function (UserName, PublicMessages, PrivateMessages) {
		function Header () {
			var userName = new UserName(),
				privateMessages = new PrivateMessages();
				publicMessages = new PublicMessages();
				
			userName.appendName();
		}

		return Header;
	}
);