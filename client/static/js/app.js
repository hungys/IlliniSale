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
            })
            .when('/product/all/:category', {
                templateUrl: 'static/partial/product_category.html',
                controller: 'ProductCategoryController'
            })
            .when('/product/sell', {
                templateUrl: 'static/partial/product_sell.html',
                controller: 'ProductSellController'
            })
            .when('/product/query', {
                templateUrl: 'static/partial/product_query.html',
                controller: 'ProductQueryController'
            })
            .when('/product/:product_id', {
                templateUrl: 'static/partial/product_detail.html',
                controller: 'ProductDetailController'
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
    $rootScope.$on("auth_changed", function() {
        $scope.isLoggedIn = AuthService.IsLoggedIn();
        $scope.get_current_user();
    });

    $scope.get_current_user = function() {
        $http.get('http://127.0.0.1:5000/api/user/1/profile').success(function(response) {
            $scope.current_user = response
        });
    };

    $scope.logout = function() {
        AuthService.Logout(function() {
            $route.reload();
            $location.path('/');
        });
    };

    $scope.search = function() {
        $location.path('/product/query').search('keyword', $("#navbar_search").val());
        $("#navbar_search").val("");
    };

    $scope.isLoggedIn = AuthService.IsLoggedIn();

    if ($scope.isLoggedIn) {
        $scope.get_current_user();
    }
}]);

myapp.controller('LandingPageController', ['$scope', '$http', '$location', '$route', 'AuthService', function($scope, $http, $location, $route, AuthService) {
    document.title = "IlliniSale";
}]);

myapp.controller('UserLoginController', ['$scope', '$http', '$location', '$route', 'AuthService', function($scope, $http, $location, $route, AuthService) {
    document.title = "Login - IlliniSale";

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

myapp.controller('ProductCategoryController', ['$scope', '$http', '$location', '$route', 'AuthService', function($scope, $http, $location, $route, AuthService) {
    $scope.categoryId = $route.current.params.category;
    $scope.categoryName = $scope.categoryId;

    $http.get('http://127.0.0.1:5000/api/product/category/' + $scope.categoryId).success(function(response) {
        $scope.products_list = response
    });
}]);

myapp.controller('ProductDetailController', ['$scope', '$http', '$location', '$route', 'AuthService', function($scope, $http, $location, $route, AuthService) {
    $scope.productId = $route.current.params.product_id;

    $http.get('http://127.0.0.1:5000/api/product/' + $scope.productId).success(function(response) {
        $scope.product = response
    });
}]);

myapp.controller('ProductSellController', ['$scope', '$http', '$location', '$route', 'AuthService', function($scope, $http, $location, $route, AuthService) {
    $scope.submit = function() {
        $http.post('http://127.0.0.1:5000/api/product', {
                name: $("#name").val(),
                category: $("#category").val(),
                description: $("#description").val(),
                price: parseInt($("#price").val()),
                location: $("#location").val(),
                tags: []
            })
            .success(function(response) {
                alertify.success("Your product has been posted.");
                $location.path('/product/' + response.product_id);
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to submit, try again later!");
            });
    }
}]);

myapp.controller('ProductQueryController', ['$scope', '$http', '$location', '$route', 'AuthService', function($scope, $http, $location, $route, AuthService) {
    $scope.keyword = $location.search().keyword

    $http.get('http://127.0.0.1:5000/api/product/query?keyword=' + $scope.keyword).success(function(response) {
        $scope.products_list = response
    });
}]);