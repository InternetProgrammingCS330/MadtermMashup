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
