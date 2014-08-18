var app = angular.module("NearestMetro", ['MetroServices']);

app.controller('ngAppDemoController',[ '$scope','DelhiMetro', function ($scope,DelhiMetro) {
    $scope.name = "Nehru Place"
    //The body of demo controller
    
    $scope.decodeAddress = function () {
        codeAddress($scope.name,$scope.metroStations);
    }

    $scope.plotStations =  function() {
        for( var i=0; i < $scope.metroStations.length;i++) {
            setTimeout(function(j){
            return function() {
            callForStation(j);
            }
            }(i),i*1000);
        }
        function callForStation(i) {
            var currentobj = $scope.metroStations[i];
            putStation(currentobj);
        }
    }
    $scope.metroStations = DelhiMetro.query(function() {
            //$scope.plotStations();
        });
}]);
