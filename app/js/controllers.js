'use strict';

/* Controllers */
function contactForm($scope, $http) {
	//$scope.errorMessage = "alert alert-error";
	$scope.hideAlert = true;
	$scope.alertMessage;
	$scope.alertClass;

  $scope.formValidate = function(subject, contactName, email, phone, message) {
    $scope.hideAlert = false;
	if(contactName && email && phone && message)
	{
		var formData = new Object();
		formData.subject = subject;
		formData.contactName = contactName;
		formData.email = email;
		formData.phone = phone;
		formData.message = message;
		formData.to = 'info@paradigmconstruct.com';
		
		$http({
		method:'post', 
		headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		params: {'subject':formData.subject, 'name':formData.contactName, 'email':formData.email, 'phone':formData.phone, 'message':formData.message, 'to':formData.to},
		url:'http://geminitechsolutions.com/services/mailto.php'
		}).
		success(function(data, status) {
			$scope.alertClass = "alert alert-success";
			$scope.alertMessage = 'Success:  Thank you for your inquiry, we will contact you as soon as possible.'
			console.log(data + " " + status);
		}).
		error(function() {
			$scope.alertClass = "alert alert-error";
			$scope.alertMessage = 'Error:  Unable to send message, please try again later'
			//console.log("error: post");
			//console.log(formData);
		});
	}
	else 
	{
		$scope.alertClass = "alert alert-error";
		$scope.alertMessage = 'Error:  Please fill out all required fields.'
		console.log("fail");
	}
  }
}

function MyCtrl($scope, $resource) {
    var layoutPlugin = new ngGridLayoutPlugin();
    var DataSource = $resource('remotedata.json');
    $scope.mySelections = [];
    
    $scope.myData = DataSource.query();
    
    $scope.updateLayout = function(){
      layoutPlugin.updateGridLayout();
    };
    
    $scope.gridOptions = { 
      data: 'myData',
      columnDefs: [{field:'name', displayName:'name'},{field:'age', displayName:'age'}],
      plugins: [layoutPlugin],
      selectedItems: $scope.mySelections,
      multiSelect: false
    };
}

 function bodyController($scope) {
    $scope.myData = [{name: "Moroni", age: 50},
                     {name: "Tiancum", age: 43},
                     {name: "Jacob", age: 27},
                     {name: "Nephi", age: 29},
                     {name: "Enos", age: 34}];
    $scope.gridOptions = { data : 'myData' };// $scope.myData is also acceptable but will not update properly. OK to use the object if you don't care about updating the data in the grid.
}

function PopoverDemoCtrl($scope) {
console.log('popover');
  $scope.dynamicPopover = "Hello, World!";
  $scope.dynamicPopoverText = "dynamic";
  $scope.dynamicPopoverTitle = "Title";
};

function MainCtrl($scope, $http, orderByFilter) {
  var url = "http://172.29.203.38/";
  $scope.selectedModules = [];
  //iFrame for downloading
  //var $iframe = $("<iframe>").css('display','none').appendTo(document.body);

  /*
	$scope.showBuildModal = function() {
    $scope.buildModalShown = true;
    //Load modules if they aren't loaded yet
    if (!$scope.modules) {
      $http.get(url + "/api/bootstrap").then(function(response) {
        $scope.modules = response.data.modules;
      }, function() {
        $scope.buildGetErrorText = "Error retrieving build files from server.";
      });
    }
  };

  $scope.downloadBuild = function() {
    var downloadUrl = url + "/api/bootstrap/download?";
    angular.forEach($scope.selectedModules, function(module) {
      downloadUrl += "modules=" + module + "&";
    });
    $iframe.attr('src','');
    $iframe.attr('src', downloadUrl);
    $scope.buildModalShown = false;
  };
  */
}

function SettingsController($scope) {
  $scope.name = "John Smith";
  $scope.contacts = [
    {type:'phone', value:'408 555 1212'},
    {type:'email', value:'john.smith@example.org'} ];
 
  $scope.greet = function() {
   alert(this.name);
  };
 
  $scope.addContact = function() {
   this.contacts.push({type:'email', value:'yourname@example.org'});
  };
 
  $scope.removeContact = function(contactToRemove) {
   var index = this.contacts.indexOf(contactToRemove);
   this.contacts.splice(index, 1);
  };
 
  $scope.clearContact = function(contact) {
   contact.type = 'phone';
   contact.value = '';
  };
}

function NavCtrl($scope, $location) {
    $scope.location = $location;
}

function NavBarCtrl($scope, $http) {
    $scope.testSearch = function(input) {
        alert(input);
    };
	$http.get('menu.json')
		.then(function(res) {
			console.log(res.data);
			$scope.names = res.data;
		});
}

function AppController($scope, items, scroll) {

  $scope.items = items;

  $scope.refresh = function() {
    items.getItemsFromServer();
  };

  $scope.handleSpace = function() {
    if (!scroll.pageDown()) {
      items.next();
    }
  };

  $scope.$watch('items.selectedIdx', function(newVal, oldVal, scope) {
    if (newVal !== null) scroll.toCurrent();
  });
}

AppController.$inject = ['$scope', 'items', 'scroll']; // For JS compilers.


// Top Menu/Nav Bar
function NavBarController($scope, items) {

  $scope.showAll = function() {
    items.clearFilter();
  };

  $scope.showUnread = function() {
    items.filterBy('read', false);
  };

  $scope.showStarred = function() {
    items.filterBy('starred', true);
  };

  $scope.showRead = function() {
    items.filterBy('read', true);
  };
}

NavBarController.$inject = ['$scope', 'items'];  // For JS compilers.

document.addEventListener('DOMContentLoaded', function(e) {
  //On mobile devices, hide the address bar
  window.scrollTo(0);
}, false);

function TabsDemoCtrl($scope) {
  $scope.panes = [
  { title:"home", templateUrl:"partials/home.html"},
  { title:"company", templateUrl:"partials/partial2.html"},
  { title:"services", content:"Services Content" },
	{ title:"projects", content:"Projects Content" },
	{ title:"bids", templateUrl:"partials/partial2.html", content:"Bids Content", controller:"MyCtrl1" },
	{ title:"contact", content:"Contact Content" }
  ];
}

function CarouselDemoCtrl($scope) {
  $scope.myInterval = 5000;
  $scope.slides = [
    {image: 'http://placekitten.com/200/200',text: 'Kitten.'},
    {image: 'http://placekitten.com/225/200',text: 'Kitty!'},
    {image: 'http://placekitten.com/250/200',text: 'Cat.'},
    {image: 'http://placekitten.com/275/200',text: 'Feline!'}
  ];
  $scope.addSlide = function() {
    $scope.slides.push({
      image: 'http://placekitten.com/'+(200+25*Math.floor(Math.random()*4))+'/200',
      text: ['More','Extra','Lots of','Surplus'][Math.floor(Math.random()*4)] + ' ' +
        ['Cats', 'Kittys', 'Felines', 'Cutes'][Math.floor(Math.random()*4)]
    });
  };
}

function MyCtrl1() {}
MyCtrl1.$inject = [];

function MyCtrl2($scope, $location, $route) {
	$scope.activeTab = 
	console.log(activeTab);
	/* $scope.isActive = function(route) {
        return route === $location.path();
    }*/
}
MyCtrl2.$inject = [];