'use strict';

var responses = require('./responses'),
	helpers = require('./helpers'),
	fs = require('fs');

var paramRefExp = /{(\w+)}/g,
	fileRegExp = /.*(\w+\.(\w+))$/;

exports.route = function (request, response, session, pathname, method, handlers, publicFolder, defaultFile, data) {
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
				handlers[method][path](request, response, helpers.extend(pathParams, data), session);
				return;
			}
		}

		// check is need a file
		if ( method == 'get' && ( fileRegExp.test('/' + pathname) || pathname === '' ) ) {
			// trying to find file in the public folder

			pathname = pathname || defaultFile;

			//check is file exist
			fs.exists(publicFolder + '/' + pathname, function (exists) {
				if (exists) {
					// if file exist open and send it
					var readStream = fs.createReadStream(publicFolder + '/' + pathname),
						extention = pathname.match(fileRegExp)[2];

					switch (extention) {
						case 'html':
							response.writeHead(200, {'Content-Type': 'text/html'});
							break;
						case 'css':
							response.writeHead(200, {'Content-Type': 'text/css'});
							break;
						case 'js':
							response.writeHead(200, {'Content-Type': 'text/javascript'});
							break;
						default:
							response.writeHead(200);
							break;						
					}

					readStream.pipe(response);
				}
				else {
					responses.badRequest(response);
				}
			});
		}
		else {
			responses.badRequest(response);
		}
	}
	else {
		// method that not processed by the server
		// send 400 status code
		responses.badRequest(response);
	}
};