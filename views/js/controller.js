var tohControllers = angular.module('tohControllers', []);

tohControllers.controller('home_ctrl', ['$scope', '$http',
  function ($scope, $http) {

  }
]);
tohControllers.controller('profile_ctrl', ['$scope','$http',
  function($scope, $http) {
     $http.get('/api/profile').success(function(data) {
      console.log(data);
      $scope.userAccount = data.data.userAccount;
      $scope.userprofile = data.data.userAccount.profile;
      $scope.random = Math.random();
    });
    $scope.edit_profile = function(user_id) {
      window.location.hash = "#/edit_profile";
    };
    $scope.delete_profile = function() {
      window.location.hash = "#/delete_profile";
    };
  }
]);
tohControllers.controller('edit_profile_ctrl', ['$scope','$http',
  function($scope, $http) {
     $http.get('/api/profile').success(function(data) {
      console.log(data);
      $scope.userAccount = data.data.userAccount;
      $scope.userprofile = data.data.userAccount.profile;
      var b_date = new Date($scope.userprofile.dob);
      $scope.s_year = b_date.getFullYear();
      $scope.s_month = b_date.getMonth()+1;
      $scope.s_date = b_date.getDate();
      $scope.update_profile = function() {
        console.log(jQuery('#edit_profile_form').serialize());
        jQuery('#edit_profile_form').ajaxSubmit({
      	  url: '/api/profile',
            type: 'PUT',
            contentType: 'multipart/form-data',
            success: function(data) {
              if(data.message === 'success'){
            	  window.location.hash = "#/myprofile";
              }
          }
        });
      };
    });
  }
]);
tohControllers.controller('delete_profile_ctrl', ['$scope','$http',
  function($scope, $http) {
     $scope.myprofile = function() {
      window.location.hash = "#/myprofile";
    };
    $scope.confirm_delete_profile = function() {
      jQuery.ajax({
          url: '/api/profile',
          type: 'DELETE',
          success: function(data) {
              if(data.message === 'success'){
                  window.location = "/";
              }
          }
      });
    };
  }
]);
tohControllers.controller('change_password_ctrl', ['$scope','$http',
  function($scope, $http) {
      $scope.confirm_change_password = function() {
          var newPass = jQuery('#newPassword').val(), verifyPass = jQuery('#verifyNewPassword').val();
          if(newPass === verifyPass){
            jQuery.ajax({
                url: '/api/account/password',
                type: 'PUT',
                success: function(data) {
                    if(data.message === 'success'){
                        window.location = "/logout";
                    }
                }
            });
          }else{
            alert('Password does not match');
          }
      };
  }
]);
tohControllers.controller('ads_ctrl', ['$scope','$http',
  function($scope, $http) {
    $scope.g_json = g_json;
    $http.get('/api/ads').success(function(data) {
      $scope.ads  = data.data;
      console.log(data.data);
    });
    $scope.find_home = function() {
      window.location.hash = "#/find_home";
    };
    $scope.rent_home = function() {
      window.location.hash = "#/rent_home";
    };
    $scope.edit_ad = function(adType,ad_id) {
      window.location.hash = "#/edit_ad/"+adType+"/"+ad_id;
    };
    $scope.delete_ad = function(ad_id) {

      window.location.hash = "#/delete_ad/"+ad_id;
    };
    $scope.pay_ad = function(ad_id) {
      var url = '/api/ads/payment/'+ad_id;
      jQuery.ajax({
          url: url,
          type: 'POST',
          success: function(data) {
              if(data.message === 'success'){
                  window.location.hash = "#/ads";
              }
          }
      });
    };
  }
]);

