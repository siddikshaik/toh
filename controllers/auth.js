//vendor library
var passport = require('passport');
	moment = require('moment');
var crypto = require('crypto');

//custom library
//model
var account = require('../model/account')
, profileTable = require('../model/profile');
//other controllers
var api = require('./api.js');
var mailconf = require('./mailconf.js');


//GET
var home = function(req, res, next) {
	res.render('home.html', {title: 'Home'});
};

//login
//POST
var loginPost = function(req, res, next) {
	passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login'}, function(err, user, info) {
		if(err) {
			return res.redirect('/');
		}

		if(!user) {
			return res.redirect('/');
		}
		return req.logIn(user, function(err) {
			if(err) {
				return res.redirect('/');
			} else {
				req.session.authKey = user.accountKey;
				return res.redirect('/home');
			}
		});
	})(req, res, next);
};

//register
//GET
var register = function(req, res, next) {
	res.render('register.html', {title: 'Sign Up'});
};

//register
//POST
var registerPost = function(req, res, next) {
	var user = req.body;
	var usernamePromise = null;
	usernamePromise = new account.user({username: user.username}).fetch();

	return usernamePromise.then(function(userAccount) {
		if(userAccount) {
			res.render('/register', {title: 'signup', errorMessage: 'username already exists'});
		} else {
			//****************************************************//
			// MORE VALIDATION GOES HERE(E.G. PASSWORD VALIDATION)
			//****************************************************//
			var password = user.passw;
//			var hash = bcrypt.hashSync(password);
			var signupdate = moment().valueOf();
			var hash = crypto.createHash('sha256').update(user.passw).digest("hex");
			var accountKey = crypto.createHash('sha256').update(user.username).digest("hex");
			var signUpUser = new account.user({username: user.username, password: hash, accountKey: accountKey, signupdate: signupdate })
				.add(user).then(function(userAccount){
					req.body.password = user.passw;
					loginPost(req, res, next);
					//Sending Mail for Registered User
					var mailOptions={
						from: mailconf.conf.from,
						to: userAccount.username,
						subject: 'Välkommen till TakÖverHuvudet bekräfta e-post',
						html: 'Hej '+userAccount.username+',<br/>Välkommen som kund hos oss, klicka på länken för att slutföra din registrering! :)<br/><br/> Varma hälsningar,<br/>Tak Över Huvudet Sverige'
					};
					api.sendMail(mailOptions);
					//Sending Mail for Registered User
				});
		}
	});
};

//sign out
var logout = function(req, res, next) {
	req.logout();
	res.redirect('/');
};

var ensureAuthenticated = function (req, res, next) {
	if (req.isAuthenticated()) { 
		return next(); 
	} else {
		res.redirect('/');
	}
};

//404 not found
var notFound404 = function(req, res, next) {
	res.status(404);
	res.render('404', {title: '404 Not Found'});
};

//export functions
/**************************************/
module.exports.authenticate = ensureAuthenticated;

//GET
module.exports.register = register;
module.exports.home = home;
module.exports.logout = logout;

//POST
module.exports.registerPost = registerPost;
module.exports.loginPost = loginPost;

//404 not found
module.exports.notFound404 = notFound404;