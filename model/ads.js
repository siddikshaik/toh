var DB = require('./db').DB,
	matchedAds = require('./matchedAds').matchedAds;

//services
var matcher = require('../services/matcher.js');

var encodeConstants = {
	adStatus:{open:0, matched: 1, closed : 2}
}

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
		return new Promise(function(success, error){
			return new ads(adMetaData).save().then(function(adMetaDataAdded){
				if(adMetaDataAdded){
					adMetaDataAdded = adMetaDataAdded.toJSON();
					adObj['id'] = adMetaDataAdded.id;
					if(adMetaDataAdded.adType === 'letting') {
						return new letting(adObj).save(adObj, {method: 'insert'}).then(function(){
							console.log('add :: '+JSON.stringify(this));
							matcher.getMatchForLettingAd(this.toJSON()).then(function(rentingAd, lettingAd){
								if(rentingAd && lettingAd){
									matchedAds.addEntry(rentingAd, lettingAd);
								}
							}, function(error){
								console.log('error while matching');
							});
							return success(this);	
						}).catch(function(err){
								new ads(adMetaDataAdded).destroy().then(function() {
								return error(err);
							});
						});
					}
					else if(adMetaDataAdded.adType === 'renting') {
						return new renting(adObj).save(adObj, {method: 'insert'}).then(function(){
							matcher.getMatchForRentingAd(this.toJSON()).then(function(rentingAd, lettingAd){
								if(rentingAd && lettingAd){
									matchedAds.addEntry(rentingAd, lettingAd);
								}
							}, function(error){
								console.log('error while matching');
							});
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
		return new Promise(function(success, error){
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
							if(ad.adStatus == 0){
								var lettingAd = this.toJSON();
								matcher.getMatchForLettingAd(lettingAd).then(function(rentingAd, lettingAd1){
									console.log("XXXXXXXXXXXXX");
									console.log("rentingAd :: "+JSON.stringify(rentingAd));
									console.log("lettingAd :: "+JSON.stringify(lettingAd));
									new matchedAds().addEntry(rentingAd, lettingAd).then(function(matchedAd){
										matchedAd = matchedAd.toJSON();
										console.log('matchedAd :: '+JSON.stringify(matchedAd));
										new ads({id: matchedAd.renting_ad_id, account_id: matchedAd.renting_account_id, adType: 'renting'}).save({adStatus: 1}, {patch:true}).then(function(ad){
											console.log("ad :: "+JSON.stringify(ad));
										});
									},function(error){
										console.log('err :: '+error);
									});
								}, function(error){
									console.log('error while matching');
								});
							}
							return success(this); 
						});
					}
					else if(ad.adType === 'renting') {
						console.log('updating renting adObj :: '+JSON.stringify(adObj));
						return new renting(adObj).save(adObj, {patch:true}).then(function(){
							if(ad.adStatus == 0){
								matcher.getMatchForRentingAd(this.toJSON()).then(function(rentingAd, lettingAd){
									if(rentingAd && lettingAd){
										matchedAds.addEntry(rentingAd, lettingAd);
									}
								}, function(error){
									console.log('error while matching');
								});
							}
							return success(this); 
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

	updateAdStatusForMatchedAd: function(matchedAd){
		console.log('updating ad status ');
		new ads({id: matchedAd.renting_ad_id, adType: 'renting'}).save({adStatus: 1}, {patch:true}).then(function(ad){
			console.log("ad :: "+JSON.stringify(ad));
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
	}

});

module.exports = {
	ads: DB.model('ads', ads),
	letting: DB.model('letting', letting),
	renting: DB.model('renting', renting)
};
