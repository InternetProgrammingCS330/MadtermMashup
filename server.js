var express = require('express'),
    app = express(),
    bodyParser = require("body-parser"),
    path = require('path'),
	session = require('express-session'),
	cookieParser = require('cookie-parser'),
	google = require('googleapis'),
	urlshortener = google.urlshortener('v1'),
	OAuth2 = google.auth.OAuth2,
	oauth2Client = new OAuth2("alevar", "alevar", "google.com"),
	params = { shortUrl: 'http://goo.gl/xKbRu3' },
    server;


//============================================================================
//==========Check the If the Connection with the MySQL database is established
//============================================================================
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(cookieParser());

var scopes = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/calendar'
];

var url = oauth2Client.generateAuthUrl({
  access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
  scope: scopes // If you only need one scope you can pass it as string
});

urlshortener.url.get(params, function (err, response) {
  if (err) {
    console.log('Encountered error', err);
  } else {
    console.log('Long url is', response.longUrl);
  }
});

app.locals.rootDir = __dirname;

require(path.join(__dirname + '/api/routes.js'))(app)

var start = exports.start = function start(port, callback) {
    server = app.listen(port, callback);
};

var stop = exports.stop = function stop(callback) {
    server.close(callback);
};

start(3000);

console.log('Server running');
