'use strict';

var myapp = angular.module('myApp', ['ngStorage', 'ngRoute'])
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push(['$localStorage', function($localStorage) {
            return {
                'request': function(config) {
                    config.headers = config.headers || {};
                    if ($localStorage.token) {
                        config.headers.Authorization = 'Bearer ' + $localStorage.token;
                    }
                    return config;
                }
            };
        }]);
    }])
    .config(function($routeProvider, $locationProvider) {
        $routeProvider.when('/', {
                templateUrl: 'static/partial/landing_page.html',
                controller: 'LandingPageController'
            })
            .when('/user/login', {
                templateUrl: 'static/partial/user_login.html',
                controller: 'UserLoginController'
            })
            .when('/user/register', {
                templateUrl: 'static/partial/user_register.html',
                controller: 'UserRegisterController'
            });
    });

myapp.factory('AuthService', ['$http', '$rootScope', '$localStorage', function($http, $rootScope, $localStorage) {
    var service = {};

    service.Login = function(email, password, success_callback, error_callback) {
        $http.post('http://127.0.0.1:5000/api/user/auth', {
                email: email,
                password: password
            })
            .success(function(response) {
                $localStorage.token = response.token
                $rootScope.$broadcast("auth_changed");
                success_callback(response);
            }).error(function(data, status, headers, config) {
                error_callback();
            });
    };

    service.Logout = function(callback) {
        $localStorage.token = null;
        $rootScope.$broadcast("auth_changed");
        callback();
    };

    service.SetToken = function(token) {
        $localStorage.token = token;
    };

    service.ClearToken = function(token) {
        $localStorage.token = null;
    };

    service.IsLoggedIn = function() {
        return $localStorage.token != null && $localStorage.token != "";
    }

    return service;
}]);

myapp.controller('NavbarController', ['$scope', '$rootScope', '$http', '$location', '$route', 'AuthService', function($scope, $rootScope, $http, $location, $route, AuthService) {
    $scope.isLoggedIn = AuthService.IsLoggedIn();

    $rootScope.$on("auth_changed", function() {
        $scope.isLoggedIn = AuthService.IsLoggedIn();
    });

    $scope.logout = function() {
        AuthService.Logout(function() {
            $route.reload();
            $location.path('/');
        });
    };
}]);

myapp.controller('LandingPageController', ['$scope', '$http', '$location', '$route', 'AuthService', function($scope, $http, $location, $route, AuthService) {

}]);

myapp.controller('UserLoginController', ['$scope', '$http', '$location', '$route', 'AuthService', function($scope, $http, $location, $route, AuthService) {
    $scope.login = function() {
        if ($("#email").val() === "" || $("#password").val() === "") {
            alertify.error("Email and password cannot be empty!");
        } else {
            AuthService.Login($("#email").val(), $("#password").val(), 
                function(response) {
                    alertify.success("You are now logged in!");
                    $route.reload();
                    $location.path('/');
                }, 
                function() {
                    AuthService.ClearToken();
                    alertify.error("Email or password is wrong.");
                    $("#password").val("");
                });
        }
    };
}]);

myapp.controller('UserRegisterController', ['$scope', '$http', '$location', '$route', 'AuthService', function($scope, $http, $location, $route, AuthService) {

}]);