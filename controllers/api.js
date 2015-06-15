//custom library
//model
var account = require('../model/account')
, profileTable = require('../model/profile')
, ads = require('../model/ads')
, matchedAds = require('../model/matchedAds').matchedAds;

var nodemailer = require("nodemailer"),
    smtpTransport = require('nodemailer-smtp-transport');


//vendor library
var moment = require('moment');

var mailconf = require('./mailconf.js');


var notAuthorisedJSON = {code: '1', message: 'not authorized'};
var failueJSON = {code: '2', message: 'failue'};

var getProfile = function(req, res, next) {
	new account.user({username: req.session.user}).fetch({columns: ['id', 'username', 'signupdate','status','accountKey']}).then(function(userAccountObj){
		userAccountObj = userAccountObj.toJSON();
		new profileTable.userProfile({account_id: userAccountObj.id}).fetch().then(function(userprofileObj){
			userprofileObj = userprofileObj.toJSON();
			res.json({userAccount: userAccountObj, userprofile: userprofileObj});
		});
	});
}

var putProfile = function(req, res, next) {
	new account.user({username: req.session.user}).fetch().then(function(userAccountObj){
		userAccountObj = userAccountObj.toJSON();
		if(userAccountObj){
			new profileTable.userProfile({account_id: userAccountObj.id}).updateProfile(req.body, userAccountObj).then(function(userprofileObj){
				sendSuccessJSON(req, res, null, {userAccount: userAccountObj, userprofile: userprofileObj});
				//sendMail(userAccountObj);
			});
		}
	});
}

var getAds = function(req, res, next){
	new account.user({username: req.session.user}).fetch().then(function(userAccountObj){
		ads.ads.where({account_id : userAccountObj.get('id'), adStatus: 0 }).fetchAll({withRelated:['adData']}).then(function(adObjs){
			sendSuccessJSON(req, res, next, adObjs);
		}, function(error){
			sendFailureJSON(req, res, next, error)
		});
	});
}

var getLettingAds = function(req, res, next) {
	new account.user({username: req.session.user}).fetch().then(function(userAccountObj){
		ads.ads.where({account_id : userAccountObj.get('id'), adStatus: 0, adType:'letting' }).fetchAll({withRelated:['adData']}).then(function(adObjs){
			sendSuccessJSON(req, res, next, adObjs);
		}, function(error){
			sendFailureJSON(req, res, next, error)
		});
	});
}

var getRentingAds = function(req, res, next) {
	new account.user({username: req.session.user}).fetch().then(function(userAccountObj){
		ads.ads.where({account_id : userAccountObj.get('id'), adStatus: 0, adType:'renting' }).fetchAll({withRelated:['adData']}).then(function(adObjs){
			sendSuccessJSON(req, res, next, adObjs);
		}, function(error){
			sendFailureJSON(req, res, next, error)
		});
	});
}

var getAdData = function(req, res, next){
	console.log('get Ad data');
	new account.user({username: req.session.user}).fetch().then(function(userAccountObj){
		ads.ads.where({account_id : userAccountObj.get('id'), id: req.params.adId }).fetch({withRelated:['adData']}).then(function(adObj){
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
	new account.user({username: req.session.user}).fetch().then(function(userAccountObj){
		adData['account_id'] = userAccountObj.get('id');
		adData['lastupdatedtime'] = moment().valueOf();
		adData['creationtime'] = moment().valueOf();
		new ads.ads(adData).add().then(function(adObj){
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
	new account.user({username: req.session.user}).fetch().then(function(userAccountObj){
		adData['account_id'] = userAccountObj.get('id');
		adData['lastupdatedtime'] = moment().valueOf();
		adData['id'] = req.params.adId;
		new ads.ads({id: req.params.adId, account_id : userAccountObj.get('id')}).update(adData).then(function(adObj){
			console.log("adObj after then ::" +JSON.stringify(adObj));
			sendSuccessJSON(req, res, next, adObj);	
		}, function(error){
			console.log('error :: '+JSON.stringify(error));
			sendFailureJSON(req, res, next, error);
		});
	});
}

var deleteAd = function(req, res, next) {
	new account.user({username: req.session.user}).fetch().then(function(userAccountObj){
		var searchObj = {account_id : userAccountObj.get('id'), id: req.params.adId};
		new ads.ads(searchObj).destroy().then(function(){
			sendSuccessJSON(req, res, next);
		}).catch(function(err){
			sendFailureJSON(req, res, next, err);
		});
	});
}

var getMessages = function(req, res, next) {
	new account.user({username: req.session.user}).fetch().then(function(userAccountObj){
		matchedAds.query({where: {renting_account_id : userAccountObj.get('id')}})
		.fetchAll({withRelated:['lettingAdData', 'letterProfile']}).then(function(rentingAdObjs){
			matchedAds.query({where: {letting_account_id : userAccountObj.get('id')}})
			.fetchAll({withRelated:['rentingAdData', 'renterProfile']}).then(function(lettingAdObjs){
				sendSuccessJSON(req, res, next, {'rentingAdObjs':rentingAdObjs, 'lettingAdObjs': lettingAdObjs});
			});
		})
	});
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

module.exports.getProfile = getProfile;
module.exports.getAds = getAds;
module.exports.getLettingAds = getLettingAds;
module.exports.getRentingAds = getRentingAds;
module.exports.getAdData = getAdData;
module.exports.getMessages = getMessages;

module.exports.putProfile = putProfile;
module.exports.postAd = postAd;
module.exports.putAd = putAd;
//module.exports.postOrPutAd = postOrPutAd;
module.exports.postMessages = postMessages;

module.exports.deleteAd = deleteAd;
