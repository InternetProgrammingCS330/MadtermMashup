'use strict';

angular.module('LoginApp',[]);
angular.module('BotApp',[]);
angular.module('guestApp',[]);
angular.module('404App',[]);

var myApp = angular.module('MashApp', ['ui.router','ngMaterial',
    'LoginApp','BotApp', 'guestApp','404App']);

myApp.config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
    function($stateProvider,$urlRouterProvider,$httpProvider) {

        var interceptor = ['$location', '$q', '$injector', function($location, $q, $injector) {
            
            console.log("inside interceptor");
            return {
                responseError: function(response) { 
                    if (response.status === 401){
                        console.log("4010401401401");
                        $location.url('/');
                    }
                    // if (response.status === 404){
                    //     console.log("4040404040404");
                    //     $location.url('/404');
                    // } 
                    return $q.reject(response); 
                } 
            };
        }];

        $httpProvider.interceptors.push(interceptor);

        $stateProvider
            .state('login',{
                url: '/',
                views: {
                    'login': {
                        templateUrl : 'partials/login/login.html',
                        action : 'LoginApp.LoginCtrl'
                    }
                }
            })
            .state('bot', {
                url:'/bot',
                views: {
                    'bot': {
                        templateUrl : '../partials/bot/bot.html',
                        action : 'BotApp.BotCtrl'
                    }
                }
            })
            .state('guestPage', {
                url:'/guest',
                views: {
                    'guestPage': {
                        templateUrl : '../partials/guest/guest.html',
                        action : 'GuestApp.GuestCtrl'
                    }
                    
                }
            })

            .state('404',{
                url:'/404',
                views:{
                    '404':{
                        templateUrl : '../partials/404/404.html',
                        action : '404App.404Ctrl'
                    }
                }
            })

            $urlRouterProvider.when('','/');

            // $urlRouterProvider.otherwise('/404');
    }
]);