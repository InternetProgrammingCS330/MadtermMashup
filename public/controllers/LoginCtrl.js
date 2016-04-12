angular.module('LoginApp').controller('loginController',['$timeout', '$scope', '$http', '$location',
 '$rootScope','$window', function($timeout, $scope, $http, $location, $rootScope, $window) {
 	console.log("HELLO FROM THE LOGIN CONTROLLER");
  	$scope.loginSubmit = functi
  	on($scope){
	    console.log("LOGGED IN");
	    $window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=403395753267-m5bosciaf32n6tmr4otncqigvfd3b2lr.apps.googleusercontent.com&redirect_uri=http://127.0.0.1:3000&scope=email%20profile";
  		console.log($location.path());

  	};


  	var clientId = '403395753267';

	var apiKey = 'AIzaSyAdjHPT5Pb7Nu56WJ_nlrMGOAgUAtKjiPM';

	var scopes = 'https://www.googleapis.com/auth/plus.me';

	function handleClientLoad() {
	// Step 2: Reference the API key
	gapi.client.setApiKey(apiKey);
	window.setTimeout(checkAuth,1);
	}

	function checkAuth() {
	gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
	}

	function handleAuthResult(authResult) {
	var authorizeButton = document.getElementById('authorize-button');
	if (authResult && !authResult.error) {
	  authorizeButton.style.visibility = 'hidden';
	  makeApiCall();
	} else {
	  authorizeButton.style.visibility = '';
	  authorizeButton.onclick = handleAuthClick;
	}
	}

	function handleAuthClick(event) {
	// Step 3: get authorization to use private data
	gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
	return false;
	}

	// Load the API and make an API call.  Display the results on the screen.
	function makeApiCall() {
	// Step 4: Load the Google+ API
	gapi.client.load('plus', 'v1').then(function() {
	  // Step 5: Assemble the API request
	  var request = gapi.client.plus.people.get({
	    'userId': 'me'
	  });
	  // Step 6: Execute the API request
	  request.then(function(resp) {
	    var heading = document.createElement('h4');
	    var image = document.createElement('img');
	    image.src = resp.result.image.url;
	    heading.appendChild(image);
	    heading.appendChild(document.createTextNode(resp.result.displayName));

	    document.getElementById('content').appendChild(heading);
	  }, function(reason) {
	    console.log('Error: ' + reason.result.error.message);
	  });
	});
    }

  	
}]);
