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

.controller('RoutesDetailCtrl', function($scope, $stateParams, $ionicLoading, $http, Convert) {
  var url = 'http://162.243.123.47:8080/otp/routers/default/plan';
  var now = new Date();
  $scope.marker = null;

  var params = {
    'fromPlace': $stateParams.takeoff_lat+','+$stateParams.takeoff_lng,
    'toPlace': $stateParams.arrival_lat+','+$stateParams.arrival_lng,
    'time': '6:15',
    'date': now.toISOString().slice(0,10),
    'mode': 'TRANSIT,WALK',
    'maxWalkDistance': '500.0',
    'wheelchair': 'false'
  };

  $scope.bus_position = null;

  var update_bus_position = function() {
    setTimeout(function () {
      $http.get("http://162.243.123.47/bus-position/").then(
        function (resp) {
          var pair = resp.data.split(',');
          $scope.bus_position = {lat: parseFloat(pair[0]), lng: parseFloat(pair[1])};
        }, function (resp) {}
      )['finally'](function () {
        return update_bus_position();
      });
    }, 1500);
  };

  update_bus_position();

  $scope.get_bus_position = function () {
    return $scope.bus_position;
  };

  $http.get(url,{params: params}).then(
    function (res) {
      if (res.data.error) {
        $scope.result = "FAIL";
      } else {
        $scope.result = "SUCCESS";

        var map = new google.maps.Map(document.getElementById('map'));
        map.fitBounds(new google.maps.LatLngBounds(
          new google.maps.LatLng(
            res.data.plan.from.lat,
            res.data.plan.from.lon
          ),
          new google.maps.LatLng(
            res.data.plan.to.lat,
            res.data.plan.to.lon
          )
        ));

        $scope.$watch($scope.get_bus_position, function (newval) {
          if ($scope.marker) {
            $scope.marker.setMap(null);
          }

          if (newval) {
            $scope.marker = new google.maps.Marker({
              position: {lat: newval.lat, lng: newval.lng},
              map: map,
              icon: "img/marker.png"
            });
          }

        });

        var directionsDisplay = new google.maps.DirectionsRenderer({map: map});

        var request = Convert.optimized_to_waypoints(res);
        console.log(request);

        var directionsService = new google.maps.DirectionsService();
        directionsService.route(request, function(response, status) {
          if (status == 'OK') {
            // Display the route on the map.
            directionsDisplay.setDirections(response);
          }
        });

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
