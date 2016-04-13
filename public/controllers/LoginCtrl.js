var app = angular.module('LoginApp',['ngMaterial']);

// Google Related variables. Needed for authentication and proper authorization.

var CLIENT_ID = '403395753267-m5bosciaf32n6tmr4otncqigvfd3b2lr.apps.googleusercontent.com';
var apiKey = 'AIzaSyAQSFbNgx0Xs-faGH6o2YxTrlQe9Ds-d94';
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly',
	'https://www.googleapis.com/auth/gmail.send',
	'https://www.googleapis.com/auth/gmail.modify',
	'https://www.googleapis.com/auth/gmail.compose'
];

// Global functons to perform authentication and relate to angular app

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

  	var unreadIds;
    var unreadMessages;
    var unreadCount = 0;

    setInterval(function() {
		$scope.refreshUnread();
	}, 7000);

    function sendMessage()
	{

		var email = '';
		var headers_obj = {
			'To': $scope.itemToReply.sender,
			'Subject': $scope.itemToReply.subject,
			'In-Reply-To':$scope.itemToReply.id,
			'References':''
		}
		var message = $scope.messageToEmail;

		for(var header in headers_obj)
			email += header += ": "+headers_obj[header]+"\r\n";
			email += "\r\n" + message;

			var sendRequest = gapi.client.gmail.users.messages.send({
			'userId': 'me',
			'resource': {
				'raw': window.btoa(email).replace(/\+/g, '-').replace(/\//g, '_'),
				'threadId':"1540d5e45328ada2"
				}
			});

		return sendRequest.execute(function(resp){
		});
	}

    $scope.send = function(){
		sendMessage();
    }

    jQuery.fn.sort = function() {  
	    return this.pushStack( [].sort.apply( this, arguments ), []);  
	};

	function sortDate(a,b){  
	    if (a.time_stamp == b.time_stamp){
	    	return 0;
	    }
	    return a.time_stamp> b.time_stamp ? 1 : -1;
	};

    function messageListener(message){
    	$scope.$applyAsync(function(){
    		message=$(message).sort(sortDate);
    		$scope.userMessages = message;
    	})
    }

    function chatListener(message){
    	var response;

    	function reqListener () {
			console.log("CHAT BOT RESPONSE",this.responseText);
			response = this.responseText;
			var responseJ = JSON.parse(response);
			console.log(responseJ);
			$scope.messageToEmail = responseJ.message.message;
			var fullBotResponse = {
	    		'message':responseJ.message.message,
	    		'color':'#FFD180',
	    		'sender':$rootScope.owner
	    	};

	    	$scope.botResponse = responseJ.message.message;

	    	$scope.$applyAsync(function(){
	    		$scope.chatMessages.messages = message;
	    		$scope.chatMessages.messages.push(fullBotResponse)
	    	});
		}
		
		var chatMessage = $scope.itemToReply.snippet.split(" ").join("+");
		var chatAPI = "http://www.personalityforge.com/api/chat/?apiKey=l248iw9xLwtAo5Hi&chatBotID=63906&message="+chatMessage+"%3F&externalID=abc-639184572&firstName=Alex&lastName=Sparrow&gender=m";
		
		console.log("CHAT BOT",chatAPI);
		var oReq = new XMLHttpRequest();
		oReq.addEventListener("load", reqListener);
		oReq.open("GET", chatAPI);
		oReq.send();
    }

    function getResponseFromBot(){
    	return sampleChatResponse;
    }

    function refresh(){
    	getInboxStats();
    }

    $scope.refreshUnread = function(){
    	getInboxStats();
    };

    $scope.chatMessages = {
    	messages:[]
   	};

    $scope.initiateChat = function(item){

    	$scope.itemToReply = item;

    	$scope.chatMessages = {
    		messages:[]
   		};
    	
    	$scope.threadId = item.threadId;
    	var request = gapi.client.gmail.users.messages.get({
			'userId': 'me',
			'id':item.id
		});
		var messageRAW;
		request.execute(function(resp) {
			$scope.sender = item.sender;
			var decodedMessage = resp.snippet;
   			var messages = []
			messages.push({'message':decodedMessage,color:'#CCFF90','sender':item.sender,'align':'right'});
			chatListener(messages)
		});
    };

    $scope.test = function(){
    	testMail();
    }

    var testMail = function(){
    	var requestTEST = gapi.client.gmail.users.threads.list({
			'userId': 'me',
			'q': "!subject:''",
			'maxResults':20
		});

		requestTEST.execute(function(resp) {
			var requestTEST2 = gapi.client.gmail.users.messages.get({
				'userId': 'me',
				'id':resp.result.threads[0].id,
				'maxResults':10
			});
			requestTEST2.execute(function(resp2){
				var headers = {
					'Subject':resp2.payload.headers[16].value,
					'inReplyTo':resp2.payload.headers[15].value,
					'References':'',
					'threadId':resp2.threadId,
					'to':resp2.payload.headers[17].value.split("<")[1].slice(0,-1)
				}
				console.log("HEADERS",headers);
				$scope.send();
			});
		});
    }

    var getInboxStats = function() {		

		var request = gapi.client.gmail.users.getProfile({
			'userId': 'me',
		});

		var ownerEmail;

		request.execute(function(resp) {
			ownerEmail = resp.emailAddress;
			$rootScope.owner = ownerEmail;
		});

		request = gapi.client.gmail.users.threads.list({
			'userId': 'me',
			'q': "!subject:''",
			'maxResults':10
		});

		var lastSenderEmail;
		var threadSubject;
		$scope.userMessagesRAW = [];

		request.execute(function(resp) {
			$scope.complete = false;

			var allThreads = resp.threads;

			if (allThreads.length>0) {
				threadCount = allThreads.length;
			    for (var id = 0; id < threadCount; id++) {
			    	$scope.$applyAsync(function(){
				    	$scope.idRAW = id;		    		
			    	});

					var requestMessage = gapi.client.gmail.users.messages.get({
						'userId': 'me',
						'id':allThreads[id].id,
						'maxResults':10
					});

					requestMessage.execute(function(respMessage) {

						var allMessages = respMessage;

						if(allMessages.payload.headers.length == 20 && allMessages.payload){

							for (var object = 0; object < allMessages.payload.headers.length; object++) {
								if (allMessages.payload.headers[object].name == "From"){
									lastSenderEmail = allMessages.payload.headers[object].value.split("<")[1].slice(0,-1);
								}
								if (allMessages.payload.headers[object].name == "Subject"){
									threadSubject = allMessages.payload.headers[object].value;
								}
							}
						    if(lastSenderEmail != ownerEmail){
						    	var sender = lastSenderEmail;
						    	var snippet = allMessages.snippet;
						    	if (snippet.length > 40) {
						    		snippet = snippet.substring(0,40) + "..."
						    	}
						    	var historyId = allMessages.historyId;
						    	var time_stamp = allMessages.internalDate;
						    	var messageID = allMessages.id;
						    	var newMessage = {sender: sender,
						    						snippet:snippet.replace(/&#39;/g, "'"),
						    						historyId:historyId,
						    						id:messageID,
						    						time_stamp:time_stamp,
						    						subject:threadSubject};
						      	$scope.userMessagesRAW.push(newMessage);
						      	
						      	if(id == threadCount){
						      		messageListener($scope.userMessagesRAW);
						      	}	
						    }
						}
					});
		    	}
		  	}
		  	else {
		    	userMessages.push({snippet:"NO MESSAGES FOUND"});
		    	messageListener(userMessages);
		  	}
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
		for(var x = 0; x <= arr.length; x++){
			if(typeof arr[x].parts === 'undefined'){
			    if(arr[x].mimeType === 'text/html'){
			      	return arr[x].body.data;
			    }
			}
		  	else{
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