tohControllers.controller('edit_ad_ctrl', ['$scope','$http','$routeParams',
  function($scope, $http, $routeParams) {
    loadDatePicker();
    $http.get('/api/ads/'+$routeParams.ad_id).success(function(data) {
      console.log(data);
      $scope.ad_data = data.data;
    });

    setTimeout(function(){dependencyFields();}, 1000);

    $scope.edit_ad_submit = function(ad_id) {
	console.log(jQuery('#edit_ad_form').serialize());
      var url = '/api/ads/'+jQuery('#edit_ad_form').find('[name=adType]').val()+'/'+ad_id;
      jQuery('#edit_ad_form').ajaxSubmit({
    	  url: url,
          type: 'PUT',
          contentType: 'multipart/form-data',
          success: function(data) {
            if(data.message === 'success'){
                window.location.hash = "#/ads";
            }
        }
      });
    };
  }
]);
tohControllers.controller('delete_ad_ctrl', ['$scope','$http','$routeParams',
  function($scope, $http, $routeParams) {
    $scope.confirm_delete_ad = function() {
      var ad_id = $routeParams.ad_id;
      var url = '/api/ads/'+ad_id;
      $http.delete('/api/ads/'+ad_id).success(function(data) {
        console.log(data);
        if(data.message === 'success'){
          window.location.hash = "#/ads";
          /*$http.get('/api/ads').success(function(data) {
            $scope.ads  = data.data;
          });*/
        }
      });
    };
    $scope.go_back_ads = function() {
      window.location.hash = "#/ads";
    };
  }
]);
tohControllers.controller('messages_ctrl', ['$scope','$http','$routeParams',
  function($scope, $http,$routeParams) {
    $scope.g_json = g_json;
    $http.get('/api/messages').success(function(data) {
      console.log(data);
      $scope.let_msgs  = data.data.lettingAdObjs;
      $scope.rent_msgs  = data.data.rentingAdObjs;
    });
    $scope.accept_msg = function(ad_id,ad_type) {
      window.location.hash = "#/messages/accept/"+ad_type+"/"+ad_id;
    };
    $scope.deny_msg = function(ad_id,ad_type) {
      window.location.hash = "#/messages/deny/"+ad_type+"/"+ad_id;
    };
    $scope.confirm_accept = function() {
      var ad_id = $routeParams.ad_id, ad_type = $routeParams.ad_type;
      jQuery.ajax({
          url: '/api/match/accept/'+ad_type+'/'+ad_id,
          type: 'PUT',
          success: function(data) {
              if(data.message != 'success'){
                  alert('Unable to accept. Please contact Takoverhuvudet Support');
              }
              window.location.hash = "#/messages";
          }
      });
    };
    $scope.confirm_deny = function() {
      var ad_id = $routeParams.ad_id,  ad_type = $routeParams.ad_type;
      jQuery.ajax({
          url: '/api/match/deny/'+ad_type+'/'+ad_id,
          type: 'PUT',
          success: function(data) {
              if(data.message != 'success'){
                  alert('Unable to deny. Please contact Takoverhuvudet Support');
              }
              window.location.hash = "#/messages";
          }
      });
    };
    $scope.invoke_msg = function() {
      window.location.hash = "#/messages";
    };
    
  }
]);
tohControllers.controller('find_home_ctrl', ['$scope','$http',
  function($scope, $http) {
	$scope.random = Math.random();
    loadDatePicker();
    dependencyFields();
  }
]);
tohControllers.controller('rent_home_ctrl', ['$scope','$http',
  function($scope, $http) {
	$scope.random = Math.random();
    loadDatePicker();
    dependencyFields();
  }
]);
tohControllers.controller('find_for_rent_ctrl', ['$scope','$http',
  function($scope, $http) {
    $scope.forLettingSubmit = function() {
      jQuery.ajax({
          url: '/api/ads/letting',
          type: 'POST',
          data: jQuery('#search_accomadation').serialize(),
          success: function(data) {
              if(data.message === 'success'){
                  window.location.hash = "#/ads";
              }
          }
      });
    };
  }
]);
tohControllers.controller('post_for_rent_ctrl', ['$scope','$http',
  function($scope, $http) {
	$scope.forRentsubmit = function() {
		jQuery('#rent_out_accomdation').ajaxSubmit({
			url: '/api/ads/renting',
			type: 'POST',
			contentType: 'multipart/form-data',
			success: function(data) {
				if(data.message === 'success'){
					window.location.hash = "#/ads";
				}
			}
		});
	};
  }
]);

function previewImage(elem) {
	var fileInput = jQuery(elem)[0];
	var file = fileInput.files[0];
	if(file.size < 2097152 && (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg')) {
		var oFReader = new FileReader();
		oFReader.readAsDataURL(file);
		oFReader.onload = function(oFREvent) {
			jQuery('label[for="'+fileInput.id+'"]').find('img').each(function(){
				jQuery(this)[0].src = oFREvent.target.result;
			});
		};		
	}
	else {
		alert('Choose image with size less than 2MB');
	}
}

function loadDatePicker(){
  $("#datepicker").datepicker({
    changeMonth: true,//this option for allowing user to select month
    changeYear: true //this option for allowing user to select from year range
  });
}
function dependencyFields(){
  var id = jQuery('#state').val();
  jQuery('#municipality').find('optgroup').hide();
  if(id === 'any' || id === '0'){
    jQuery('#municipality').val(id);
  }else{
    jQuery('#municipality').find('optgroup#'+id).show();
  }
  /*jQuery.ajax({type: "GET", async: false, dataType:"json", url: '/json/state_municipality.json', 
      success: function (data) {
          console.log(data);
      }
  });*/
}
function forWhomChange() {
    var forWhom  = jQuery('#forWhom').val();
    var g_th = jQuery('#gender');
    g_th.val('any');
    if(forWhom === 'corporation'){
      g_th.hide().prev().hide();
    }else{
      g_th.show().prev().show();
    }
};
$(document).ready(function() {
	jQuery(document).on('change', 'input[type="file"]', function(){
		previewImage(jQuery(this));
	});
	
	$(this).off('change', '#state').on('change', '#state', function(e) {
      dependencyFields();
      jQuery('#municipality').val('0');
  });
});


