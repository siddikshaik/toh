/*var conf = {'from':'bu-support@zohocrop.com','host':'smtp1','port':25,'username':'bu-support','password':'1tset-pcs'};
*/


var conf = {'from':'info@takoverhuvudet.se','host':'smtp.takoverhuvudet.se','port':25,'username':'info@takoverhuvudet.se','password':'takoverhuvudet'};


var mailOptions = {
	confirmation : function(userAccount, confirmURL){
		options = {
			from: conf.from,
			to: userAccount.get('username'),
			subject: 'Välkommen till TakÖverHuvudet bekräfta e-post',
			html: 'Hej '+userAccount.get('username')+',<br/>Välkommen som kund hos oss, klicka på länken för att slutföra din registrering! :)<br/><br/> <a href="'+confirmURL+'" target="_blank">'+confirmURL+'</a><br/><br/> Varma hälsningar,<br/>Tak Över Huvudet Sverige'	
		}
		return options;
	}
	, passwordRecovery : function(userAccount, confirmURL){
		options = {
				from: conf.from,
				to: userAccount.get('username'),
				subject: 'Återskapa lösenord post',
				html: 'Hej '+userAccount.get('username')+',<br/>Klicka på nedanstående länk för att ändra lösenordet :)<br/><br/> <a href="'+confirmURL+'" target="_blank">'+confirmURL+'</a><br/><br/> Varma hälsningar,<br/>Tak Över Huvudet Sverige'	
			}
			return options;
	}
};

module.exports.conf = conf;
module.exports.mailOptions = mailOptions;