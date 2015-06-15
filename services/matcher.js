var knex = require('../model/db').knex
, matchedAds = require('../model/matchedAds').matchedAds;

var getMatchForRentingAd = function(adObj){
	adObj = adObj ? adObj : adObj.toJSON();
	console.log('adObj inside matcher :: '+JSON.stringify(adObj));
	var subQueryForRejectedAdIds = knex.select('letting_ad_id').from('matchedAds').where('renting_ad_id', adObj.id);
	var query = knex.select('*').from('letting').innerJoin('ads', 'letting.id', 'ads.id')
		.whereNotIn('letting.id', subQueryForRejectedAdIds)
		.andWhere('letting.account_id', '!=', adObj.account_id)
		.andWhere('ads.adStatus', 'open')
		.andWhere('letting.state', 'in', ['any', adObj.state])
		.andWhere('letting.municipality', 'in', ['any', adObj.municipality])
		.andWhere('letting.area', adObj.area)
		.andWhere('letting.duration', '<=', adObj.minTimeToRent)
		.andWhere('letting.accommodationType', 'in', ['any', adObj.accommodationType])
		.andWhere('letting.minSize', '<=', adObj.size)
		.andWhere('letting.minRooms', '<=', adObj.numOfRooms)
		.andWhere('letting.contract', 'in', ['any', adObj.contract])
		.andWhere('letting.balcony', 'in', ['any', adObj.balcony])
		.andWhere('letting.furnished', 'in', ['any', adObj.furnished])
		.andWhere('letting.floor', 'in', ['any', adObj.floor])
		.andWhere('letting.elevator', 'in', ['any', adObj.elevator])
		.andWhere('letting.maxPrice', '>=', adObj.price)
		.andWhere('letting.period', 'in', ['any', adObj.period])
		.orderBy('creationtime', 'asc')
		.limit(1);
	console.log('query :: '+query);
	
	return new Promise(function(success, failure){
		return query.then(function(rows){
			if(rows && rows[0]){
				return new matchedAds().addEntry(adObj, rows[0]).then(function(matchedAd){
					matchedAd = matchedAd.toJSON();
					console.log('matchedAd :: '+JSON.stringify(matchedAd));
					return success(matchedAd);
				});	
			}
			else {
				return failure();
			}
		});
	});
}

var getMatchForLettingAd = function(adObj){
	console.log('adObj :: '+JSON.stringify(adObj));
	var subQueryForRejectedAdIds = knex.select('letting_ad_id').from('matchedAds').where('renting_ad_id', adObj.id);
	console.log('subQueryForRejectedAdIds :: '+subQueryForRejectedAdIds);
	var matchedRentingAdQuery = knex.select('*').from('renting').innerJoin('ads', 'renting.id', 'ads.id')
		.whereNotIn('renting.id', subQueryForRejectedAdIds)
		.andWhere('renting.account_id', '!=', adObj.account_id)
		.andWhere('ads.adStatus', 'open')
		.andWhere('renting.minTimeToRent', '>=', adObj.duration)
		.andWhere('renting.size', '>=', adObj.minSize)
		.andWhere('renting.numOfRooms', '>=', adObj.minRooms)
		.andWhere('renting.price', '<=', adObj.maxPrice);
	if(adObj.state && adObj.state !== 'any'){
	matchedRentingAdQuery.andWhere('renting.state', adObj.state);	
	}
	if(adObj.municipality && adObj.municipality !== 'any'){
	matchedRentingAdQuery.andWhere('renting.municipality', adObj.municipality);
	}
	if(adObj.area && adObj.area !== ''){
	matchedRentingAdQuery.andWhere('renting.area', adObj.area);
	}
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
	matchedRentingAdQuery.orderBy('creationtime', 'asc').limit(1);
	console.log('query :: '+matchedRentingAdQuery);
	
	return new Promise(function(success, error){
		return matchedRentingAdQuery.then(function(rows){
			if(rows){
				return new matchedAds().addEntry(rows[0], adObj).then(function(matchedAd){
					matchedAd = matchedAd.toJSON();
					console.log('matchedAd :: '+JSON.stringify(matchedAd));
					return success(matchedAd);
				});
			}
		}).catch(function(err){
			console.log('error');
			return error(err);
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