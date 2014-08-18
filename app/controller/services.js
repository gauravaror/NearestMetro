var phonecatServices = angular.module('MetroServices', ['ngResource']);

phonecatServices.factory('DelhiMetro', ['$resource',
  function($resource){
    return $resource('data/:metroId.json', {}, {
      query: {method:'GET', params:{metroId:'DelhiMetroStations'}, isArray:true}
    });
  }]);
