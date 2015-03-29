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
            })
            .when('/user/:user_id', {
                templateUrl: 'static/partial/user_profile.html',
                controller: 'UserProfileController'
            });
    })
    .run(function($rootScope) {
        $rootScope.category_list = [
            {id: "3c-tech", name: "3C Technology"},
            {id: "for-her", name: "For Her"},
            {id: "for-him", name: "For Him"},
            {id: "baby-kids", name: "Baby & Kids"},
            {id: "luxury", name: "Luxury"},
            {id: "pet-accessories", name: "Pet Accessories"},
            {id: "furniture-home", name: "Furniture & Home"},
            {id: "kitchen-appliances", name: "Kitchen & Appliances"},
            {id: "vintage-antiques", name: "Vintage & Antiques"},
            {id: "cars-motors", name: "Car & Motors"},
            {id: "beauty-products", name: "Beauty Products"},
            {id: "textbooks", name: "Textbooks"},
            {id: "lifestyle-gadgets", name: "Lifestyle Gadgets"},
            {id: "design-craft", name: "Design & Craft"},
            {id: "music-instruments", name: "Music Instruments"},
            {id: "photography", name: "Photography"},
            {id: "sporting-gear", name: "Sporting Gear"},
            {id: "books", name: "Books"},
            {id: "tickets-vouchers", name: "Tickets / Vouchers"},
            {id: "games-toys", name: "Games & Toys"},
            {id: "everything-else", name: "Everything Else"}
        ];
    });

