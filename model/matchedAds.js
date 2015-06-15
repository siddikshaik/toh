//vendor library
var moment = require('moment');

var knex = require('./db').knex
, DB = require('./db').DB
, profileTable = require('../model/profile')
, ads = require('./ads');

var matchedAds = DB.Model.extend({
	tableName  : 'matchedAds',

	rentingAdData: function(){
		return this.belongsTo('renting', 'renting_ad_id');
	},
	
	renterProfile: function(){
		return this.belongsTo('userProfile', 'renting_account_id');
	},
	
	lettingAdData: function(){
		return this.belongsTo('letting', 'letting_ad_id');
	},
	
	letterProfile: function(){
		return this.belongsTo('userProfile', 'letting_account_id');
	},
	
	addEntry: function(rentingAd, lettingAd){
		var newEntry = { renting_ad_id: rentingAd.id, renting_account_id: rentingAd.account_id
						, letting_ad_id: lettingAd.id, letting_account_id: lettingAd.account_id
						, matched_time: moment().valueOf(), last_updated_time: moment().valueOf() };
		
		return new Promise(function(success, failure) {
			return new matchedAds({ renting_ad_id: rentingAd.id, letting_ad_id: lettingAd.id,}).save(newEntry, {method: 'insert'}).then(function(entry){
				console.log("newEntry :: "+JSON.stringify(entry));
				return success(entry);
				//TODO : send mail to renter.
			});
		});
	}
	
	, updateEntryStatus: function(adStatus){
		this.save({status: adStatus}, {patch:true});
	}
	
	, getMatchedAds: function(userAccountObj){
		matchedAds.query({where: {renting_account_id : userAccountObj.get('id')}, orWhere: {letting_account_id : userAccountObj.get('id')}})
		.fetchAll().then(function(matchedObjs){
			console.log("matchedObjs :: "+JSON.stringify(matchedObjs));
		});
	}
	
	
});

module.exports.matchedAds = matchedAds;