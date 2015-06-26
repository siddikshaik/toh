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
	res.render('content/login_access/home.html', {title: 'Home'});
};

var login = function(req, res, next) {
	res.render('index.html');
}

var register = function(req, res, next) {
	var content = req.params.type ? 'content/register'+req.params.type+'.html' : 'content/register.html'
	res.render(content);
}

//login
//POST
var loginPost = function(req, res, next) {
	passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login'}, function(err, user, info) {
		if(err) {
			return api.sendFailureJSON(req, res, next, err);
		}

		if(!user) {
			return api.sendFailureJSON(req, res, next, info);
		}
		return req.logIn(user, function(err) {
			if(err) {
				return api.sendFailureJSON(req, res, next, err);
			} else {
				req.session.authKey = user.accountKey;
				return api.sendSuccessJSON(req, res, next, user);
			}
		});
	})(req, res, next);
};

//register
//POST
var registerPost = function(req, res, next) {
	var user = req.body;
	var usernamePromise = null;
	usernamePromise = new account.user({username: user.username}).fetch();

	return usernamePromise.then(function(userAccount) {
		if(userAccount) {
			return api.sendFailureJSON(req, res, next, {message: 'same_user'});
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
				.add(user, req.files).then(function(userAccount){
					req.body.password = user.passw;
					loginPost(req, res, next);

					var confirmURL = req.protocol + '://' + req.get('host') + '/api/account/confirm/'+userAccount.get('accountKey');
					//Sending Mail for Registered User
					var mailOptions=mailconf.mailOptions.confirmation(userAccount, confirmURL);
					console.log(mailOptions);
					sendMail(mailOptions);
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
		res.redirect('/login');
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
module.exports.login = login;
module.exports.register = register;
module.exports.home = home;
module.exports.logout = logout;

//POST
module.exports.registerPost = registerPost;
module.exports.loginPost = loginPost;

//404 not found
module.exports.notFound404 = notFound404;
