var DB = require('./db').DB;
var promise = require('promise');

//services
var matcher = require('../services/matcher.js');

var adStatusConstants = { paymentAwaited : 'paymentAwaited', open: 'open', matched: 'matched', closed: 'closed' };

var letting = DB.Model.extend({
	tableName  : 'letting',
	adMetaData : function(){
		return this.morphOne(ads, 'adData', ['adType', 'id']);
	}
});

var renting = DB.Model.extend({
	tableName: 'renting',
	adMetaData : function(){
		return this.morphOne(ads, 'adData', ['adType', 'id']);
	}
});

var ads = DB.Model.extend({
	tableName  : 'ads',
	
	adData : function(){
		return this.morphTo('adData', ['adType','id'], letting, renting);
	},

	add : function(adData){
		adData = adData ? adData : this.toJSON();
		var adMetaData = {account_id : adData.account_id};
		adMetaData['adType'] = adData.adType;
		adObj = this.encodeData(adData);
		return new promise(function(success, error){
			return new ads(adMetaData).save().then(function(adMetaDataAdded){
				if(adMetaDataAdded){
					adMetaDataAdded = adMetaDataAdded.toJSON();
					adObj['id'] = adMetaDataAdded.id;
					if(adMetaDataAdded.adType === 'letting') {
						return new letting(adObj).save(adObj, {method: 'insert'}).then(function(){
							return success(this);	
						}).catch(function(err){
								new ads(adMetaDataAdded).destroy().then(function() {
								return error(err);
							});
						});
					}
					else if(adMetaDataAdded.adType === 'renting') {
						return new renting(adObj).save(adObj, {method: 'insert'}).then(function(){
							return success(this);	
						}).catch(function(err){
							new ads(adMetaDataAdded).destroy().then(function() {
							return error(err);
						});
					});
					}
					else{
						adMetaData.destroy().then(function() {
							return error();
						})
					}
				}
			});
		});
	},
	
	update : function(adData){
		adData = adData ? adData : this.toJSON();
		var adMetaData = {account_id : adData.account_id};
		adMetaData['adType'] = adData.adType;
		adMetaData['id'] = adData.id;
		
		var ad = new ads(adMetaData).fetch();
		return new promise(function(success, error){
			return ad.then(function(ad){
				if(ad){
					ad = ad.toJSON();
					if(adData.adStatus && adData.adStatus !== ad.adStatus){
						ad.save({'adStatus': adData.adStatus}, {patch:true});
					}
					adObj = this.encodeData(adData);
					console.log('ad :: '+JSON.stringify(ad));
					if(ad.adType === 'letting') {
						console.log('updating letting adObj :: '+JSON.stringify(adObj));
						return new letting(adObj).save(adObj, {patch:true}).then(function(){
							if(ad.adStatus == 'open'){
								matcher.getMatchForLettingAd(this.toJSON()).then(updateAdStatusForMatchedAd);
							}
							return success(this); 
						});
					}
					else if(ad.adType === 'renting') {
						console.log('updating renting adObj :: '+JSON.stringify(adObj));
						return new renting(adObj).save(adObj, {patch:true}).then(function(){
							if(ad.adStatus == 'open'){
								matcher.getMatchForRentingAd(this.toJSON()).then(updateAdStatusForMatchedAd);
							}
							return success(adObj);
						});
					}	
				}
				else{
					console.log('updating failed');
					success();
				}
			});
			error();
		});
	},

	encodeData : function(adObj){
		if(adObj.save){
			delete adObj['save'];
		}
		if(adObj.saveAdBtn){
			delete adObj['saveAdBtn'];
		}
		if(adObj.adType){
			delete adObj['adType'];
		}
		return adObj;
	},
	
	updateAdStatus : function(newAdStatus){
		var adObj = this;
		console.log('updating ad status {{adObj}} :: '+JSON.stringify(adObj));
		return new promise(function(success, failure){
			if(adObj && adObj.toJSON().id){
				console.log('updating ad status {{adObj}} :: '+JSON.stringify(adObj));
				return adObj.save({adStatus: newAdStatus}, {patch: true}).then(function(updatedAdObj){
					console.log('updatedAdObj :: '+JSON.stringify(updatedAdObj));
					if(updatedAdObj.toJSON().adStatus == adStatusConstants.open){
						updatedAdObj.fetch({withRelated:['adData']}).then(function(updatedAd){
							var adData = updatedAd.toJSON().adData;
							console.log('adData :: '+JSON.stringify(adData));
							if(updatedAdObj.toJSON().adType == 'letting'){
								matcher.getMatchForLettingAd(adData).then(updateAdStatusForMatchedAd);	
							}
							else {
								matcher.getMatchForRentingAd(adData).then(updateAdStatusForMatchedAd);
							}
						});
					}
					return success(updatedAdObj);
				});
			}
		});
	}

});

var updateAdStatusForMatchedAd = function(matchedAd, status, next){
	status = status ? status : adStatusConstants.matched ;
	console.log('updating ad status {{status}} :: '+status);
	new ads({id: matchedAd.renting_ad_id, adType: 'renting'}).updateAdStatus(status);
	new ads({id: matchedAd.letting_ad_id, adType: 'letting'}).updateAdStatus(status);
	if(next){ next(matchedAd); }
}

module.exports = {
	ads: DB.model('ads', ads),
	letting: DB.model('letting', letting),
	renting: DB.model('renting', renting),
	updateAdStatus: updateAdStatusForMatchedAd,
	adStatusConstants: adStatusConstants
};
