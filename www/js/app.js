angular.module('bucketList', ['ionic', 'firebase', 'bucketList.controllers'])

.run(function($ionicPlatform, $rootScope, $firebaseAuth, $firebase, $window, $ionicLoading) {
    $ionicPlatform.ready(function() { // @todo change to $ionicPlatform for production
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        var config = $window.__env;

        firebase.initializeApp(config);
        $rootScope.userEmail = null;

        // Inistializze database
        $rootScope.databaseRef = firebase.database();

        // Check user session
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            // User is signed in.
            // user authenticated with Firebase
            $rootScope.userEmail = user.email;
            console.log($rootScope.userEmail);
            $window.location.href = ('#/bucket/list');
          } else {
            // User is signed out.
            console.log('User is signed out');
            $window.location.href = ('#/auth/signin');
          }
        });

        $rootScope.show = function(text) {
            $rootScope.loading = $ionicLoading.show({
                content: text ? text : 'Loading..',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        };

        $rootScope.hide = function() {
            $ionicLoading.hide();
        };

        $rootScope.notify = function(text) {
            $rootScope.show(text);
            $window.setTimeout(function() {
                $rootScope.hide();
            }, 1999);
        };

        $rootScope.logout = function() {
            console.log('Logging out...');
            firebase.auth().signOut();
            $rootScope.checkSession();
        };
    });

    // @todo should be removed after testing
    $rootScope.checkSession = function() {
      console.log('Check session');
    }
})

.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('auth', {
            url: "/auth",
            abstract: true,
            templateUrl: "templates/auth.html"
        })
        .state('auth.signin', {
            url: '/signin',
            views: {
                'auth-signin': {
                    templateUrl: 'templates/auth-signin.html',
                    controller: 'SignInCtrl'
                }
            }
        })
        .state('auth.signup', {
            url: '/signup',
            views: {
                'auth-signup': {
                    templateUrl: 'templates/auth-signup.html',
                    controller: 'SignUpCtrl'
                }
            }
        })
        .state('bucket', {
            url: "/bucket",
            abstract: true,
            templateUrl: "templates/bucket.html"
        })
        .state('bucket.list', {
            url: '/list',
            views: {
                'bucket-list': {
                    templateUrl: 'templates/bucket-list.html',
                    controller: 'myListCtrl'
                }
            }
        })
        .state('bucket.completed', {
            url: '/completed',
            views: {
                'bucket-completed': {
                    templateUrl: 'templates/bucket-completed.html',
                    controller: 'completedCtrl'
                }
            }
        })
    $urlRouterProvider.otherwise('/auth/signin');
});
