var scheduler = require('node-schedule');
var moment = require('moment');

var matchedAds = require('../model/matchedAds');

var startAutoDenyScheduler = function(){
//	scheduler.scheduleJob('0 0 * * *', function(){ // for production
	scheduler.scheduleJob('0 * * * *', function(){
		matchedAds.autoDenyMatchedEntries();
	});
}

module.exports = {
	startAutoDenyScheduler : startAutoDenyScheduler
}
