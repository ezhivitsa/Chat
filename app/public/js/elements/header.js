define(['elements/userName'],
	function (UserName) {
		function Header () {
			var userName = new UserName();
			userName.appendName();
		}

		return Header;
	}
);