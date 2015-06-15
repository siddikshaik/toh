var express = require('express')
, passport = require('passport')
, path = require('path')
, util = require('util')
, LocalStrategy = require('passport-local').Strategy
, session = require('express-session')
, cookieParser = require('cookie-parser')
, bcrypt = require('bcrypt-nodejs')
, bodyParser = require('body-parser')
, mysql = require('mysql')
, moment = require('moment')
, promise = require('promise')
, account = require('./model/account')
, app = express();

// Use the LocalStrategy within Passport.
passport.use(new LocalStrategy(function(username, password, done) {
	new account.user({username: username}).fetch().then(function(data) {
		var user = data;
        if(user === null) {
            return done(null, false, {message: 'Invalid username or password'});
        } else {
            user = data.toJSON();
            if(!bcrypt.compareSync(password, user.password)) {
                return done(null, false, {message: 'Invalid username or password'});
            } else {
                return done(null, user);
            }
        }
    });
}));

// Passport session setup.
passport.serializeUser(function(user, done) {
	done(null, user.username);
});

passport.deserializeUser(function(username, done) {
	new account.user({username: username}).fetch().then(function(user) {
        done(null, user);
    });
});

app.set('views', __dirname + '/views/content/login_access');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(cookieParser());
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({ secret: 'keyboard cat', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/views'));

app.listen(3333);

moment().format();

require('./routers')(app)

module.exports=app;