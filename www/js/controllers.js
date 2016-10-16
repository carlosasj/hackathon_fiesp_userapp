angular.module('starter.controllers', [])

.controller('TrackCtrl', function($scope) {})

.controller('RoutesCtrl', function($scope, $q) {

  var geocoder = new google.maps.Geocoder();

  $scope.getAddressSuggestions = function(queryString){
    var defer = $q.defer();
    geocoder.geocode(
        {address: queryString},
        function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) { defer.resolve(results); }
            else { defer.reject(results); }
        }
    );
    return defer.promise;
  };


  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // $scope.chats = Chats.all();
  // $scope.remove = function(chat) {
  //   Chats.remove(chat);
  // };
})

.controller('RoutesDetailCtrl', function($scope, $stateParams, Chats) {
  // $scope.chat = Chats.get($stateParams.chatId);
})

.controller('SettingsCtrl', function($scope) {
  // $scope.settings = {
  //   enableFriends: true
  // };
});
