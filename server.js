var express = require('express')
, passport = require('passport')
, path = require('path')
, util = require('util')
, LocalStrategy = require('passport-local').Strategy
, session = require('express-session')
, cookieParser = require('cookie-parser')
, bodyParser = require('body-parser')
, mysql = require('mysql')
, moment = require('moment')
, account = require('./model/account')
, crypto = require('crypto')
, app = express();

var multer = require('multer');
var fs = require('fs');

var scheduler = require('./services/scheduler.js');

// Use the LocalStrategy within Passport.
passport.use(new LocalStrategy(function(username, password, done) {
	new account.user({username: username}).fetch().then(function(data) {
		var user = data;
		if(user === null) {
			return done(null, false, {message: 'no_username'});
		} else {
			user = data.toJSON();
			if(crypto.createHash('sha256').update(password).digest("hex") !== user.password) {
				return done(null, false, {message: 'invalid_password'});
			} else {
				return done(null, data.pick('username', 'status', 'accountKey'));
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

app.use(session({ secret: 'keyboard cat', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/views'));

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(cookieParser());
app.use(bodyParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(multer({ 
	dest: __dirname + '/temp/uploads/',
	rename: function (fieldname, filename, req, res) {
		return fieldname +'_'+Date.now();
	},
	limits: {
		fileSize : 2097152,
		files: 3
	},
	onFileSizeLimit: function (file) {
		console.log('file size exceeded : ', file.originalname)
		fs.unlink(file.path) // delete the partially written file 
	},
	onFileUploadStart: function (file) {
		console.log(file);
		var isFileTypeAllowed = (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg');
		if (isFileTypeAllowed) {
			console.log(file.originalname + ' is starting ...');
		} else {
			console.log(file.mimetype);
			return false;
		}
	},
	onFileUploadComplete: function (file) {
		console.log(file.fieldname + ' uploaded to  ' + file.path)
		done=true;
	}
}));

app.listen(3333);

moment().format();

require('./routers')(app)

scheduler.startAutoDenyScheduler();

module.exports=app;