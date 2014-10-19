define(['pages/main'], 
	function (MainPage) {
		var pages = {
			main: MainPage
		};

		var body = document.querySelector('body'),
			bodyClass = body.className,
			currentPage = null;

		for ( var page in pages ) {
			if ( bodyClass.indexOf(page) + 1 ) {
				currentPage = pages[page];
				break;
			}
			return;
		}

		var page = new currentPage();
	}
);