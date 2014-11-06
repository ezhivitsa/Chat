define(['pages/main', 'pages/privateMessages', 'pages/user','pages/userLoactions','elements/geolocation'], 
	function (MainPage, PrivateMessagesPage, UserPage, UsersLocationsPage, Geolocation) {
		var pages = {
			'main': MainPage,
			'private-messages': PrivateMessagesPage,
			'user': UserPage,
			'locations': UsersLocationsPage
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

		var page = new currentPage(),
			geo = new Geolocation();
	}
);