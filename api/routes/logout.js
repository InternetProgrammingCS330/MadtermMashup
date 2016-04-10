var express = require('express'),
	path = require('path');

module.exports = function(app) {

	console.log("SIGNING OUT");

	app.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
}
