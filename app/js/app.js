'use strict';
 
// Declare app level module which depends on filters, and services
var app = angular.module('angularCMS', ['ui.bootstrap', 'myApp.filters', 'myApp.services', 'angularCMS.directives']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	//$locationProvider.html5Mode(true);
    $routeProvider.
		when('/home', {templateUrl: 'partials/home.html', controller: 'MyCtrl2'}).
		when('/about', {templateUrl: 'partials/company.html', controller: 'MyCtrl2'}).
		when('/services', {templateUrl: 'partials/services.html', controller: 'MyCtrl2'}).
		when('/projects', {templateUrl: 'partials/projects.html', controller: 'ProjectManager'}).
		when('/contact', {templateUrl: 'partials/contact.html', controller: 'MyCtrl2'}).
		when('/bids', {templateUrl: 'partials/bids.html', controller: 'BidRoomManager'}).
        when('/admin', {templateUrl: 'partials/bids.html', controller: 'BidRoomManager'}).
        when('/login', {templateUrl: 'partials/bids.html', controller: 'BidRoomManager'}).
		when('/:tabId', {templateUrl: 'partials/basic.html', controller: 'MyCtrl2'}).
		otherwise({redirectTo: '/'});
  }]);
  
  app.controller('IndexCtrl', function($scope, $http, $location, orderByFilter) {
  
  $location.path('/home');
  
  $scope.selectedModules = [];
  $http({method:'get', url:'http://localhost:3000/content/'}).
		success(function(data, status) {
			$scope.site = data.site;
  });
});

//app.controller('contactForm', 

app.controller('MyCtrl1', function($scope) {
  //$scope.content = "Hello from controller A";
});

app.controller('MyCtrl2', function($scope, $routeParams) {
    var tabs = $scope.site.pagecontent;
	
	for (var i = 0; i < tabs.length; i++){
          if(tabs[i].title == $routeParams.tabId)
              $scope.content = tabs[i].content;
    }  
});

/*
 * Allow the image and description to be alternated
 */
app.controller('DisplayProjects', function($scope) {
	
});

app.controller('ProjectManager', function($scope, $http) {
	//console.log("Project Manager Controller");
	$scope.hideMore = true;
	$scope.textControl = "more";
	$http({method:'get', url:'projects.json'}).
    success(function(data, status) {
      $scope.projects = data.projects;
	  console.log($scope.projects);
	  /*for(var i; i < data.projects.length; i++)
	  {
		$scope.img = data;
	  }*/
  	});
	$scope.showMore = function() {
		$scope.hideMore = false;
		$scope.textControl = "less";
	};
	//$scope.img = []
});

app.controller('BidRoomManager', function($scope, $http) {
	$http({method:'get', url:'projects.json'}).
		success(function(data, status) {
		console.log(data.bids);
		if(data.bids)
		{
			$scope.bids = data.bids;
		}
		else
		{
			$scope.content = "There are no bid opportunities at this time";
		}
		//console.log($scope.bids);
	  /*for(var i; i < data.projects.length; i++)
	  {
		$scope.img = data;
	  }*/
  	});
});