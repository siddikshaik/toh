//vendor library
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs'),
	moment = require('moment');

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

var profile = function(req, res, next) {
	new account.user({username: req.session.user}).fetch().then(function(userAccountObj){
		userAccountObj = userAccountObj.toJSON();
		new profileTable.userProfile({id: userAccountObj.id}).fetch().then(function(userprofileObj){
			userprofileObj = userprofileObj.toJSON();
			if(userprofileObj.accountType == 0){
				res.render('privateProfile.html');	
			}
			else {
				res.render('businessProfile.html');;
			}
		});
	});
}

var ads = function(req, res, next) {
	res.redirect('/home#/ads');
}

var messages = function(req, res, next) {
	res.redirect('/home#/messages');
}

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
				req.session.user = user.username;
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
			var hash = bcrypt.hashSync(password);
			var accountKey = bcrypt.hashSync(user.username);
			var signUpUser = new account.user({username: user.username, password: hash, accountKey: accountKey, signupdate: moment().valueOf(), status: '0'});

			signUpUser.save().then(function(userAccount) {
				userAccount = userAccount.toJSON()
				new profileTable.userProfile({account_id: userAccount.id}).updateProfile(user, userAccount).then(function(){
					console.log('profile success');
					req.body.password=user.passw;
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
				},function(){
					console.log('error in profile');
				})
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
module.exports.profile = profile;
module.exports.ads = ads;
module.exports.messages = messages;
module.exports.logout = logout;

//POST
module.exports.loginPost = loginPost;
module.exports.registerPost = registerPost;

//404 not found
module.exports.notFound404 = notFound404;