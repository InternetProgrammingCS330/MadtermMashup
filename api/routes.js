var express = require('express'),
    path = require('path');

module.exports = function(app) {
    require('./routes/login.js')(app)
    require('./routes/bot.js')(app, isLoggedIn)
    require('./routes/logout.js')(app)
    require('./routes/guest.js')(app)

    app.get('*',isLoggedIn, function(req, res){
      console.log("404 happened in routes");
    });

    
};

function isLoggedIn(req, res, next) {

    return next();

}