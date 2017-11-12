var app = angular.module("myapp",['ngRoute']);

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider

    .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
    })

    .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl'
    })

    .when('/', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
    })

    .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
    })

    .when('/profile', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl'
    })

    .when('/message', {
        templateUrl: 'views/message.html',
        controller: 'MessageCtrl'
    })

    .otherwise({ redirectTo: '/login' });
}])


app.service('updateService', ['$http','$rootScope', function ($http,$rootScope) {
    this.populate_profile = function() {
        console.log("It works!!");
        $http.get('/profile').success(function(response) {
            $rootScope.user = response;
        })
    }

    this.update_profile = function() {
        console.log("Update works!!");
        $http.put('/profile').success(function(response) {
            $rootScope.user = response;
        })
    }
}])


app.controller('LoginCtrl', ['$scope','$location','$http', function ($scope,$location,$http) {

    $scope.register = function() {
        $location.path("/register");
    }

    $scope.login = function() {
        console.log($scope.user);

        $http.post("/login",$scope.user).success(function(response) {
            if(response === "success"){
            $location.path("/home");
            }
            else{
                $scope.message = "Username or password incorrect";
            }
            $scope.user = "";
        })
    }
    
}])

app.controller('RegisterCtrl', ['$scope','$location','$http', function ($scope,$location,$http) {
   
   $scope.login = function() {
        $location.path("/login");
    } 

    $scope.register = function() {
        console.log($scope.user);

        $http.post("/register",$scope.user).success(function(response) {
            if(response === "success"){
                $location.path("/login");
            }else if(response === "taken"){
                $scope.taken = "Username or Email already taken.";
            } else {
                $scope.message = "Please try again.";
            }
            $scope.user = "";
        })
    }
}])

app.controller('HomeCtrl', ['$scope','updateService', function ($scope,updateService) {
     $scope.populate_profile = function() {
        updateService.populate_profile();
    }
}])

app.controller('ProfileCtrl', ['$scope','$http','$location', function ($scope,$http,$location) {
    
        //updateService.populate_profile();
        $http.get('/profile').success(function(response) {
            console.log(response);

            $scope.user = response;
        })
    

    
        $scope.update = function() {
           // updateService.update_profile();
          $http.put('/update/'+ $scope.user._id, $scope.user).success(function(response) {
            console.log($scope.user._id);
            if(response === "successful"){
            
            $scope.message = "Profile updated successfully";
            $location.path("/profile");
           // console.log("Profile updated");
        }else{
            $scope.message = "Error";
        }
           // $window.location.reload();
            //$scope.stu = "";
        })
    }

}])

app.controller('MessageCtrl', ['$scope','$http', function ($scope,$http) {
    $scope.send_email = function () {
        $scope.message = "Sending E-mail...Please wait";
        var to = $scope.to;
        console.log(to);
        var subject = $scope.subject;
        var content = $scope.content;   
$http({
    url: "/send",
    method: "GET",
    params: {to:to,subject:subject,content:content}
 }).success(function(serverResponse) {
console.log(serverResponse);
if(serverResponse == "sent") {
    $scope.message = "";
    $scope.message = "Email is been sent at "+to+" . Please check inbox!";
}
}).error(function(serverResponse) {
console.log(serverResponse);
});
    $scope.to = "";
    $scope.subject = "";
    $scope.content = "";
};

    $scope.close = function() {
        $scope.message = "";
    }
}])