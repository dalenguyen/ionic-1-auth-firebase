angular.module('bucketList.controllers', [])
.controller('SignInCtrl', [
    '$scope', '$rootScope', '$firebaseAuth', '$window',
    function($scope, $rootScope, $firebaseAuth, $window) {
        // check session
        $rootScope.checkSession();

        $scope.user = {
            email: "",
            password: ""
        };
        $scope.validateUser = function() {
            $rootScope.show('Please wait.. Authenticating');
            var email = this.user.email;
            var password = this.user.password;

            firebase.auth().signInWithEmailAndPassword(email, password)
            .then(auth => {
              $rootScope.hide();
              $rootScope.userEmail = email;
              $window.location.href = ('#/bucket/list');
            })
            .catch(function(error) {
              $rootScope.hide();
              $rootScope.notify(error.message);
            });
        }
    }
])

.controller('SignUpCtrl', [
    '$scope', '$rootScope', '$firebaseAuth', '$window',
    function($scope, $rootScope, $firebaseAuth, $window) {

        $scope.user = {
            email: "",
            password: "",
            passwordRetyped: ""
        };

        $scope.createUser = function() {
            var email = this.user.email;
            var password = this.user.password;
            var passwordRetyped = this.user.passwordRetyped;

            if(password !== passwordRetyped){
              $rootScope.notify('Your password and your re-entered password does not match each other.');
              return;
            }

            $rootScope.show('Please wait... Registering');

            // firebase signup code
            firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(auth => {
              // Could do something with the Auth-Response
              $rootScope.hide();
              $rootScope.userEmail = email;
              $window.location.href = ('#/bucket/list');
            })
            .catch(error => {
              $rootScope.hide();
              console.log(error.message);
              $rootScope.notify(error.message);
            })
        }

    }
])

.controller('myListCtrl', function($rootScope, $scope, $window, $ionicModal, $firebase) {
    // $rootScope.show("Please wait... Processing");

    $scope.list = [];

    console.log($rootScope.userEmail);

    console.log($rootScope.databaseRef);

    var bucketListRef = $rootScope.databaseRef.ref('bucketList/' + escapeEmailAddress($rootScope.userEmail));
    bucketListRef.on('value', function(snapshot){
      console.log(snapshot.val());
      var data = snapshot.val();
      $scope.list = [];
      for (var key in data) {
          console.log(key);
          if (data.hasOwnProperty(key)) {
              if (data[key].isCompleted == false) {
                  data[key].key = key;
                  $scope.list.push(data[key]);
              }
          }
      }

      console.log($scope.list);

      if ($scope.list.length == 0) {
          $scope.noData = true;
      } else {
          $scope.noData = false;
      }
      $rootScope.hide();
    })

    $ionicModal.fromTemplateUrl('templates/newItem.html', function(modal) {
        $scope.newTemplate = modal;
    });

    $scope.newTask = function() {
        $scope.newTemplate.show();
    };

    $scope.markCompleted = function(key) {
        // $rootScope.show("Please wait... Updating List");
        console.log(escapeEmailAddress($rootScope.userEmail));
        var itemRef = $rootScope.databaseRef.ref('bucketList/' + escapeEmailAddress($rootScope.userEmail));

        itemRef.update({
          isCompleted: true
        }, function(error) {
            if (error) {
                console.log(error);
                $rootScope.hide();
                // $rootScope.notify('Oops! something went wrong. Try again later');
            } else {
                $rootScope.hide();
                // $rootScope.notify('Successfully updated');
            }
        });
    };

    $scope.deleteItem = function(key) {
        // $rootScope.show("Please wait... Deleting from List");
        var itemRef = $rootScope.databaseRef.ref('bucketList/' + escapeEmailAddress($rootScope.userEmail));
        itemRef.child(key).remove(function(error) {
            if (error) {
                $rootScope.hide();
                $rootScope.notify('Oops! something went wrong. Try again later');
            } else {
                $rootScope.hide();
                $rootScope.notify('Successfully deleted');
            }
        });
    };
})

.controller('newCtrl', function($rootScope, $scope, $window, $firebase) {
    $scope.data = {
        item: ""
    };

    $scope.close = function() {
        $scope.modal.hide();
    };

    $scope.createNew = function() {
        var item = this.data.item;
        if (!item) return;
        $scope.modal.hide();
        $rootScope.show();

        $rootScope.show("Please wait... Creating new");

        var email = escapeEmailAddress($rootScope.userEmail);
        var bucketListRef = $rootScope.databaseRef;
        writeBucketItem(bucketListRef, email, item);
        $rootScope.hide();

    };
})

.controller('completedCtrl', function($rootScope, $scope, $window, $firebase) {
    // $rootScope.show("Please wait... Processing");
    $scope.list = [];

    var bucketListRef = $rootScope.databaseRef.ref('bucketList/');
    bucketListRef.on('value', function(snapshot){
      console.log(snapshot.val());
      var data = snapshot.val();
      $scope.list = [];
      for (var key in data) {
          if (data.hasOwnProperty(key)) {
              if (data[key].isCompleted == true) {
                  data[key].key = key;
                  $scope.list.push(data[key]);
              }
          }
      }

      if ($scope.list.length == 0) {
          $scope.noData = true;
      } else {
          $scope.noData = false;
      }
      $rootScope.hide();
    });

    $scope.deleteItem = function(key) {
        $rootScope.show("Please wait... Deleting from List");

        var itemRef = new Firebase($rootScope.baseUrl + escapeEmailAddress($rootScope.userEmail));
        bucketListRef.child(key).remove(function(error) {
            if (error) {
                $rootScope.hide();
                $rootScope.notify('Oops! something went wrong. Try again later');
            } else {
                $rootScope.hide();
                $rootScope.notify('Successfully deleted');
            }
        });
    };
});


function escapeEmailAddress(email) {
    if (!email) return false
    // Replace '.' (not allowed in a Firebase key) with ','
    email = email.toLowerCase();
    email = email.replace(/\./g, ',');
    return email.trim();
}

function writeBucketItem(bucketListRef, email, item){
  bucketListRef.ref('bucketList/' + email).push({
    item: item,
    isCompleted: false,
    created: Date.now(),
    updated: Date.now()
  });
}
