var promise = require('promise');
var knex = require('../model/db').knex
, matchedAds = require('../model/matchedAds')
, profile = require('../model/profile');

var getMatchForRentingAd = function(adObj){
	adObj = adObj ? adObj : adObj.toJSON();
	console.log('adObj inside matcher :: '+JSON.stringify(adObj));
	var subQueryForRejectedAdIds = knex.select('letting_ad_id').from('matchedAds').where('renting_ad_id', adObj.id);
	var query = knex.select('letting.*').from('letting').innerJoin('ads', 'letting.id', 'ads.id');
	if(adObj.forWhom != 'any' || adObj.gender != 'any'){
		query = query.innerJoin('profile', 'letting.account_id', 'profile.account_id');
	}
	query = query.whereNotIn('letting.id', subQueryForRejectedAdIds)
		.andWhere('letting.account_id', '!=', adObj.account_id)
		.andWhere('ads.adStatus', 'open')
		.andWhere('letting.state', 'in', ['any', adObj.state])
		.andWhere('letting.municipality', 'in', ['any', adObj.municipality])
//		.andWhere('letting.area', adObj.area)
//		.andWhere('letting.duration', '<=', adObj.minTimeToRent)
		.andWhere('letting.accommodationType', 'in', ['any', adObj.accommodationType])
		.andWhere('letting.minSize', '<=', adObj.size)
		.andWhere('letting.minRooms', '<=', adObj.numOfRooms)
		.andWhere('letting.contract', 'in', ['any', adObj.contract])
		.andWhere('letting.balcony', 'in', ['any', adObj.balcony])
		.andWhere('letting.furnished', 'in', ['any', adObj.furnished])
		.andWhere('letting.floor', 'in', ['any', adObj.floor])
		.andWhere('letting.elevator', 'in', ['any', adObj.elevator])
		.andWhere('letting.maxPrice', '>=', adObj.price)
		.andWhere('letting.period', 'in', ['any', adObj.period]);
		if(adObj.forWhom != 'any'){
			query = query.where('profile.accountType', adObj.forWhom);
		}
		if(adObj.gender != 'any'){
			query = query.where('profile.gender', adObj.gender);
		}
		query = query.orderBy('creationtime', 'asc').limit(1);
	console.log('query :: '+query);
	
	return new promise(function(success, failure){
		return query.then(function(rows){
			if(rows && rows[0]){
				matchedAds.addMatchedAdEntry(adObj, rows[0], success);
			}
			else {
				return failure();
			}
		});
	});
}

var getMatchForLettingAd = function(adObj){
	adObj = adObj ? adObj : adObj.toJSON();
	console.log('adObj :: '+JSON.stringify(adObj));
	var subQueryForRejectedAdIds = knex.select('renting_ad_id').from('matchedAds').where('letting_ad_id', adObj.id);
	console.log('subQueryForRejectedAdIds :: '+subQueryForRejectedAdIds);
	var matchedRentingAdQuery = knex.select('renting.*').from('renting').innerJoin('ads', 'renting.id', 'ads.id')
		.whereNotIn('renting.id', subQueryForRejectedAdIds)
		.andWhere('renting.account_id', '!=', adObj.account_id)
		.andWhere('ads.adStatus', 'open')
//		.andWhere('renting.minTimeToRent', '>=', adObj.duration)
		.andWhere('renting.size', '>=', adObj.minSize)
		.andWhere('renting.numOfRooms', '>=', adObj.minRooms)
		.andWhere('renting.price', '<=', adObj.maxPrice);
	if(adObj.state && adObj.state !== 'any'){
		matchedRentingAdQuery.andWhere('renting.state', adObj.state);	
	}
	if(adObj.municipality && adObj.municipality !== 'any'){
		matchedRentingAdQuery.andWhere('renting.municipality', adObj.municipality);
	}
//	if(adObj.area && adObj.area !== ''){
//		matchedRentingAdQuery.andWhere('renting.area', adObj.area);
//	}
	if(adObj.accommodationType && adObj.accommodationType !== 0){
		matchedRentingAdQuery.andWhere('renting.accommodationType', adObj.accommodationType);
	}
	if(adObj.contract && adObj.contract !== 'any'){
		matchedRentingAdQuery.andWhere('renting.contract', adObj.contract);
	}
	if(adObj.balcony && adObj.balcony !== 'any'){
		matchedRentingAdQuery.andWhere('renting.balcony', adObj.balcony);
	}
	if(adObj.furnished && adObj.furnished !== 'any'){
		matchedRentingAdQuery.andWhere('renting.furnished', adObj.furnished);
	}
	if(adObj.floor && adObj.floor !== 'any'){
		matchedRentingAdQuery.andWhere('renting.floor', adObj.floor);
	}
	if(adObj.elevator && adObj.elevator !== 'any'){
		matchedRentingAdQuery.andWhere('renting.elevator', adObj.elevator);
	}
	if(adObj.period && adObj.period !== 'any'){
		matchedRentingAdQuery.andWhere('renting.period', adObj.period);
	}
	
	return new promise(function(success, error){
		return profile.userProfile.where({account_id: adObj.account_id}).fetch().then(function(userData){
			if(userData){
				userData = userData.toJSON();
				matchedRentingAdQuery.andWhere('renting.forWhom', 'in', ['any', userData.accountType]);
				if(userData.accountType == 'private'){
					matchedRentingAdQuery.andWhere('renting.gender', 'in', ['any', userData.gender]);	
				}
				console.log('query :: '+matchedRentingAdQuery);	
				
				matchedRentingAdQuery.orderBy('creationtime', 'asc').limit(1);
				console.log('query :: '+matchedRentingAdQuery);
				
				return matchedRentingAdQuery.then(function(rows){
					if(rows && rows[0]){
						matchedAds.addMatchedAdEntry(rows[0], adObj, success);
					}
					else {
						return error();
					}
				});	
			}
			else{
				return error();
			}
		});
	});
}

var getMatchedAd = function(adObj){
	adObj = adObj.toJSON();
	if(adObj.adType === 'letting'){
		return getMatchForLettingAd(adObj.adData);
	} else if(adObj.adType === 'renting'){
		return getMatchForRentingAd(adObj.adData);
	}
	else {
		return undefined;
	}
}

module.exports.getMatchedAd = getMatchedAd;
module.exports.getMatchForLettingAd = getMatchForLettingAd;
module.exports.getMatchForRentingAd = getMatchForRentingAd;