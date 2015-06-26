var DB = require('./db').DB;
var promise = require('promise');

var fs = require('fs');
var path = require("path");
var moment = require('moment');

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
	},
	adImages : function(){
		return this.hasMany('renting_ad_images', 'renting_ad_id');
	}
});

var renting_ad_images = DB.Model.extend({
	tableName: 'renting_ad_images',
	
	addOrupdateImagePath : function(fileObj, newPathString, adId){
		new renting_ad_images({field_name: fileObj.fieldname, renting_ad_id: adId})
		.fetch().then(function(imageObj){
			if(!imageObj){
				this.save({image_path: newPathString }, {method: 'insert'});
			}
			else {
				imageObj.where({field_name: fileObj.fieldname, renting_ad_id: adId}).save({'image_path': newPathString }, {method:'update', patch: true});
			}
		});
	}
});

var ads = DB.Model.extend({
	tableName  : 'ads',
	
	adData : function(){
		return this.morphTo('adData', ['adType','id'], letting, renting);
	},
	
	adImages : function(){
		return this.hasMany('renting_ad_images', 'renting_ad_id');
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
		if(adObj.accessDate){
			adObj['accessDate'] = moment(adObj.accessDate).valueOf();
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
							if(updatedAd && updatedAd.toJSON().adData){
								var adData = updatedAd.toJSON().adData;
								console.log('adData :: '+JSON.stringify(adData));
								if(updatedAdObj.toJSON().adType == 'letting'){
									matcher.getMatchForLettingAd(adData).then(updateAdStatusForMatchedAd);	
								}
								else {
									matcher.getMatchForRentingAd(adData).then(updateAdStatusForMatchedAd);
								}	
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

var addOrUpdateImagesToAd = function(files, accountKey, adId){
	var newPathPrefix = 'uploads/images/'+accountKey+"/ads/"+adId+'-';
	for(file in files){
		var eachFile = files[file];
		
		fs.rename(eachFile.path, path.join(__dirname, '../views/'+newPathPrefix + eachFile.fieldname+'.jpg'), function (err) {
			if (err) throw err;
		});
		
		new renting_ad_images().addOrupdateImagePath(eachFile, newPathPrefix + eachFile.fieldname+'.jpg', adObj.id);
	}
}

module.exports = {
	ads: DB.model('ads', ads),
	letting: DB.model('letting', letting),
	renting: DB.model('renting', renting),
	renting_ad_images: DB.model('renting_ad_images', renting_ad_images),
	updateAdStatus: updateAdStatusForMatchedAd,
	addOrUpdateImagesToAd: addOrUpdateImagesToAd,
	adStatusConstants: adStatusConstants
};
