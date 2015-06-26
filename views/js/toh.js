var tohApp = angular.module('tohApp', [
  'ngRoute',
  'tohControllers'
]);

tohApp.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.
      when('/home', {
        templateUrl: '/content/login_access/access_index.html',
        controller: 'home_ctrl'
      }).
      when('/myprofile', {
        templateUrl: '/content/login_access/profile.html',
        controller: 'profile_ctrl'
      }).
      when('/edit_profile', {
        templateUrl: '/content/login_access/edit_profile.html',
        controller: 'edit_profile_ctrl'
      }).
      when('/delete_profile', {
        templateUrl: '/content/login_access/deleteUserAccount.html',
        controller: 'delete_profile_ctrl'
      }).
      when('/change_password', {
        templateUrl: '/content/login_access/setNewPassword.html',
        controller: 'change_password_ctrl'
      }).
      when('/ads', {
        templateUrl: '/content/login_access/ads.html',
        controller: 'ads_ctrl'
      }).
      when('/edit_ad/letting/:ad_id', {
        templateUrl: '/content/login_access/editFindAd.html',
        controller: 'edit_ad_ctrl'
      }).
      when('/edit_ad/renting/:ad_id', {
        templateUrl: '/content/login_access/editRentOutAd.html',
        controller: 'edit_ad_ctrl'
      }).
      when('/delete_ad/:ad_id', {
        templateUrl: '/content/login_access/deleteAd.html',
        controller: 'delete_ad_ctrl'
      }).
      when('/messages', {
        templateUrl: '/content/login_access/messages.html',
        controller: 'messages_ctrl'
      }).
      when('/messages/accept/:ad_type/:ad_id', {
        templateUrl: '/content/login_access/acceptProposal.html',
        controller: 'messages_ctrl'
      }).
      when('/messages/deny/:ad_type/:ad_id', {
        templateUrl: '/content/login_access/denyProposal.html',
        controller: 'messages_ctrl'
      }).
      when('/find_home', {
        templateUrl: '/content/login_access/find_home.html',
        controller: 'find_home_ctrl'
      }).
      when('/rent_home', {
        templateUrl: '/content/login_access/rent_home.html',
        controller: 'rent_home_ctrl'
      }).
      otherwise({
        redirectTo: '/home'
      });
  }
]);
