angular.module('druidLogs', [
  'ngRoute'
  ])

.config( function($routeProvider, $httpProvider){

})
.controller('getData', function($scope, $http, $interval){
  $scope.data = {
    body: []
  };

  var getJSON = function(){
    console.log('getJSON called');
    return $http.get('/api/getData')
    .success(function(response, status){
      console.log('response',response);
      $scope.data.body = response;
    });
  };

  $interval(getJSON, 10000);

})
;
