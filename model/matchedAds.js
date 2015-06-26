//vendor library
var moment = require('moment');
var promise = require('promise');

var DB = require('./db').DB;
var profileTable = require('../model/profile');
var ads = require('../model/ads');
var matchedAdStatusCodes = require('./constants').status.matchedAds;
var adStatusCodes = require('./constants').status.ads;

var matchedAds = DB.Model.extend({
	tableName  : 'matchedAds',
	idAttribute: ['renting_ad_id', 'letting_ad_id'],

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
		console.log('adding matched Ad entry');
		rentingAd = rentingAd ? rentingAd : rentingAd.toJSON();
		lettingAd = lettingAd ? lettingAd : lettingAd.toJSON();
		console.log('lettingAd :: '+JSON.stringify(lettingAd));

		var newEntry = { renting_ad_id: rentingAd.id, renting_account_id: rentingAd.account_id
						, letting_ad_id: lettingAd.id, letting_account_id: lettingAd.account_id
						, matched_time: moment().valueOf(), last_updated_time: moment().valueOf() };
		
		return new promise(function(success, failure) {
			return new matchedAds({ renting_ad_id: rentingAd.id, letting_ad_id: lettingAd.id,}).save(newEntry, {method: 'insert'})
			.then(function(entry){
				console.log("newEntry :: "+JSON.stringify(entry));
				return success(entry);
				//TODO : send mail to renter.
			});
		});
	}
	
	, updateEntryStatus: function(matchStatus){
		var matchedEntryObj = this;
		var matchedEntry = this.toJSON();
		console.log('matchedEntry :: '+JSON.stringify(matchedEntry));
		return new promise(function(success, failure){
			if(matchedEntry){
				var criteria = {renting_ad_id: matchedEntry.renting_ad_id, letting_ad_id: matchedEntry.letting_ad_id};
				matchedEntryObj.where(criteria).save({status: matchStatus, last_updated_time:moment().valueOf()}, {method:'update', patch:true})
				.then(function(updatedEntry){
					console.log('updatedEntry :: '+JSON.stringify(updatedEntry));
					return matchedEntryObj.fetch().then(function(matchedEntryObj){
						console.log('matchedEntryObj :: '+JSON.stringify(matchedEntryObj));
						var matchedEntryJSON = (matchedEntryObj && matchedEntryObj.status) ? matchedEntryObj : matchedEntryObj.toJSON();
						console.log('matchedEntryJSON && matchedEntryJSON.status :: '+ matchedEntryJSON.status );
						if(matchedEntryJSON && matchedEntryJSON.status) {
							var adStatus = adStatusCodes.matched;
							if(matchedEntryJSON.status == matchedAdStatusCodes.approved){
								adStatus = adStatusCodes.closed;
							} else if (matchedEntryJSON.status == matchedAdStatusCodes.renterDenied 
									|| matchedEntryJSON.status == matchedAdStatusCodes.letterDenied
									|| matchedEntryJSON.status == matchedAdStatusCodes.autoDenied){
								adStatus = adStatusCodes.open;
							}
							return success(adStatus);
						}
						else {
							return success();
						}
					});
				});
			}
			else {
				return failure({message : 'No such matched entry exist'});
			}
		});
	}
	
});

//var matchedAdExpiryDuration = 1000 * 60; // testing purpose
var matchedAdExpiryDuration = 1000 * 60 * 60 * 24 * 3; // For production

var autoDenyMatchedEntries = function(){
	console.log('Auto deny schedule triggered');
	matchedAds.query('where', 'matched_time', '<', moment().valueOf() - matchedAdExpiryDuration)
	.where('status', 'in', ['awaiting', 'letterAccepted', 'renterAccepted'])
	.fetchAll().then(function(matchedAdEntries){
		matchedAdEntries.mapThen(function(matchedEntry){
			console.log('matchedEntry ::' +JSON.stringify(matchedEntry));
			matchedEntry.updateEntryStatus(matchedAdStatusCodes.autoDenied)
			.then(function(adStatus) {
				if(adStatus) {
					ads.updateAdStatus(matchedEntry.toJSON(), adStatus);
				}
			});
		});
	});
}

var addMatchedAdEntry = function(rentingAd, lettingAd, next){
	return new matchedAds().addEntry(rentingAd, lettingAd).then(function(matchedAd){
		matchedAd = matchedAd.toJSON();
		console.log('matchedAd :: '+JSON.stringify(matchedAd));
		if(next){
			return next(matchedAd);	
		}
	});
}

module.exports.matchedAds = matchedAds;
module.exports.addMatchedAdEntry = addMatchedAdEntry;
module.exports.autoDenyMatchedEntries = autoDenyMatchedEntries;