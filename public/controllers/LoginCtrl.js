var app = angular.module('LoginApp',[]);


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

    function getInboxStats() {

	var request = gapi.client.gmail.users.getProfile({
	  'userId': 'me',
	});

	var ownerEmail;

	request.execute(function(resp) {
	  ownerEmail = resp.emailAddress;
	  console.log("USER:",resp);
	});


	request = gapi.client.gmail.users.threads.list({
	  'userId': 'me',
	  'q': 'in:chat',
	  'maxResults':10
	});

	// {
	//   'userId': 'me',
	//   'historyId': "989745",
	//   'id':"15407ce71c2b0eac"
	// });

	request.execute(function(resp) {

	  var allThreads = resp.threads;
	  console.log("RESPONSE",allThreads);

	  if (allThreads.length>0) {
	    console.log("MESSAGES FOUND");
	    threadCount = allThreads.length;
	    for (var id = 0; id < threadCount; id++) {
	      var requestMessage = gapi.client.gmail.users.threads.get({
	        'userId': 'me',
	        'historyId': allThreads[id].historyId,
	        'id':allThreads[id].id
	      });

	      requestMessage.execute(function(respMessage) {
	        console.log("MESSAGE",respMessage);

	        var allMessages = respMessage.messages;

	        
	        // if(allMessages[allMessages.length-1])
	        var lastSenderEmail = allMessages[allMessages.length-1].payload.headers[0].value.split("<")[1].slice(0,-1);
	        if(lastSenderEmail != ownerEmail){
	        	var sender = allMessages[allMessages.length-1].payload.headers[0].value.split("<")[0]
	        	var content = allMessages[allMessages.length-1].snippet
	        	var message= sender + ": " + content
	          console.log(allMessages[allMessages.length-1].payload.headers[0].value.split("<")[0])
	          //appendPre(allMessages[allMessages.length-1].payload.headers[0].value.split("<")[0]);
	          appendPre(message);
	        }
	        
	        // console.log(allMessages[allMessages.length-1].payload.headers[0].value.split("<")[1].slice(0,-1));


	        // appendPre(getBody(respMessage.payload));
	      });
	      
	    }
	  }
	  else {
	    console.log("No unread Messages");
	  }

	  // var request = gapi.client.gmail.users.messages.get({
	  //   'userId': 'me',
	  //   'id':"153f7ba41317046f"
	  // });

	  // request.execute(function(resp) {

	});
	}

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
		pre.appendChild(textContent);
	}

	var postInitiation = function() {
	    // load all your assets
		console.log("HELLO FROM CONTROLLER");
		getInboxStats();
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