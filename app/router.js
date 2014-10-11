'use strict';

var responces = require('./responces'),
	fs = require('fs');

var paramRefExp = /{(\w+)}/g,
	fileRegExp = /(.*)(\w+\.\w+)$/;

exports.route = function (pathname, method, handlers, publicFolder, request, response) {
	if ( handlers[method] ) {
		for ( var path in handlers[method] ) {
			// get path params from the query pattern
			var pathParams = {},
				match = null,
				pathRegString = path.replace(paramRefExp, "(\\w+)"),
				pathReg = new RegExp(pathRegString);

			if ( pathReg.test(pathname) ) {
				// url is the same as the pattern
				// finding path params
				var matchParamRes = pathReg.exec(pathname),
					i = 1;
				while ( (match = paramRefExp.exec(path)) != null && i < matchParamRes.length ) {
					pathParams[match[1]] = matchParamRes[i];
					i++;
				}

				// process request
				handlers[method][path](request, response);
				return;
			}
		}

		// check is need a file
		if ( fileRegExp.test('/' + pathname) ) {
			// trying to find file in the public folder

			//check is file exist
			fs.exists(publicFolder + '/' + pathname, function (exists) {
				if (exists) {
					// if file exist open and send it
					var readStream = fs.createReadStream(publicFolder + '/' + pathname);
					response.writeHead(200);
					readStream.pipe(response);
				}
				else {
					responces.badRequest(response);
				}
			});
		}
		else {
			responces.badRequest(response);
		}
	}
	else {
		// method that not processed by the server
		// send 400 status code
		responces.badRequest(response);
	}
};