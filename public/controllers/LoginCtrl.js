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
// First, parse the query string
var params = {}, queryString = location.hash.substring(1),
    regex = /([^&=]+)=([^&]*)/g, m;
while (m = regex.exec(queryString)) {
  params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
}

// Verify that the nonce in the response is the same as the one you sent in the
// request.
if (params['nonce'] !== nonce) {
  alert('Invalid nonce.')
} else {
  // And send the token over to the server
  var req = new XMLHttpRequest();
  // consider using POST so query isn't logged
  req.open('GET', 'https://' + window.location.host + '/catchtoken?' + queryString, true);
  req.onreadystatechange = function (e) {
    if (req.readyState == 4) {
      if (req.status == 200) {
        window.location = params['state']
      } else if (req.status == 400) {
        alert('There was an error processing the token.')
      } else {
        alert('something else other than 200 was returned')
      }
    }
  };
  req.send(null);
}