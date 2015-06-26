var g_json;
$( document ).ready(function() {
  var jDoc = $(this);
  getGlobalJSON();
});
function register_submit(id){
	jQuery.ajax({
  	  url: '/register',
        type: 'POST',
        data: jQuery('#'+id).serialize(),
        success: function(data) {
        	console.log(data);
        	if(data.message === 'same_user'){
        		alert("Username already exists");
        	}else if(data.message === 'success'){
        		setWindowLocation('/content/confirmRegistration.html');
        	}
      }
    });
	return false;
}

function post_login(){
	jQuery.ajax({
  	  url: '/login',
        type: 'POST',
        data: jQuery('#loginForm').serialize(),
        success: function(data) {
        	console.log(data);
        	if(data.message === 'no_username'){
        		alert("Username does not exist");
        	}else if(data.message === 'invalid_password'){
        		alert("Invalid password");
        	}else if(data.message === 'success'){
        		setWindowLocation('/home');
        	}
      }
    });
	return false;
}

function request_password(){
  var user_mail  = jQuery('#userEmail').val();
	jQuery.ajax({
  	  url: '/api/account/password/recovery',
        type: 'POST',
        data: jQuery('#forgot_password_form').serialize(),
        success: function(data) {
        	console.log(data);
          if(data.message === 'success'){
              setWindowLocation('/content/passwordRequestSent.html');
          }else{
            alert('Invalid User');
          }
        	
      }
    });
	return false;
}
function set_new_password(){
  var newPass = jQuery('#newPassword').val(), verifyPass = jQuery('#verifyNewPassword').val();
  if(newPass === verifyPass){
    jQuery.ajax({
        url: '/api'+window.location.pathname,
        type: 'PUT',
        data: jQuery('#new_password_form').serialize(),
        success: function(data) {
          console.log(data);
            if(data.message === 'success'){
                setWindowLocation('/home');
            }
        }
    });
  }else{
    alert('Password does not match');
  }
  return false;
}



function setWindowLocation(url){
	window.location = url;
}

function getGlobalJSON(){
	jQuery.ajax({type: "GET", async: false, dataType:"json", url: '/json/global.json', 
      success: function (data) {
      	g_json = data;
        console.log(data);
      }
  	});
}


function j_g_val(doc,id){
	return doc.find('#'+id).val();
}