myapp.factory('AuthService', ['$http', '$rootScope', '$localStorage', function($http, $rootScope, $localStorage) {
    var service = {};

    service.Login = function(email, password, success_callback, error_callback) {
        $http.post('http://127.0.0.1:5000/api/user/auth', {
                email: email,
                password: password
            })
            .success(function(response) {
                $localStorage.user_id = response.user_id
                $localStorage.token = response.token
                $rootScope.$broadcast("auth_changed");
                success_callback(response);
            }).error(function(data, status, headers, config) {
                error_callback();
            });
    };

    service.Logout = function(callback) {
        $localStorage.user_id = null;
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

myapp.factory('AppService', ['$rootScope', function($rootScope) {
    var service = {};

    service.GetCategoryName = function(category_id) {
        for (var i = 0; i < $rootScope.category_list.length; i++) {
            if ($rootScope.category_list[i].id == category_id) {
                return $rootScope.category_list[i].name;
            }
        }
    };

    service.GetCurrentTime = function() {
        var d = new Date();
        return Math.round(d.getTime() / 1000);
    };

    return service;
}]);

myapp.controller('NavbarController', ['$scope', '$rootScope', '$http', '$localStorage', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $http, $localStorage, $location, $route, AuthService, AppService) {
    $rootScope.$on("auth_changed", function() {
        $scope.isLoggedIn = AuthService.IsLoggedIn();
        $scope.get_current_user();
    });

    $scope.get_current_user = function() {
        $http.get('http://127.0.0.1:5000/api/user/' + $localStorage.user_id + '/profile').success(function(response) {
            $rootScope.current_user = response
            $rootScope.current_user.user_id = $localStorage.user_id
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

    $scope.category_list = $rootScope.category_list;
    $scope.isLoggedIn = AuthService.IsLoggedIn();

    if ($scope.isLoggedIn) {
        $scope.get_current_user();
    }
}]);

myapp.controller('LandingPageController', ['$scope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $http, $location, $route, AuthService, AppService) {
    document.title = "IlliniSale";
}]);

myapp.controller('UserLoginController', ['$scope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $http, $location, $route, AuthService, AppService) {
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

myapp.controller('UserRegisterController', ['$scope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $http, $location, $route, AuthService, AppService) {

}]);

myapp.controller('ProductCategoryController', ['$scope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $http, $location, $route, AuthService, AppService) {
    $scope.categoryId = $route.current.params.category;
    $scope.categoryName = AppService.GetCategoryName($scope.categoryId);

    $scope.like = function(product) {
        $http.put('http://127.0.0.1:5000/api/product/' + product.product_id + "/like").success(function(response) {
            if (!product.is_liked && response.liked) {
                product.is_liked = 1;
                product.likes = product.likes + 1;
            } else if (product.is_liked && !response.liked) {
                product.is_liked = 0;
                product.likes = product.likes - 1;
            }
        });
    };

    $http.get('http://127.0.0.1:5000/api/product/category/' + $scope.categoryId).success(function(response) {
        $scope.products_list = response
    });
}]);

myapp.controller('ProductDetailController', ['$scope', '$rootScope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $http, $location, $route, AuthService, AppService) {
    $scope.productId = $route.current.params.product_id;

    $scope.like = function() {
        $http.put('http://127.0.0.1:5000/api/product/' + $scope.productId + "/like").success(function(response) {
            if (!$scope.product.is_liked && response.liked) {
                $scope.product.is_liked = 1;
                $scope.product.likes = $scope.product.likes + 1;
            } else if ($scope.product.is_liked && !response.liked) {
                $scope.product.is_liked = 0;
                $scope.product.likes = $scope.product.likes - 1;
            }
        });
    };

    $scope.submit_comment = function() {
        $http.post('http://127.0.0.1:5000/api/product/' + $scope.productId + '/comment', {
                content: $("#new_comment").val()
            })
            .success(function(response) {
                $scope.product.comments.splice(0, 0, {
                    content: $("#new_comment").val(),
                    comment_time: AppService.GetCurrentTime(),
                    user_id: $rootScope.current_user.user_id,
                    user_profile_pic: $rootScope.current_user.profile_pic,
                    comment_id: response.comment_id,
                    response: "",
                    response_time: 0,
                    user_nickname: $rootScope.current_user.nickname
                });
                $scope.product.comment_count = $scope.product.comment_count + 1;
                alertify.success("Your comment has been posted.");
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to submit, try again later!");
            });
    }

    $http.get('http://127.0.0.1:5000/api/product/' + $scope.productId).success(function(response) {
        $scope.product = response
        $scope.product.comment_count = $scope.product.comments.length;
    });
}]);

myapp.controller('ProductSellController', ['$scope', '$rootScope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $http, $location, $route, AuthService, AppService) {
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
    };

    $scope.category_list = $rootScope.category_list;
}]);

myapp.controller('ProductQueryController', ['$scope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $http, $location, $route, AuthService, AppService) {
    $scope.keyword = $location.search().keyword

    $scope.like = function(product) {
        $http.put('http://127.0.0.1:5000/api/product/' + product.product_id + "/like").success(function(response) {
            if (!product.is_liked && response.liked) {
                product.is_liked = 1;
                product.likes = product.likes + 1;
            } else if (product.is_liked && !response.liked) {
                product.is_liked = 0;
                product.likes = product.likes - 1;
            }
        });
    };

    $http.get('http://127.0.0.1:5000/api/product/query?keyword=' + $scope.keyword).success(function(response) {
        $scope.products_list = response
    });
}]);

myapp.controller('UserProfileController', ['$scope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $http, $location, $route, AuthService, AppService) {
    $scope.userId = $route.current.params.user_id;

    $http.get('http://127.0.0.1:5000/api/user/' + $scope.userId + "/profile").success(function(response) {
        $scope.user = response
    });

    $http.get('http://127.0.0.1:5000/api/user/' + $scope.userId + "/product").success(function(response) {
        $scope.products_list = response
    });

    $http.get('http://127.0.0.1:5000/api/user/' + $scope.userId + "/follower").success(function(response) {
        $scope.followers_list = response
    });

    $http.get('http://127.0.0.1:5000/api/user/' + $scope.userId + "/following").success(function(response) {
        $scope.followings_list = response
    });
}]);