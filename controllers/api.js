//custom library
//model
var account = require('../model/account')
, profileTable = require('../model/profile')
, ads = require('../model/ads')
, matchedAds = require('../model/matchedAds').matchedAds;

var constants = require('../model/constants');

var nodemailer = require("nodemailer"),
    smtpTransport = require('nodemailer-smtp-transport');


//vendor library
var moment = require('moment');
var mailconf = require('./mailconf.js');

var notAuthorisedJSON = {code: '1', message: 'not authorized'};
var failueJSON = {code: '2', message: 'failure'};

var confirmMailAddress = function(req, res, next) {
	if(req.params.authKey){
		new account.user({accountKey: req.params.authKey}).updateStatus(account.status.active).then(function(){
			res.redirect('/home');
		}, function(){
			sendFailureJSON(req, res, next);
		});	
	}
	else if(req.session.authKey){
		new account.user({accountKey: req.session.authKey}).fetch().then(function(userAccount){
			if(userAccount){
				var confirmURL = req.protocol + '://' + req.get('host') + '/account/confirm/'+userAccount.get('accountKey');
				//Sending Mail for Registered User
				var mailOptions=mailconf.mailOptions.confirmation(userAccount, confirmURL);
				console.log(mailOptions);
				sendMail(mailOptions);
				//Sending Mail for Registered User
			}
			sendSuccessJSON(req, res, next, {message: 'Mail sent successfully'});
		}, function(){
			sendFailureJSON(req, res, next);
		});
	}
	
}

var passwordRecovery = function(req, res, next) {
	userData = req.body;
	console.log(userData)
	new account.user({username: userData.userEmail}).fetch().then(function(userAccount){
		if(userAccount){
			var confirmURL = req.protocol + '://' + req.get('host') + '/account/password/'+userAccount.get('accountKey');
			//Sending Mail for Registered User
			var mailOptions=mailconf.mailOptions.passwordRecovery(userAccount, confirmURL);
			console.log(mailOptions);
			sendMail(mailOptions);
			//Sending Mail for Registered User
			sendSuccessJSON(req, res, next, {message: 'success'});
		}
		else {
			sendFailureJSON(req, res, next, {message: 'invalid_user'});
		}
	}, function(){
		sendFailureJSON(req, res, next, {message: 'invalid_user'});
	});
}

var changePassword = function(req, res, next) {
	var newPassword = req.body.newPassword ? req.body.newPassword : req.params.newPassword;
	var userAccountKey = req.session.authKey ? req.session.authKey : req.params.authKey;
	if(!newPassword && req.params.authKey){
		req.session.accountKey = req.params.authKey;
		res.render('content/setNewPassword.html');
	}
	else {
		new account.user({accountKey: userAccountKey}).changePassword(newPassword).then(function(){
			sendSuccessJSON(req, res, next);
		}, function(){
			sendFailureJSON(req, res, next);
		});	
	}
}

var deleteAccount = function(req, res, next) {
	new account.user({accountKey: req.session.authKey}).updateStatus(account.status.deleted).then(function(){
		//TODO: all open matched ads of the user to be removed and mapped ads status to be changed.
		sendSuccessJSON(req, res, next);
	}, function(){
		sendFailureJSON(req, res, next);
	})
}

var getProfile = function(req, res, next) {
	new account.user({accountKey: req.session.authKey}).fetch({columns: ['id', 'username', 'signupdate','status'], withRelated:['profile']})
	.then(function(userAccountObj){
		sendSuccessJSON(req, res, next, {userAccount: userAccountObj});
	});
}

var putProfile = function(req, res, next) {
	new account.user({accountKey: req.session.authKey}).fetch().then(function(userAccountObj){
		userAccountObj = userAccountObj.toJSON();
		if(userAccountObj){
			new profileTable.userProfile({account_id: userAccountObj.id}).updateProfile(req.body, req.files, userAccountObj).then(function(userprofileObj){
				sendSuccessJSON(req, res, null, {userAccount: userAccountObj, userprofile: userprofileObj});
				//sendMail(userAccountObj);
			});
		}
	});
}

var getAds = function(req, res, next){
	new account.user({accountKey: req.session.authKey}).fetch().then(function(userAccountObj){
		ads.ads.where({account_id : userAccountObj.get('id')}).fetchAll({withRelated:['adData','adImages']}).then(function(adObjs){
			sendSuccessJSON(req, res, next, adObjs);
		}, function(error){
			sendFailureJSON(req, res, next, error)
		});
	});
}

