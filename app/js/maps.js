var geocoder;
var map;
var LangLatList = [];
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var markerStation = null;


function initialize() {
        directionsDisplay = new google.maps.DirectionsRenderer();
        geocoder = new google.maps.Geocoder();
        var currentlanglat = new google.maps.LatLng(23.834248, 78.76918490000003)
        LangLatList.push(currentlanglat);
        var mapOptions = {
          center: currentlanglat,
          zoom: 8
        };
        map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);
        directionsDisplay.setMap(map);
}

function putStation(info) {
    console.log(" lat: "+info["lat"]+" lng: "+info["lng"]+" address: "+info["name"]);
    var maploc = new google.maps.LatLng(info["lat"],info["lng"]);
    LangLatList.push(maploc);
      var marker = new google.maps.Marker({
          map: map,
          position: maploc,
          title: info["name"]
      });
    var bounds = new google.maps.LatLngBounds ();
    //  Go through each...
    for (var i = 0, LtLgLen = LangLatList.length; i < LtLgLen; i++) {
      //  And increase the bounds to take this point
      bounds.extend (LangLatList[i]);
    }
    //  Fit these bounds to the map
    map.fitBounds (bounds);
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function getDistances(locat,allMetroStations) {
    for (var i=0;i< allMetroStations.length;i++) {
       allMetroStations[i]["distance"]=  getDistanceFromLatLonInKm(locat.lat(),locat.lng(),allMetroStations[i]["lat"],allMetroStations[i]["lng"]);
    }
    return allMetroStations.sort(compare);
}

function compare(a,b) {
  if (a.distance < b.distance)
     return -1;
  if (a.distance > b.distance)
    return 1;
  return 0;
}

function getTop10DistanceGMAP(locat,addr,allMetroStations) {
    var origin1 = locat;
    var destination = [];
    for (var i=0;i<10;i++) {
        destination.push(new google.maps.LatLng(allMetroStations[i]["lat"], allMetroStations[i]["lng"]));
    }
        var service = new google.maps.DistanceMatrixService();
        service.getDistanceMatrix(
        {
            origins: [ origin1],
            destinations: destination,
            travelMode: google.maps.TravelMode.WALKING,
            avoidHighways: false,
            avoidTolls: false
        }, function(station,loc) { return function(response, status) {callback(response, status, station,loc)} }(allMetroStations,origin1));

        function callback(response, status,item,loctn) {
            console.log("response :"+response+" status: "+status);
            console.log(response);
                    // you can access the parent scope arguments like item here
            if (status == google.maps.DistanceMatrixStatus.OK)
            {
                var origins = response.originAddresses;
                var destinations = response.destinationAddresses;
                for (var i = 0; i < origins.length; i++)
                {
                    var results = response.rows[i].elements;
                    for (var j = 0; j < results.length; j++)
                    {
                        var element = results[j];
                        var from = origins[i];
                        var to = destinations[j];
                        var distance = element.distance.text;
                        console.log(" distance "+item[j]["name"]+" is: "+element.distance.value/1000 +" km");
                        item[j]["distance"] = +element.distance.value/1000;
                        var duration = element.duration.text;
                        var ResultStr = distance + "&nbsp; (<i>" + duration + "</i>)";
                    }
                }   
            }
            proceedcodeAddress(item,loctn);
    }
}

function codeAddress(address,allMetroStations) {
  geocoder.geocode( { 'address': address +" Delhi"}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        var metroStationDistances = getDistances(results[0].geometry.location,allMetroStations);
        getTop10DistanceGMAP(results[0].geometry.location,address,metroStationDistances);
    } else {
        console.log(" not working address : "+address+" status "+status);
        alert("Couldnot find the address");
    }
  });
}

function changeRankedMetroStations(message) {
    var scope = angular.element($("#controllerouter")).scope();
    scope.$apply(function(){
        scope.rankedMetroStations = message;
    })
}

function proceedcodeAddress(finalMetroStationDistance,loctn) {
        if(markerStation != null) {
            markerStation.setMap(null);
        }
        finalMetroStationDistance.sort(compare);
        var metroStationDistances = finalMetroStationDistance;
  //    alert("address : "+address+" "+results[0].geometry.location);
      var destinationStation = new google.maps.LatLng(metroStationDistances[0]["lat"], metroStationDistances[0]["lng"]);
     /* var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          title: address
      });*/
      console.log(metroStationDistances[0]["lat"]);
      changeRankedMetroStations(metroStationDistances);
      var markerstation = new google.maps.Marker({
          map: map,
          position: destinationStation,
          title:" Nearest station is : " +metroStationDistances[0]["name"] + " with distance of "+metroStationDistances[0]["distance"]+" KM"
      });
      markerStation = markerstation;
       var request = {
          origin:loctn,
          destination:destinationStation,
          travelMode: google.maps.TravelMode.WALKING
       };
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
        }
      });
}
google.maps.event.addDomListener(window, 'load', initialize);

