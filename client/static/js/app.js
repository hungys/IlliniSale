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
            .when('/product/:product_id/edit', {
                templateUrl: 'static/partial/product_edit.html',
                controller: 'ProductEditController'
            })
            .when('/product/:product_id', {
                templateUrl: 'static/partial/product_detail.html',
                controller: 'ProductDetailController'
            })
            .when('/user/:user_id', {
                templateUrl: 'static/partial/user_profile.html',
                controller: 'UserProfileController'
            })
            .when('/wantlist', {
                templateUrl: 'static/partial/wantlist.html',
                controller: 'WantlistController'
            })
            .when('/mybids', {
                templateUrl: 'static/partial/my_bids.html',
                controller: 'MyBidsController'
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

myapp.factory('AuthService', ['$http', '$rootScope', '$localStorage', 'AppService', function($http, $rootScope, $localStorage, AppService) {
    var service = {};

    service.Login = function(email, password, success_callback, error_callback) {
        $http.post(AppService.GetAPIServer() + '/api/user/auth', {
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

    service.GetAPIServer = function() {
        return "http://127.0.0.1:5000";
    };

    return service;
}]);

myapp.controller('NavbarController', ['$scope', '$rootScope', '$http', '$localStorage', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $http, $localStorage, $location, $route, AuthService, AppService) {
    $rootScope.$on("auth_changed", function() {
        $scope.isLoggedIn = AuthService.IsLoggedIn();
        $scope.get_current_user();
    });

    $scope.get_current_user = function() {
        $http.get(AppService.GetAPIServer() + '/api/user/' + $localStorage.user_id + '/profile').success(function(response) {
            $rootScope.current_user = response
            $rootScope.current_user.user_id = $localStorage.user_id
            $scope.current_user = response
            $scope.current_user.user_id = $localStorage.user_id
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

myapp.controller('UserRegisterController', ['$scope', '$rootScope', '$http', '$localStorage', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $http, $localStorage, $location, $route, AuthService, AppService) {
    if (AuthService.IsLoggedIn()) {
        $location.path('/');
    }

    $scope.submit = function() {
        $http.post(AppService.GetAPIServer() + '/api/user', {
                email: $("#email").val(),
                password: $("#password").val(),
                first_name: $("#first_name").val(),
                last_name: $("#last_name").val(),
                nickname: $("#nickname").val(),
                gender: $("#gender").val(),
                mobile_phone: $("#mobile_phone").val(),
                birthday: $("#birthday").val()
            })
            .success(function(response) {
                $localStorage.user_id = response.user_id
                $localStorage.token = response.token
                $rootScope.$broadcast("auth_changed");
                alertify.success("Your are now logged in.");
                $route.reload()
                $location.path('/');
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to register, try again later!");
            });
    };

    $scope.check_email_valid = function() {
        $http.post(AppService.GetAPIServer() + '/api/user/check', {
                email: $("#email").val()
            })
            .success(function(response) {
                $scope.email_valid = response.valid;
            }).error(function(data, status, headers, config) {
                $scope.email_valid = false;
            });
    };

    $scope.email_valid = true;

    $('#email').blur(function() {
        $scope.check_email_valid();
    });
}]);

myapp.controller('ProductCategoryController', ['$scope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $http, $location, $route, AuthService, AppService) {
    $scope.categoryId = $route.current.params.category;
    $scope.categoryName = AppService.GetCategoryName($scope.categoryId);

    $scope.like = function(product) {
        $http.put(AppService.GetAPIServer() + '/api/product/' + product.product_id + "/like").success(function(response) {
            if (!product.is_liked && response.liked) {
                product.is_liked = 1;
                product.likes = product.likes + 1;
            } else if (product.is_liked && !response.liked) {
                product.is_liked = 0;
                product.likes = product.likes - 1;
            }
        });
    };

    $http.get(AppService.GetAPIServer() + '/api/product/category/' + $scope.categoryId).success(function(response) {
        $scope.products_list = response
    });
}]);

myapp.controller('ProductDetailController', ['$scope', '$rootScope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $http, $location, $route, AuthService, AppService) {
    $scope.productId = $route.current.params.product_id;

    $scope.like = function() {
        $http.put(AppService.GetAPIServer() + '/api/product/' + $scope.productId + "/like").success(function(response) {
            if (!$scope.product.is_liked && response.liked) {
                $scope.product.is_liked = 1;
                $scope.product.likes = $scope.product.likes + 1;
            } else if ($scope.product.is_liked && !response.liked) {
                $scope.product.is_liked = 0;
                $scope.product.likes = $scope.product.likes - 1;
            }
        });
    };

    $scope.respond = function(comment) {
        $scope.current_comment = comment;
        $("#new_response").val(comment.response);
    };

    $scope.submit_comment = function() {
        $http.post(AppService.GetAPIServer() + '/api/product/' + $scope.productId + '/comment', {
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
                $("#new_comment").val("");
                alertify.success("Your comment has been posted.");
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to submit, try again later!");
            });
    }

    $scope.submit_response = function() {
        $http.put(AppService.GetAPIServer() + '/api/comment/' + $scope.current_comment.comment_id, {
                response: $("#new_response").val()
            })
            .success(function(response) {
                for (var i = 0; i < $scope.product.comments.length; i++) {
                    if ($scope.product.comments[i].comment_id == $scope.current_comment.comment_id) {
                        $scope.product.comments[i].response = $("#new_response").val();
                        $scope.product.comments[i].response_time = AppService.GetCurrentTime();
                        $scope.product.comments[i].is_responded = $("#new_response").val() != "";
                    }
                }
                $("#new_response").val("");
                alertify.success("Your response has been saved.");
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to submit, try again later!");
            });
    };

    $scope.submit_bid = function() {
        $http.post(AppService.GetAPIServer() + '/api/product/' + $scope.product.product_id + '/bid', {
                price: parseInt($("#bid_price").val())
            })
            .success(function(response) {
                $("#bid_price").val("");
                alertify.success("Your bid request has been submitted.");
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to submit, try again later!");
            });
    }

    $http.get(AppService.GetAPIServer() + '/api/product/' + $scope.productId).success(function(response) {
        $scope.product = response
        $scope.product.comment_count = $scope.product.comments.length;
        $scope.product.is_owner = $scope.product.seller.user_id == $rootScope.current_user.user_id;

        for (var i = 0; i < $scope.product.comments.length; i++) {
            if ($scope.product.comments[i].response != null && $scope.product.comments[i].response != "") {
                $scope.product.comments[i].is_responded = true;
            } else {
                $scope.product.comments[i].is_responded = false;
            }
        }
    });
}]);

myapp.controller('ProductSellController', ['$scope', '$rootScope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $http, $location, $route, AuthService, AppService) {
    $scope.submit = function() {
        $http.post(AppService.GetAPIServer() + '/api/product' , {
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

myapp.controller('ProductEditController', ['$scope', '$rootScope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $http, $location, $route, AuthService, AppService) {
    $scope.productId = $route.current.params.product_id;

    $scope.save = function() {
        $http.put(AppService.GetAPIServer() + '/api/product/' + $scope.productId, {
                name: $scope.product.name,
                category: $scope.product.category,
                description: $scope.product.description,
                price: parseInt($scope.product.price),
                location: $scope.product.location
            })
            .success(function(response) {
                alertify.success("Your edit has been saved.");
                $location.path('/product/' + $scope.productId);
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to save, try again later!");
            });
    };

    $scope.category_list = $rootScope.category_list;

    $http.get(AppService.GetAPIServer() + '/api/product/' + $scope.productId).success(function(response) {
        $scope.product = response
        if ($scope.product.seller.user_id != $rootScope.current_user.user_id) {
            $location.path('/product/' + $scope.productId);
        }
    });
}]);

myapp.controller('ProductQueryController', ['$scope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $http, $location, $route, AuthService, AppService) {
    $scope.keyword = $location.search().keyword

    $scope.like = function(product) {
        $http.put(AppService.GetAPIServer() + '/api/product/' + product.product_id + "/like").success(function(response) {
            if (!product.is_liked && response.liked) {
                product.is_liked = 1;
                product.likes = product.likes + 1;
            } else if (product.is_liked && !response.liked) {
                product.is_liked = 0;
                product.likes = product.likes - 1;
            }
        });
    };

    $http.get(AppService.GetAPIServer() + '/api/product/query?keyword=' + $scope.keyword).success(function(response) {
        $scope.products_list = response
    });
}]);

myapp.controller('UserProfileController', ['$scope', '$rootScope', '$localStorage', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $localStorage, $http, $location, $route, AuthService, AppService) {
    $scope.userId = $route.current.params.user_id;

    $scope.like = function(product) {
        $http.put(AppService.GetAPIServer() + '/api/product/' + product.product_id + "/like").success(function(response) {
            if (!product.is_liked && response.liked) {
                product.is_liked = 1;
                product.likes = product.likes + 1;
            } else if (product.is_liked && !response.liked) {
                product.is_liked = 0;
                product.likes = product.likes - 1;
            }
        });
    };

    $scope.follow = function(user) {
        $http.put(AppService.GetAPIServer() + '/api/user/' + user.user_id + "/follow").success(function(response) {
            if (!user.is_followed && response.followed) {
                user.is_followed = 1;;
            } else if (user.is_followed && !response.followed) {
                user.is_followed = 0;
            }
        });
    };

    $scope.is_me = $scope.userId == $localStorage.user_id;

    $http.get(AppService.GetAPIServer() + '/api/user/' + $scope.userId + "/profile").success(function(response) {
        $scope.user = response
    });

    $http.get(AppService.GetAPIServer() + '/api/user/' + $scope.userId + "/product").success(function(response) {
        $scope.products_list = response
    });

    $http.get(AppService.GetAPIServer() + '/api/user/' + $scope.userId + "/follower").success(function(response) {
        $scope.followers_list = response
    });

    $http.get(AppService.GetAPIServer() + '/api/user/' + $scope.userId + "/following").success(function(response) {
        $scope.followings_list = response
    });
}]);

myapp.controller('WantlistController', ['$scope', '$rootScope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $http, $location, $route, AuthService, AppService) {
    $scope.insert = function() {
        $http.post(AppService.GetAPIServer() + '/api/wantlist', {
                name: $("#new_wantlist").val()
            })
            .success(function(response) {
                $scope.wantlists_list.splice(0, 0, {
                    create_time: AppService.GetCurrentTime(),
                    name: $("#new_wantlist").val(),
                    wantlist_id: response.wantlist_id
                });
                $("#new_wantlist").val("");
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to submit, try again later!");
            });
    };

    $scope.enter_edit_mode = function(wantlist) {
        wantlist.edit_mode = true;
    };

    $scope.save = function(wantlist) {
        wantlist.edit_mode = false;
        $http.put(AppService.GetAPIServer() + '/api/wantlist/' + wantlist.wantlist_id, {
                name: wantlist.name
            })
            .success(function(response) {
                alertify.success("Your change has been saved.");
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to save, try again later!");
            });
    };

    $scope.remove = function(wantlist) {
        $http.delete(AppService.GetAPIServer() + '/api/wantlist/' + wantlist.wantlist_id)
            .success(function(response) {
                var index = $scope.wantlists_list.indexOf(wantlist);
                $scope.wantlists_list.splice(index, 1);  
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to remove, try again later!");
            });
    };

    $http.get(AppService.GetAPIServer() + '/api/wantlist').success(function(response) {
        $scope.wantlists_list = response;
        for (var i = 0; i < $scope.wantlists_list.length; i++) {
            $scope.wantlists_list[i].edit_mode = false;
        }
    });
}]);

myapp.controller('MyBidsController', ['$scope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $http, $location, $route, AuthService, AppService) {
    $http.get(AppService.GetAPIServer() + '/api/bid').success(function(response) {
        $scope.bids_list = response
    });
}]);