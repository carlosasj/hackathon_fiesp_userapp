angular.module('starter.services', [])

.factory('Convert', function() {
  function optimized_to_waypoints(resp) {
    var plan = resp.data.plan;
    // var itineraries = plan.itineraries;
    // var waypoints = [];
    // for (var i = itineraries.length-1; i >= 0; i--) {
    //   for (var j = itineraries[i].legs.length-1; j >= 0; j--) {
    //     waypoints.push({
    //       location: new google.maps.LatLng(itineraries[i].legs[j].to.lat, itineraries[i].legs[j].to.lon),
    //       stopover: false
    //     });
    //   }
    // }

    return {
      origin: new google.maps.LatLng(plan.from.lat, plan.from.lon),
      destination: new google.maps.LatLng(plan.to.lat, plan.to.lon),
      travelMode: google.maps.TravelMode.TRANSIT,
    }
  }

  return {
    optimized_to_waypoints: optimized_to_waypoints
  };
});
