define(['elements/userName', 'elements/privateMessages', 'elements/privateMessages'],
	function (UserName, PublicMessages, PrivateMessages) {
		function Header () {
			var userName = new UserName(),
				publicMessages = new PublicMessages(),
				privateMessages = new PrivateMessages();
				
			userName.appendName();
		}

		return Header;
	}
);