var getLettingAds = function(req, res, next) {
	new account.user({accountKey: req.session.authKey}).fetch().then(function(userAccountObj){
		ads.ads.where({account_id : userAccountObj.get('id'), adType:'letting' }).fetchAll({withRelated:['adData']}).then(function(adObjs){
			sendSuccessJSON(req, res, next, adObjs);
		}, function(error){
			sendFailureJSON(req, res, next, error)
		});
	});
}

var getRentingAds = function(req, res, next) {
	new account.user({accountKey: req.session.authKey}).fetch().then(function(userAccountObj){
		ads.ads.where({account_id : userAccountObj.get('id'), adType:'renting' }).fetchAll({withRelated:['adData']}).then(function(adObjs){
			sendSuccessJSON(req, res, next, adObjs);
		}, function(error){
			sendFailureJSON(req, res, next, error)
		});
	});
}

var getAdData = function(req, res, next){
	console.log('get Ad data');
	new account.user({accountKey: req.session.authKey}).fetch().then(function(userAccountObj){
		ads.ads.where({account_id : userAccountObj.get('id'), id: req.params.adId }).fetch({withRelated:['adData', 'adImages']}).then(function(adObj){
			if(adObj){
				sendSuccessJSON(req, res, next, adObj);
			}
			else{
				sendFailureJSON(req, res, next)
			}
		}, function(error){
			sendFailureJSON(req, res, next, error)
		});
	});
}

var postAd = function(req, res, next) {
	var adData = req.body;
	new account.user({accountKey: req.session.authKey}).fetch().then(function(userAccountObj){
		adData['account_id'] = userAccountObj.get('id');
		adData['lastupdatedtime'] = moment().valueOf();
		adData['creationtime'] = moment().valueOf();
		new ads.ads(adData).add().then(function(adObj){
			var files = req.files;
			console.log(files);
			ads.addOrUpdateImagesToAd(files, userAccountObj.get('accountKey'), adObj.id);
			sendSuccessJSON(req, res, next, adObj);	
		}, function(error){
			console.log('error :: '+JSON.stringify(error));
			sendFailureJSON(req, res, next, error);
		});	
	});
}

var putAd = function(req, res, next) {
	if(!req.params.adId){
		sendFailureJSON(req, res, next, error);
	}
	var adData = req.body;
	new account.user({accountKey: req.session.authKey}).fetch().then(function(userAccountObj){
		adData['account_id'] = userAccountObj.get('id');
		adData['lastupdatedtime'] = moment().valueOf();
		adData['id'] = req.params.adId;
		new ads.ads({id: req.params.adId, account_id : userAccountObj.get('id')}).update(adData).then(function(adObj){
			var files = req.files;
			console.log(files);
			ads.addOrUpdateImagesToAd(files, userAccountObj.get('accountKey'), adObj.id);
			console.log("adObj after then ::" +JSON.stringify(adObj));
			sendSuccessJSON(req, res, next, adObj);	
		}, function(error){
			console.log('error :: '+JSON.stringify(error));
			sendFailureJSON(req, res, next, error);
		});
	});
}

var deleteAd = function(req, res, next) {
	new account.user({accountKey: req.session.authKey}).fetch().then(function(userAccountObj){
		var searchObj = {account_id : userAccountObj.get('id'), id: req.params.adId};
		new ads.ads(searchObj).destroy().then(function(){
			sendSuccessJSON(req, res, next);
		}).catch(function(err){
			sendFailureJSON(req, res, next, err);
		});
	});
}

var postPaymentForAd = function(req, res, next) {
	new account.user({accountKey: req.session.authKey}).fetch().then(function(userAccountObj){
		var searchObj = {account_id : userAccountObj.get('id'), id: req.params.adId};
		new ads.ads(searchObj).fetch().then(function(adObj){
			if(adObj){
				adObj.updateAdStatus(ads.adStatusConstants.open).then(function(){
					sendSuccessJSON(req, res, next);
				}).catch(function(err){
					sendFailureJSON(req, res, next, err);
				});
			}
			else {
				sendFailureJSON(req, res, next, {message: 'Invalid Ad'});
			}
		});
	});
}

var getMessages = function(req, res, next) {
	new account.user({accountKey: req.session.authKey}).fetch().then(function(userAccountObj){
		matchedAds.query({where: {renting_account_id : userAccountObj.get('id')}})
		.fetchAll({withRelated:['lettingAdData', 'letterProfile']}).then(function(rentingAdObjs){
			matchedAds.query({where: {letting_account_id : userAccountObj.get('id')}})
			.fetchAll({withRelated:['rentingAdData', 'rentingAdData.adImages', 'renterProfile']}).then(function(lettingAdObjs){
				sendSuccessJSON(req, res, next, {'rentingAdObjs':rentingAdObjs, 'lettingAdObjs': lettingAdObjs});
			});
		})
	});
}

