$( document ).ready(function() {
  var jDoc = $(this);

  //Getting Login JSON to authenticate
  	jDoc.find( "#loginForm" ).submit(function( event ) {
	 var u_name = jDoc.find('#username').val();
	 var pwd = jDoc.find('#password').val();

	 var s_json = {};
	 s_json['u_name'] = u_name;
	 s_json['u_pwd'] = pwd;
	 console.log(s_json);

	 setWindowLocation('/content/login_access/home.html');

	 event.preventDefault();
	});

  	//Getting Private UserRegister JSON
  	jDoc.find( "#private_reg_form" ).submit(function( event ) {

	 var pr_json = {};
	 pr_json['u_name'] = j_g_val(jDoc,'username');
	 pr_json['u_pwd'] = j_g_val(jDoc,'passw');
	 pr_json['verify_pwd'] = j_g_val(jDoc,'verifypass');
	 pr_json['name'] = j_g_val(jDoc,'name');
	 pr_json['f_name'] = j_g_val(jDoc,'familyname');
	 pr_json['street'] = j_g_val(jDoc,'address');
	 pr_json['postalcode'] = j_g_val(jDoc,'postalCode');
	 pr_json['city'] = j_g_val(jDoc,'city');

	 pr_json['b_year'] = j_g_val(jDoc,'birthYear');
	 pr_json['b_month'] = j_g_val(jDoc,'birthMonth');
	 pr_json['b_day'] = j_g_val(jDoc,'birthDay');

	 pr_json['gender'] = j_g_val(jDoc,'gender');

	 pr_json['phone'] = j_g_val(jDoc,'phone');
	 pr_json['occupation'] = j_g_val(jDoc,'occupation');
	 pr_json['allergic'] = j_g_val(jDoc,'allergic');
	 console.log(pr_json);

	 setWindowLocation('/content/confirmRegistration.html');

	 event.preventDefault();
	});


	//Getting Corporate UserRegister JSON
  	jDoc.find( "#corporate_reg_form" ).submit(function( event ) {

	 var cr_json = {};
	 cr_json['u_name'] = j_g_val(jDoc,'username');
	 cr_json['u_pwd'] = j_g_val(jDoc,'passw');
	 cr_json['verify_pwd'] = j_g_val(jDoc,'verifypass');
	 cr_json['corporate_name'] = j_g_val(jDoc,'corporation');
	 cr_json['corporate_id'] = j_g_val(jDoc,'corpID');
	 cr_json['street'] = j_g_val(jDoc,'address');
	 cr_json['postalcode'] = j_g_val(jDoc,'postalCode');
	 cr_json['city'] = j_g_val(jDoc,'city');

	 cr_json['b_year'] = j_g_val(jDoc,'birthYear');
	 cr_json['b_month'] = j_g_val(jDoc,'birthMonth');
	 cr_json['b_day'] = j_g_val(jDoc,'birthDay');

	 cr_json['responsible_person'] = j_g_val(jDoc,'responsiblePerson');

	 cr_json['phone'] = j_g_val(jDoc,'phone');
	 console.log(cr_json);

	 setWindowLocation('/content/confirmRegistration.html');

	 event.preventDefault();
	});

	//Getting Corporate UserRegister JSON
  	jDoc.find( "#forgot_password_form" ).submit(function( event ) {
	 var fp_json = {};
	 fp_json['u_name'] = j_g_val(jDoc,'userEmail');
	 console.log(fp_json);
	 setWindowLocation('/content/passwordRequestSent.html');
	 event.preventDefault();
	});

//My Profile Tab Started

  	//Getting My Profile Data

  	//Edit Profile Form : Load the data from DB

  	//Edit and save Profile Form
  	jDoc.find( "#edit_profile_form" ).submit(function( event ) {

	 var ep_json = {};
	 ep_json['name'] = j_g_val(jDoc,'name');
	 ep_json['f_name'] = j_g_val(jDoc,'familyname');
	 /*ep_json['street'] = j_g_val(jDoc,'address');
	 ep_json['postalcode'] = j_g_val(jDoc,'postalCode');
	 ep_json['city'] = j_g_val(jDoc,'city');*/

	 ep_json['b_year'] = j_g_val(jDoc,'birthYear');
	 ep_json['b_month'] = j_g_val(jDoc,'birthMonth');
	 ep_json['b_day'] = j_g_val(jDoc,'birthDay');

	 ep_json['phone'] = j_g_val(jDoc,'phone');
	 ep_json['occupation'] = j_g_val(jDoc,'occupation');
	 ep_json['allergic'] = j_g_val(jDoc,'allergic');
	 console.log(ep_json);

	 setWindowLocation('/content/login_access/privateProfile.html');

	 event.preventDefault();

	});

  	//Delete Account. Need to implement jQuery dialog to avoid another page. Once confirm then delete the user and log out

//My Profile Tab Ended

//Ads Tab Started

	//Getting my Ads and displaying in the order. Two Possibilities : Searching and Renting Out

	//Searching for a new house

	jDoc.find( "#search_accomadation" ).submit(function( event ) {

	 var fad_json = {};
	 fad_json['state'] = j_g_val(jDoc,'state');
	 fad_json['municipality'] = j_g_val(jDoc,'municipality');
	 fad_json['localarea'] = j_g_val(jDoc,'localArea');
	 fad_json['contract_type'] = j_g_val(jDoc,'contractType');
	 fad_json['balcony'] = j_g_val(jDoc,'balcony');
	 fad_json['furniture'] = j_g_val(jDoc,'furniture');
	 fad_json['floor'] = j_g_val(jDoc,'floor');
	 fad_json['elevator'] = j_g_val(jDoc,'elevator');
	 fad_json['access_date'] = j_g_val(jDoc,'datepicker');
	 fad_json['total_period'] = j_g_val(jDoc,'minTimeToRent');
	 fad_json['accommodation_type'] = j_g_val(jDoc,'accommodationType');
	 fad_json['minimum_size'] = j_g_val(jDoc,'minimumSize');
	 fad_json['num_rooms'] = j_g_val(jDoc,'numOfRooms');
	 fad_json['max_price'] = j_g_val(jDoc,'maxPrice');
	 fad_json['period_type'] = j_g_val(jDoc,'period');
	 fad_json['about_me'] = j_g_val(jDoc,'aboutMe');

	 console.log(fad_json);

	 setWindowLocation('/content/login_access/payment.html');

	 event.preventDefault();

	});

	//Renting a house

	jDoc.find( "#rent_out_accomdation" ).submit(function( event ) {

	 var fad_json = {};
	 fad_json['state'] = j_g_val(jDoc,'state');
	 fad_json['municipality'] = j_g_val(jDoc,'municipality');
	 fad_json['localarea'] = j_g_val(jDoc,'localArea');

	 fad_json['access_date'] = j_g_val(jDoc,'datepicker');
	 fad_json['total_period'] = j_g_val(jDoc,'minTimeToRent');

	 fad_json['contract_type'] = j_g_val(jDoc,'contractType');
	 fad_json['balcony'] = j_g_val(jDoc,'balcony');
	 fad_json['furniture'] = j_g_val(jDoc,'furniture');

	 fad_json['floor'] = j_g_val(jDoc,'floor');
	 fad_json['elevator'] = j_g_val(jDoc,'elevator');
	 fad_json['price'] = j_g_val(jDoc,'price');
	 fad_json['period_type'] = j_g_val(jDoc,'period');

	 fad_json['more_info'] = j_g_val(jDoc,'moreInfo');

	 fad_json['for_whom'] = j_g_val(jDoc,'forWhom');
	 fad_json['gender'] = j_g_val(jDoc,'gender');

	 //Uploading Pics code has to write

	 console.log(fad_json);

	 //setWindowLocation('/content/login_access/payment.html');

	 event.preventDefault();

	});

	//Editing the Ad for Seached house.. Loading the data

	//Editing the Ad for Rented house.. Loading the data

	//Deleting the Ad 

//Ads Tab Ended

//Messages Tab Started

	//Getting messages for Tenant..

	//Getting messages for House Owner. Displaying images in the order

	//Accept the offer

	//Deny the offer

//Messages Tab Ended


});

function j_g_val(doc,id){
	return doc.find('#'+id).val();
}
function setWindowLocation(url){
	// window.location = url;
}

