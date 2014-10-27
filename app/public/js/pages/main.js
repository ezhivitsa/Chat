define(['elements/header', 'elements/publicMessages'], 
	function (Header, PublicMessages) {
		function MainPage() {
			var header = new Header(),
				publicMessages = new PublicMessages();

			publicMessages.getOldMessages()
			publicMessages.listenAddMessage();
		}

		return MainPage;
	}
);