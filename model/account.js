
var bcrypt = require('bcrypt-nodejs');

var DB = require('./db').DB
, profileTable = require('../model/profile');

var user = DB.Model.extend({
	tableName: 'account',
	
	profile: function(){
		return this.hasOne('userProfile');
	}

	, add: function(formData) {
		var userObj = this;
		return new Promise(function(success, failure){
			console.log('add user :: '+JSON.stringify(userObj));
			return userObj.save().then(function(userAccount) {
				userAccount = userAccount.toJSON()
				return new profileTable.userProfile({account_id: userAccount.id}).updateProfile(formData, userAccount).then(function(){
					return success();
				},function(){
					return failure();
				});
			});
		});
	}
	
	, updateStatus: function(accountStatus) {
		var userObj = this;
		return new Promise(function(success, failure){
			return userObj.fetch().then(function(){
				if(this && this.toJSON().username){
					return this.save({status: accountStatus}, {patch: true}).then(success(), failure());
				} 
				else { return failure(); }
			});
		});
	}
	
	, changePassword: function(newPassword) {
		var userObj = this;
		var hash = bcrypt.hashSync(newPassword);
		return new Promise(function(success, failure){
			return userObj.fetch().then(function(){
				if(this && this.toJSON().username){
					return userObj.save({password: hash}, {patch: true}).then(success(), failure());
				} 
				else { return failure(); }
			});
		});
	}
});

module.exports = {
		user	: user,
		status	: { confirmationAwaiting: 'confirmationAwaiting', active: 'active', deleted: 'deleted' }
};