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
				'threadId': $scope.info.id
				}
			});

		return sendRequest.execute(function(resp){
			var sample = {
				'userId':'me',
			    'id': $scope.info[0].threadId,
			    'removeLabelIds': ["UNREAD"]
			}
			var request = gapi.client.gmail.users.messages.modify({
				'userId':'me',
			    'id': $scope.info[0].threadId,
			    'removeLabelIds': ["UNREAD"]
			});
			console.log("REQUEST MESSAGE",sample)
			console.log("SCOPE", $scope.info[0])
		  	request.execute(function(){
		  		console.log("marked as read");
		  	});
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
    		var fullMessage = "You have 1 new message from: " + message[0].senderName + " titled '"+message[0].subject+"'. The message reads: "+ message[0].full;
    		window.responsiveVoice.speak(fullMessage);
    		// var utterance = new SpeechSynthesisUtterance(message[0].snippet);
    		// window.speechSynthesis.speak(utterance);

   //  		var request = gapi.client.plus.people.get({
			//    'userId': 'me'
			// });
			// request.execute(function(resp) {
			//    console.log('Retrieved profile for:' + resp.displayName);
			// });
    	})
    }

    function chatListener(message){
    	var response;

    	function reqListener () {
			response = this.responseText;
			var responseJ = JSON.parse(response);
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
			var decodedMessage = resp.snippet.replace(/&#39;/g, "'");
   			var messages = []
			messages.push({'message':decodedMessage,color:'#CCFF90','sender':item.sender,'align':'right'});

	  //   	var utterance = new SpeechSynthesisUtterance(decodedMessage);
			// // window.responsiveVoice.speak(decodedMessage);
			// window.speechSynthesis.speak(decodedMessage);
			chatListener(messages)
		});
    };

    var oldJSON;

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
			'q': "is:unread AND in:inbox",
			'maxResults':1
		});

		var lastSenderEmail;
		var threadSubject;
		$scope.userMessagesRAW = [];

		request.execute(function(resp) {
			$scope.complete = false;

			var allThreads = resp.threads;

			if (resp.resultSizeEstimate > 0) {
				threadCount = allThreads.length;
			    for (var id = 0; id < threadCount; id++) {
			    	$scope.$applyAsync(function(){
				    	$scope.idRAW = id;		    		
			    	});

					var requestMessage = gapi.client.gmail.users.messages.get({
						'userId': 'me',
						'id':allThreads[id].id,
						'maxResults':1,
						'format':'full'
					});

					$scope.threadIdT = allThreads[id].id;

					requestMessage.execute(function(respMessage) {

						var allMessages = respMessage;
						var fingMessage =  decodeURIComponent(escape(window.atob(respMessage.payload.parts[0].body.data.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, ''))));

						if(allMessages.payload.headers.length > 12 && allMessages.payload){

							for (var object = 0; object < allMessages.payload.headers.length; object++) {
								if (allMessages.payload.headers[object].name == "From"){
									lastSenderEmail = allMessages.payload.headers[object].value.split("<")[1].slice(0,-1);
									lastSenderName = allMessages.payload.headers[object].value.split("<")[0];
								}
								if (allMessages.payload.headers[object].name == "Subject"){
									threadSubject = allMessages.payload.headers[object].value;
								}
							}
						    if(lastSenderEmail != ownerEmail){
						    	var sender = lastSenderEmail;
						    	var senderName = lastSenderName;
						    	var snippet = allMessages.snippet;
						    	if (snippet.length > 40) {
						    		snippet = snippet
						    	}
						    	var historyId = allMessages.historyId;
						    	var time_stamp = allMessages.internalDate;
						    	var messageID = allMessages.id;
						    	var newMessage = {sender: sender,
						    						senderName: senderName,
						    						snippet:snippet.replace(/&#39;/g, "'"),
						    						full:fingMessage.replace(/&#39;/g, "'"),
						    						historyId:historyId,
						    						id:messageID,
						    						time_stamp:time_stamp,
						    						threadId: $scope.threadIdT,
						    						subject:threadSubject};
						      	$scope.userMessagesRAW.push(newMessage);
						      	$scope.info = $scope.userMessagesRAW;
						      	
						      	if(id == threadCount){
						      		if(oldJSON == $scope.userMessagesRAW[0].snippet){
						      			$scope.userMessagesRAW = {};
						      		}
						      		else{
						      			oldJSON = $scope.userMessagesRAW[0].snippet;
						      			messageListener($scope.userMessagesRAW);
						      		}
						      		
						      	}	
						    }
						}
					});
		    	}
		  	}
		  	else {
		    	var userMessages = []
		    	userMessages.push({snippet:"NO MESSAGES FOUND"});
		  	}
		});
	}

	function getBody(message) {
		var encodedBody = '';
		var temp = '';
		for (var i = 0; i < message.parts.length; i++) {
			if(typeof message.parts === 'undefined'){
				temp = message.body.data;
			}
			else{
				temp = getHTMLPart(message.parts[i]);
			}
			encodedBody = encodedBody + temp.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
		}
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