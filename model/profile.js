var DB = require('./db').DB;
var promise = require('promise');

var userProfile = DB.Model.extend({
	tableName: 'profile'
	, idAttribute: 'account_id'
	
	, updateProfile: function(profileData, userAccount){
		console.log('userAccount')
		var profileObj = getProfileObj(profileData, userAccount);
		return new promise(function(success, error){
			return userProfile.where({account_id: userAccount.id}).fetch().then(function(userprofileObj){
				if(!userprofileObj){
					new userProfile(profileObj).save(profileObj, {method: 'insert'}).then(function(userprofileObj){
						return success(userprofileObj);	
					});
				}
				else {
					userprofileObj.save(profileObj, {patch:true}).then(function(userProfileObj){
						return success(userprofileObj);
					});
				}
			});
		});
	}
});

var getProfileObj =  function(profileJSON, userAccount){
	console.log('Profile Object from Request b4:::'+JSON.stringify(profileJSON));
	var prof_obj = {};
	prof_obj['account_id'] = userAccount.id;
	if(profileJSON.accountType != undefined){prof_obj['accountType'] = profileJSON.accountType;}
	if(profileJSON.name != undefined){prof_obj['name'] = profileJSON.name;}
	if(profileJSON.familyname != undefined){prof_obj['familyname'] = profileJSON.familyname;}
	if(profileJSON.street != undefined){prof_obj['street'] = profileJSON.street;}
	if(profileJSON.postalcode != undefined){prof_obj['postalcode'] = profileJSON.postalcode;}
	if(profileJSON.city != undefined){prof_obj['city'] = profileJSON.city;}
	if(profileJSON.birthYear != undefined){prof_obj['dob'] = profileJSON.birthYear+'/'+profileJSON.birthMonth+'/'+profileJSON.birthDay;}
	if(profileJSON.gender != undefined){prof_obj['gender'] = profileJSON.gender;}
	if(profileJSON.phone != undefined){prof_obj['phone'] = profileJSON.phone;}
	if(profileJSON.occupation != undefined){prof_obj['occupation'] = profileJSON.occupation;}
	if(profileJSON.allergy != undefined){prof_obj['allergy'] = profileJSON.allergy;}
	if(profileJSON.responsiblePerson != undefined){prof_obj['responsiblePerson'] = profileJSON.responsiblePerson;}
	if(profileJSON.corporation != undefined){prof_obj['corporation'] = profileJSON.corporation;}
	if(profileJSON.corpID != undefined){prof_obj['corpID'] = profileJSON.corpID;}
	console.log('Profile Object from Request:::'+JSON.stringify(prof_obj));
	return prof_obj;
}

module.exports = {
	userProfile: DB.model('userProfile', userProfile)
};