angular.module('starter.controllers', [])

.controller('TrackCtrl', function($scope) {
  console.log("TrackCtrl");
})

.controller('RoutesCtrl', function($scope, $q, $state, $ionicLoading) {
  console.log("RoutesCtrl");

  var geocoder = new google.maps.Geocoder();
  $scope.data = {};

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

  $scope.onsubmit = function (data) {
    if (data.place_takeoff && data.place_arrival){
      $ionicLoading.show({template: "Carregando..."});
      return $state.go('tab.routes-detail',
        {
          takeoff_lat: data.place_takeoff.geometry.location.lat(),
          takeoff_lng: data.place_takeoff.geometry.location.lng(),
          arrival_lat: data.place_arrival.geometry.location.lat(),
          arrival_lng: data.place_arrival.geometry.location.lng()
        }
      );
    }
  };

})

.controller('RoutesDetailCtrl', function($scope, $stateParams, $ionicLoading, $http) {
  var url = 'http://162.243.123.47:8080/otp/routers/default/plan';
  var now = new Date();
  var params = {
    'fromPlace': $stateParams.takeoff_lat+','+$stateParams.takeoff_lng,
    'toPlace': $stateParams.arrival_lat+','+$stateParams.arrival_lng,
    'time': now.getHours()+":"+now.getMinutes(),
    'date': now.toISOString().slice(0,10),
    'mode': 'TRANSIT,WALK',
    'maxWalkDistance': '500.0',
    'wheelchair': 'false'
  };
  $http.get(url,{params: params}).then(
    function (res) {
      console.log(res.data);
      if (res.data.error) {
        $scope.result = "FAIL";
      } else {
        $scope.result = "SUCCESS";
      }
    },
    function (res) {
      console.log(res.data);
      $scope.result = "ERROR";
    }
  )['finally'](function () {
    $ionicLoading.hide();
  });
})

.controller('SettingsCtrl', function($scope) {
  console.log("SettingsCtrl");
  // $scope.settings = {
  //   enableFriends: true
  // };
});
