define(['elements/userName', 'elements/privateMessages'],
	function (UserName, PrivateMessages) {
		function Header () {
			var userName = new UserName(),
				privateMessages = new PrivateMessages();
				
			userName.appendName();
		}

		return Header;
	}
);