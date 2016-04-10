angular.module('LoginApp').controller('loginController',['$timeout', '$scope', '$http', '$location',
 '$rootScope','$window', function($timeout, $scope, $http, $location, $rootScope, $window) {

  	$scope.loginSubmit = function($scope){
	    console.log("LOGGED IN");
  	};

  	$scope.guestLoginSubmit = function(){
  		console.log("going to guest");
  		$window.location.href = "/#guest";
  	}
}]);
