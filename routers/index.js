var auth = require('../controllers/auth.js'),
	api = require('../controllers/api.js');

module.exports = function(app){

//	GET
	app.get('/register', auth.register);
	app.get('/home', auth.authenticate, auth.home);
	app.get('/logout', auth.authenticate, auth.logout);

//	POST
	app.post('/register', auth.registerPost);
	app.post('/login', auth.loginPost);

	//	GET APIs
	app.get('/api/account/confirm/:authKey', api.confirmAccount);
	app.get('/api/profile', api.authenticate, api.getProfile);
	app.get('/api/ads', api.authenticate, api.getAds);
	app.get('/api/ads/letting', api.authenticate, api.getLettingAds);
	app.get('/api/ads/renting', api.authenticate, api.getRentingAds);
	app.get('/api/ads/letting/:adId', api.authenticate, api.getAdData);
	app.get('/api/ads/renting/:adId', api.authenticate, api.getAdData);
	app.get('/api/ads/:adId', api.authenticate, api.getAdData);
	app.get('/api/messages', api.authenticate, api.getMessages);
	
	//	POST APIs
	app.post('/api/ads/letting', api.authenticate, api.postAd);
	app.post('/api/ads/renting', api.authenticate, api.postAd);
	app.post('/api/ads/payment/:adId', api.authenticate, api.postPaymentForAd);
//	app.post('/api/messages', api.authenticate, api.putMessages);

	 //	PUT APIs
	app.put('/api/account/password/:authKey', api.changePassword);
	app.put('/api/profile', api.authenticate, api.putProfile);
	app.put('/api/ads/letting/:adId', api.authenticate, api.putAd);
	app.put('/api/ads/renting/:adId', api.authenticate, api.putAd);
	app.put('/api/match/:action/:adType/:adId', api.authenticate, api.updateMessageStatus);
	
	//Detele APIs
	app.delete('/api/ads/:adId', api.authenticate, api.deleteAd);
	app.delete('/api/account/:authKey', api.deleteAccount)
}