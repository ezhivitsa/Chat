define(['pages/main', 'pages/privateMessages', 'pages/user'], 
	function (MainPage, PrivateMessagesPage, UserPage) {
		var pages = {
			'main': MainPage,
			'private-messages': PrivateMessagesPage,
			'user': UserPage
		};

		var body = document.querySelector('body'),
			bodyClass = body.className,
			currentPage = null;

		for ( var page in pages ) {
			if ( bodyClass.indexOf(page) + 1 ) {
				currentPage = pages[page];
				break;
			}
		}
		if ( !currentPage ) {
			return;
		}

		var page = new currentPage();
	}
);