var app = angular.module('LoginApp',['ngMaterial']);


var CLIENT_ID = '403395753267-m5bosciaf32n6tmr4otncqigvfd3b2lr.apps.googleusercontent.com';

var apiKey = 'AIzaSyAQSFbNgx0Xs-faGH6o2YxTrlQe9Ds-d94';

var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose'
];

// handleClientLoad();

function handleClientLoad() {
    // Step 2: Reference the API key
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth,1);
}

function checkAuth() {
    gapi.auth.authorize(
    {
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
    }, handleAuthResult);
}

function handleAuthResult(authResult) {
    var authorizeButton = document.getElementById('authorize-button');
    if (authResult && !authResult.error) {
        authorizeButton.style.visibility = 'hidden';
        init();
    } else {
        authorizeButton.style.visibility = '';
        authorizeButton.onclick = handleAuthClick;
    }
}

function handleAuthClick(event) {
// Step 3: get authorization to use private data
	gapi.auth.authorize({client_id: CLIENT_ID, scope: SCOPES, immediate: false}, handleAuthResult);
	return false;
}

// function loadGmailApi() {
// 	gapi.client.load('gmail', 'v1', getInboxStats);
// }

var init = function() {
  window.initGapi();
}


app.controller('loginController', function($timeout, $scope, $http, $location, $rootScope, $window,gapiService) {
 	console.log("HELLO FROM THE LOGIN CONTROLLER");

  	var unreadIds;
    var unreadMessages;
    var unreadCount = 0;

    function refresh(){
    	var newMessages = getInboxStats();
    	console.log($rootScope.newMessages);
    	// $scope.userMessages = newMessages;
    }

    $scope.refreshUnread = function(){
    	var newMessages = getInboxStats();
    	console.log($rootScope.newMessages)
    	// $scope.userMessages = newMessages;
    };

    var getInboxStats = function() {

		var request = gapi.client.gmail.users.getProfile({
		  'userId': 'me',
		});

		var ownerEmail;

		request.execute(function(resp) {
		  ownerEmail = resp.emailAddress;
		});

		request = gapi.client.gmail.users.threads.list({
		  'userId': 'me',
		  'q': 'in:chat',
		  'maxResults':5
		});

		var lastSenderEmail;
		var userMessages = [];

		request.execute(function(resp) {

		  var allThreads = resp.threads;

		  if (allThreads.length>0) {
		    threadCount = allThreads.length;
		    for (var id = 0; id < threadCount; id++) {
		      var requestMessage = gapi.client.gmail.users.threads.get({
		        'userId': 'me',
		        'historyId': allThreads[id].historyId,
		        'id':allThreads[id].id
		      });

		      requestMessage.execute(function(respMessage) {

		        var allMessages = respMessage.messages;

		        lastSenderEmail = allMessages[allMessages.length-1].payload.headers[0].value.split("<")[1].slice(0,-1);
		        if(lastSenderEmail != ownerEmail){
		        	// console.log("MESSAGE",allMessages[allMessages.length-1]);
		        	var sender = appendPre(allMessages[allMessages.length-1].payload.headers[0].value.split("<")[0]);
		        	var snippet = allMessages[allMessages.length-1].snippet;
		        	var historyId = allMessages[allMessages.length-1].historyId;
		        	var messageID = allMessages[allMessages.length-1].id;
		        	var newMessage = {sender: sender,
		        						snippet:snippet,
		        						historyId:historyId,
		        						id:messageID};
		          	userMessages.push(newMessage);
		        	$rootScope.userMessages = userMessages;
		        	console.log("ROOTSCOPE INSIDE",$rootScope.userMessages);
		        }
		      });
		    }
		  }
		  else {
		    // console.log("No unread Messages");
		    userMessages.push({snippet:"NO MESSAGES FOUND"});
		  }
		});
		console.log("RETURN",userMessages)
		return userMessages;
	}
	// $scope.userMessages = userMessages;
	$scope.kent = "KENT"

	function getBody(message) {
		var encodedBody = '';
		if(typeof message.parts === 'undefined'){
			encodedBody = message.body.data;
		}
		else{
			encodedBody = getHTMLPart(message.parts[0]);
		}
		encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
		return decodeURIComponent(escape(window.atob(encodedBody)));
	}

	function getHTMLPart(arr) {
	for(var x = 0; x <= arr.length; x++)
	{
	  if(typeof arr[x].parts === 'undefined')
	  {
	    if(arr[x].mimeType === 'text/html')
	    {
	      return arr[x].body.data;
	    }
	  }
	  else
	  {
	    return getHTMLPart(arr[x].parts);
	  }
	}
	return '';
	}

	/**
	* Append a pre element to the body containing the given message
	* as its text node.
	*
	* @param {string} message Text to be placed in pre element.
	*/
	function appendPre(message) {
		var pre = document.getElementById('output');
		var textContent = document.createTextNode(message + '\n');
		return textContent;
	}

	var postInitiation = function() {
	    // load all your assets
		// console.log("HELLO FROM CONTROLLER");
		refresh();
	}

	$window.initGapi = function() {
	    gapiService.initGapi(postInitiation);
	}

  	
});

app.service('gapiService', function() {
  this.initGapi = function(postInitiation) {
    gapi.client.load('gmail', 'v1', postInitiation);
  }
});