var updateMessageStatus = function(req, res, next) {
	var action = req.params.action;
	var actionOnWhichAdType = req.params.adType;
	var adId = req.params.adId;
	var statusCodes = constants.status.matchedAds;
	new account.user({accountKey: req.session.authKey}).fetch().then(function(userAccountObj){
		var criteria = {};
		var status;
		if(actionOnWhichAdType == 'letting'){
			criteria = {letting_account_id : userAccountObj.get('id'), letting_ad_id: adId};
			status = action == 'accept' ? statusCodes.letterAccepted : statusCodes.letterDenied;
		}
		else if(actionOnWhichAdType == 'renting'){
			criteria = {renting_account_id : userAccountObj.get('id'), renting_ad_id: adId};
			status = action == 'accept' ? statusCodes.renterAccepted : statusCodes.renterDenied;
		}
		matchedAds.query({where: criteria }).where('status', 'in', [statusCodes.awaiting, statusCodes.letterAccepted, statusCodes.renterAccepted]).fetch().then(function(foundEntry){
			console.log('foundEntry :: '+JSON.stringify(foundEntry));
			if(foundEntry){
				if(action == 'accept'){
					if(actionOnWhichAdType == 'letting' && foundEntry.toJSON().status == statusCodes.renterAccepted){
						status = statusCodes.approved;
					} else if(actionOnWhichAdType == 'renting' && foundEntry.toJSON().status == statusCodes.letterAccepted){
						status = statusCodes.approved;
					}
				}
				foundEntry.updateEntryStatus(status).then(function(adStatus){
					if(adStatus){
						ads.updateAdStatus(foundEntry.toJSON(), adStatus);
					}
				});
				sendSuccessJSON(req, res, next);
			}
			else {
				sendFailureJSON(req, res, next, {message: 'No such match exists'});
			}
		}, sendFailureJSON);
	}, sendFailureJSON);
}

var postMessages = function(req, res, next) {
	res.render('messages.html');
}

var sendSuccessJSON = function(req, res, next, data) {
	res.json({code: '0', message: 'success', data: data});
}

var sendFailureJSON = function(req, res, next, err) {
	if(err && err.message){
		failueJSON['message'] = err.message;	
	}
	res.json(failueJSON);	
}

var sendNotAuthorizedJSON = function(req, res, next) {
	res.json(notAuthorisedJSON)
}

var authenticate = function (req, res, next) {
	if(req.isAuthenticated()) { 
		return next();
	}
	else {
		sendNotAuthorizedJSON(req, res, next);
	}
}

var sendMail = function(mailOptions){
	var result='';
	console.log(mailOptions);
	var transporter = nodemailer.createTransport(smtpTransport({
	  host: mailconf.conf.host,
	  port:mailconf.conf.port,
	  auth: {
	     user: mailconf.conf.username,
	     pass: mailconf.conf.password
	  },
	  tls: {
        rejectUnauthorized: false
      }
	}));
	transporter.sendMail(mailOptions, function(error, info){
		if(error){
		    console.log(error);
		    result=error;
		}
		else{
		    console.log(info);
		    result=info.response;      
		}
	});
	console.log(result);
}

module.exports.authenticate = authenticate;
module.exports.sendMail = sendMail;
module.exports.confirmAccount =confirmMailAddress;

module.exports.getProfile = getProfile;
module.exports.getAds = getAds;
module.exports.getLettingAds = getLettingAds;
module.exports.getRentingAds = getRentingAds;
module.exports.getAdData = getAdData;
module.exports.getMessages = getMessages;

module.exports.passwordRecovery = passwordRecovery;
module.exports.changePassword = changePassword;
module.exports.putProfile = putProfile;
module.exports.postAd = postAd;
module.exports.postPaymentForAd = postPaymentForAd;
module.exports.putAd = putAd;
//module.exports.postOrPutAd = postOrPutAd;
module.exports.postMessages = postMessages;
module.exports.updateMessageStatus = updateMessageStatus;

module.exports.deleteAd = deleteAd;
module.exports.deleteAccount = deleteAccount;

module.exports.sendFailureJSON= sendFailureJSON;
module.exports.sendSuccessJSON= sendSuccessJSON;