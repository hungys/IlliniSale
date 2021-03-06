'use strict';

var myapp = angular.module('myApp', ['ngStorage', 'ngRoute', 'angularFileUpload'])
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
            .when('/product/all/:category/:pageno', {
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
            .when('/settings', {
                templateUrl: 'static/partial/user_settings.html',
                controller: 'UserSettingsController'
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

    service.GetDateTimeFromSecond = function(second) {
        var d = new Date(second * 1000);
        return d.toString();
    };

    service.GetAPIServer = function() {
        return "http://127.0.0.1:5000";
    };

    return service;
}]);

myapp.directive('ngThumb', ['$window', function($window) {
    var helper = {
        support: !!($window.FileReader && $window.CanvasRenderingContext2D),
        isFile: function(item) {
            return angular.isObject(item) && item instanceof $window.File;
        },
        isImage: function(file) {
            var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    };

    return {
        restrict: 'A',
        template: '<canvas/>',
        link: function(scope, element, attributes) {
            if (!helper.support) return;

            var params = scope.$eval(attributes.ngThumb);

            if (!helper.isFile(params.file)) return;
            if (!helper.isImage(params.file)) return;

            var canvas = element.find('canvas');
            var reader = new FileReader();

            reader.onload = onLoadFile;
            reader.readAsDataURL(params.file);

            function onLoadFile(event) {
                var img = new Image();
                img.onload = onLoadImage;
                img.src = event.target.result;
            }

            function onLoadImage() {
                var width = params.width || this.width / this.height * params.height;
                var height = params.height || this.height / this.width * params.width;
                canvas.attr({ width: width, height: height });
                canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
            }
        }
    };
}]);

myapp.controller('NavbarController', ['$scope', '$rootScope', '$http', '$localStorage', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $http, $localStorage, $location, $route, AuthService, AppService) {
    $rootScope.$on("auth_changed", function() {
        $scope.isLoggedIn = AuthService.IsLoggedIn();
        if ($scope.isLoggedIn) {
            $scope.get_current_user();
            $scope.get_notifications();
            $scope.set_notificaton_timer();
        }
    });

    $scope.$on('$routeChangeSuccess', function () {
        if ($(".navbar-collapse").hasClass("in")) {
            $('[data-toggle="collapse"]').click();
        }
    });

    $scope.get_current_user = function() {
        $http.get(AppService.GetAPIServer() + '/api/user/' + $localStorage.user_id + '/profile').success(function(response) {
            $rootScope.current_user = response
            $rootScope.current_user.user_id = $localStorage.user_id
            $scope.current_user = response
            $scope.current_user.user_id = $localStorage.user_id
        });
    };

    $scope.get_notifications = function() {
        $http.get(AppService.GetAPIServer() + '/api/notification/latest').success(function(response) {
            $scope.notification_list = response
        });
    };

    $scope.set_notificaton_timer = function() {
        if ($scope.notification_timer == null) {
            $scope.notification_timer = setInterval(function() {$scope.get_notifications()}, 30000);
        }
    };

    $scope.clear_notificaton_timer = function() {
        if ($scope.notification_timer != null) {
            clearInterval($scope.notification_timer);
            $scope.notification_timer = null;
        }
    };

    $scope.login = function() {
        var redirect_url = $location.url()
        $location.path('/user/login').search('redirect', redirect_url);
    };

    $scope.logout = function() {
        AuthService.Logout(function() {
            $scope.clear_notificaton_timer();
            $route.reload();
            $location.path('/');
        });
    };

    $scope.search = function() {
        $location.path('/product/query').search('keyword', $("#navbar_search").val());
        $("#navbar_search").val("");
    };

    $scope.notification_timer = null;
    $scope.category_list = $rootScope.category_list;
    $scope.isLoggedIn = AuthService.IsLoggedIn();

    if ($scope.isLoggedIn) {
        $scope.get_current_user();
        $scope.get_notifications();
        $scope.set_notificaton_timer();
    }
}]);

myapp.controller('LandingPageController', ['$scope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $http, $location, $route, AuthService, AppService) {
    document.title = "IlliniSale";

    $scope.isLoggedIn = AuthService.IsLoggedIn();

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

    $http.get(AppService.GetAPIServer() + '/api/product/landing').success(function(response) {
        $scope.landing_page_feeds = response;
    });
}]);

myapp.controller('UserLoginController', ['$scope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $http, $location, $route, AuthService, AppService) {
    document.title = "Login - IlliniSale";

    var redirect_url = "/";

    if ($route.current.params.redirect != null) {
        redirect_url = $route.current.params.redirect;
    }

    $scope.login = function() {
        if ($("#email").val() === "" || $("#password").val() === "") {
            alertify.error("Email and password cannot be empty!");
        } else {
            AuthService.Login($("#email").val(), $("#password").val(), 
                function(response) {
                    alertify.success("You are now logged in!");
                    $route.reload();
                    $location.url(redirect_url);
                }, 
                function() {
                    AuthService.ClearToken();
                    alertify.error("Email or password is wrong.");
                    $("#password").val("");
                });
        }
    };
}]);

myapp.controller('UserRegisterController', ['$scope', '$rootScope', '$http', '$localStorage', '$location', '$route', 'AuthService', 'AppService', 'FileUploader', function($scope, $rootScope, $http, $localStorage, $location, $route, AuthService, AppService, FileUploader) {
    document.title = "Register - IlliniSale";

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
                if ($scope.uploader.queue.length == 0) {
                    $rootScope.$broadcast("auth_changed");
                    alertify.success("Your are now logged in.");
                    $route.reload()
                    $location.path('/');
                } else {
                    $scope.uploader.uploadAll();
                }
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

    var uploader = $scope.uploader = new FileUploader({
        url: AppService.GetAPIServer() + '/api/user/upload',
        queueLimit: 1
    });

    uploader.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    uploader.onBeforeUploadItem = function(item) {
        var formData = [{
            user_id: $localStorage.user_id,
        }];
        Array.prototype.push.apply(item.formData, formData);
    };

    uploader.onCompleteAll = function() {
        $rootScope.$broadcast("auth_changed");
        alertify.success("Your are now logged in.");
        $route.reload()
        $location.path('/');
    };

    $scope.email_valid = true;

    $('#email').blur(function() {
        $scope.check_email_valid();
    });
}]);

myapp.controller('UserSettingsController', ['$scope', '$rootScope', '$http', '$localStorage', '$location', '$route', 'AuthService', 'AppService', 'FileUploader', function($scope, $rootScope, $http, $localStorage, $location, $route, AuthService, AppService, FileUploader) {
    document.title = "Settings - IlliniSale";

    if (!AuthService.IsLoggedIn()) {
        $location.path('/user/login').search('redirect', '/settings');
    }

    $scope.submit = function() {
        $http.put(AppService.GetAPIServer() + '/api/user', {
                email: $scope.user.email,
                password: $scope.user.password,
                first_name: $scope.user.first_name,
                last_name: $scope.user.last_name,
                nickname: $scope.user.nickname,
                gender: $scope.user.gender,
                mobile_phone: $scope.user.mobile_phone
            })
            .success(function(response) {
                if ($scope.uploader.queue.length == 0) {
                    alertify.success("Your changes have been saved.");
                    $rootScope.$broadcast("auth_changed");
                    $route.reload()
                    $location.path('/');
                } else {
                    $scope.uploader.uploadAll();
                }
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to save, try again later!");
            });
    };

    $scope.choose_photo = function() {
        $scope.uploader.clearQueue();
    };

    var uploader = $scope.uploader = new FileUploader({
        url: AppService.GetAPIServer() + '/api/user/upload',
        queueLimit: 1
    });

    uploader.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    uploader.onBeforeUploadItem = function(item) {
        var formData = [{
            user_id: $rootScope.current_user.user_id,
        }];
        Array.prototype.push.apply(item.formData, formData);
    };

    uploader.onCompleteAll = function() {
        alertify.success("Your changes have been saved.");
        $rootScope.$broadcast("auth_changed");
        $route.reload()
        $location.path('/');
    };

    $http.get(AppService.GetAPIServer() + '/api/user').success(function(response) {
        $scope.user = response;
    });
}]);

myapp.controller('ProductCategoryController', ['$scope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $http, $location, $route, AuthService, AppService) {
    $scope.isLoggedIn = AuthService.IsLoggedIn();

    $scope.categoryId = $route.current.params.category;
    $scope.categoryName = AppService.GetCategoryName($scope.categoryId);
    if ($route.current.params.pageno != null) {
        $scope.currentPage = parseInt($route.current.params.pageno);
    } else {
        $scope.currentPage = 1
    }

    document.title = $scope.categoryName + " - IlliniSale";

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

    $scope.set_pagination_bar = function() {
        $scope.isFirstPage = $scope.currentPage == 1;
        $scope.isLastPage = $scope.currentPage == $scope.totalPages;
        $scope.paginationBar = []

        var pagebar_start = 0, pagebar_end = 0;

        if ($scope.totalPages < 5) {
            pagebar_start = 1;
            pagebar_end = $scope.totalPages;
        } else if ($scope.currentPage <= 5) {
            pagebar_start = 1;
            pagebar_end = 5;
        } else if ($scope.currentPage > $scope.totalPages - 4) {
            pagebar_start = $scope.totalPages - 4;
            pagebar_end = $scope.totalPages;
        } else {
            pagebar_start = $scope.currentPage - 2;
            pagebar_end = $scope.currentPage + 2;
        }

        for (var i = pagebar_start; i <= pagebar_end; i++) {
            $scope.paginationBar.push({
                page: i,
                current: i == $scope.currentPage
            });
        }
    };

    $http.get(AppService.GetAPIServer() + '/api/product/category/' + $scope.categoryId + '?page=' + $scope.currentPage).success(function(response) {
        $scope.products_list = response.results;
        $scope.totalPages = response.total_pages;
        $scope.set_pagination_bar();
    });
}]);

myapp.controller('ProductDetailController', ['$scope', '$rootScope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $http, $location, $route, AuthService, AppService) {
    $scope.isLoggedIn = AuthService.IsLoggedIn();
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

    $scope.toggle_sold = function() {
        $http.put(AppService.GetAPIServer() + '/api/product/' + $scope.productId + "/sold").success(function(response) {
            if ($scope.product.is_sold != 1 && response.sold) {
                $scope.product.is_sold = 1;
            } else if ($scope.product.is_sold == 1 && !response.sold) {
                $scope.product.is_sold = 0;
            }
        });
    }

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
    };

    $scope.login = function() {
        var redirect_url = $location.url()
        $location.path('/user/login').search('redirect', redirect_url);
    };

    $http.get(AppService.GetAPIServer() + '/api/product/' + $scope.productId).success(function(response) {
        $scope.product = response
        $scope.product.comment_count = $scope.product.comments.length;
        $scope.product.is_owner = $scope.isLoggedIn && $scope.product.seller.user_id == $rootScope.current_user.user_id;
        $scope.product.tag_empty = $scope.product.tags.length == 0

        for (var i = 0; i < $scope.product.comments.length; i++) {
            if ($scope.product.comments[i].response != null && $scope.product.comments[i].response != "") {
                $scope.product.comments[i].is_responded = true;
            } else {
                $scope.product.comments[i].is_responded = false;
            }
        }

        document.title = $scope.product.name + " - IlliniSale";
    });

    $http.get(AppService.GetAPIServer() + '/api/product/' + $scope.productId + '/similar').success(function(response) {
        $scope.similar_products = response
    });
}]);

myapp.controller('ProductSellController', ['$scope', '$rootScope', '$http', '$location', '$route', 'AuthService', 'AppService', 'FileUploader', function($scope, $rootScope, $http, $location, $route, AuthService, AppService, FileUploader) {
    document.title = "Sell - IlliniSale";

    if (!AuthService.IsLoggedIn()) {
        $location.path('/user/login').search('redirect', '/product/sell');
    }

    $scope.submit = function() {
        $http.post(AppService.GetAPIServer() + '/api/product' , {
                name: $("#name").val(),
                category: $("#category").val(),
                description: $("#description").val(),
                price: parseInt($("#price").val()),
                location: $("#location").val(),
                tags: $scope.current_tags
            })
            .success(function(response) {
                if ($scope.uploader.queue.length == 0) {
                    alertify.success("Your product has been posted.");
                    $location.path('/product/' + response.product_id);
                } else {
                    $scope.redirect_id = response.product_id;
                    $scope.uploader.uploadAll();
                }
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to submit, try again later!");
            });
    };

    $scope.add_tag = function() {
        if ($("#new_tag").val() != "") {
            for (var i = 0; i < $scope.current_tags.length; i++) {
                if ($scope.current_tags[i] == $("#new_tag").val()) {
                    alertify.error($("#new_tag").val() + " is existed");
                    $("#new_tag").val("");
                    return;
                }
            }
            $scope.current_tags.push($("#new_tag").val());
            $("#new_tag").val("");
        }
    };

    $scope.remove_tag = function(index) {
        $scope.current_tags.splice(index, 1);
    };

    $scope.add_suggestion_tag = function(index) {
        for (var i = 0; i < $scope.current_tags.length; i++) {
            if ($scope.current_tags[i] == $scope.suggestion_tags[index]) {
                alertify.error($scope.suggestion_tags[index] + " is existed");
                $scope.suggestion_tags.splice(index, 1);
                return;
            }
        }
        $scope.current_tags.push($scope.suggestion_tags[index]);
        $scope.suggestion_tags.splice(index, 1);
    };

    var uploader = $scope.uploader = new FileUploader({
        url: AppService.GetAPIServer() + '/api/product/upload'
    });

    uploader.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    uploader.onBeforeUploadItem = function(item) {
        var formData = [{
            product_id: $scope.redirect_id,
        }];
        Array.prototype.push.apply(item.formData, formData);
    };

    uploader.onCompleteAll = function() {
        alertify.success("Your product has been posted.");
        $location.path('/product/' + $scope.redirect_id);
    };

    $scope.category_list = $rootScope.category_list;
    $scope.current_tags = [];
    $scope.suggestion_tags = []

    $scope.$watchCollection('current_tags', function(newCol, oldCol, scope) {
        if ($scope.current_tags.length > 0) {
            $http.post(AppService.GetAPIServer() + '/api/product/tag/suggestion', {
                tags: $scope.current_tags
            })
            .success(function(response) {
                $scope.suggestion_tags = response;
            });
        } else if ($("#name").val() != "") {
            $http.post(AppService.GetAPIServer() + '/api/product/tag/suggestion', {
                name: $("#name").val()
            })
            .success(function(response) {
                $scope.suggestion_tags = response;
            });
        }
    });

    $("#name").blur(function() {
        if ($scope.current_tags.length == 0 && $("#name").val() != "") {
            $http.post(AppService.GetAPIServer() + '/api/product/tag/suggestion', {
                name: $("#name").val()
            })
            .success(function(response) {
                $scope.suggestion_tags = response;
            });
        }
    });
}]);

myapp.controller('ProductEditController', ['$scope', '$rootScope', '$http', '$location', '$route', 'AuthService', 'AppService', 'FileUploader', function($scope, $rootScope, $http, $location, $route, AuthService, AppService, FileUploader) {
    $scope.productId = $route.current.params.product_id;

    $scope.save = function() {
        $http.put(AppService.GetAPIServer() + '/api/product/' + $scope.productId, {
                name: $scope.product.name,
                category: $scope.product.category,
                description: $scope.product.description,
                price: parseInt($scope.product.price),
                location: $scope.product.location,
                tags: $scope.current_tags
            })
            .success(function(response) {
                if ($scope.uploader.queue.length == 0) {
                    alertify.success("Your edit has been saved.");
                    $location.path('/product/' + $scope.productId);
                } else {
                    $scope.uploader.uploadAll();
                }
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to save, try again later!");
            });
    };

    $scope.add_tag = function() {
        if ($("#new_tag").val() != "") {
            for (var i = 0; i < $scope.current_tags.length; i++) {
                if ($scope.current_tags[i] == $("#new_tag").val()) {
                    alertify.error($("#new_tag").val() + " is existed");
                    $("#new_tag").val("");
                    return;
                }
            }
            $scope.current_tags.push($("#new_tag").val());
            $("#new_tag").val("");
        }
    };

    $scope.remove_tag = function(index) {
        $scope.current_tags.splice(index, 1);
    };

    $scope.add_suggestion_tag = function(index) {
        for (var i = 0; i < $scope.current_tags.length; i++) {
            if ($scope.current_tags[i] == $scope.suggestion_tags[index]) {
                alertify.error($scope.suggestion_tags[index] + " is existed");
                $scope.suggestion_tags.splice(index, 1);
                return;
            }
        }
        $scope.current_tags.push($scope.suggestion_tags[index]);
        $scope.suggestion_tags.splice(index, 1);
    };

    $scope.delete_photo = function(photo) {
        $http.delete(AppService.GetAPIServer() + '/api/product/upload/' + photo.photo_id)
            .success(function(response) {
                var index = $scope.product.photos.indexOf(photo);
                $scope.product.photos.splice(index, 1);
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to delete, try again later!");
            });
    };

    var uploader = $scope.uploader = new FileUploader({
        url: AppService.GetAPIServer() + '/api/product/upload'
    });

    uploader.filters.push({
        name: 'imageFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    uploader.onBeforeUploadItem = function(item) {
        var formData = [{
            product_id: $scope.productId,
        }];
        Array.prototype.push.apply(item.formData, formData);
    };

    uploader.onCompleteAll = function() {
        alertify.success("Your edit has been saved.");
        $location.path('/product/' + $scope.productId);
    };

    $scope.category_list = $rootScope.category_list;
    $scope.current_tags = [];
    $scope.suggestion_tags = []

    $http.get(AppService.GetAPIServer() + '/api/product/' + $scope.productId).success(function(response) {
        $scope.product = response
        if ($scope.product.seller.user_id != $rootScope.current_user.user_id) {
            $location.path('/product/' + $scope.productId);
        }
        $scope.current_tags = response.tags
    });

    $scope.$watchCollection('current_tags', function(newCol, oldCol, scope) {
        if ($scope.current_tags.length > 0) {
            $http.post(AppService.GetAPIServer() + '/api/product/tag/suggestion', {
                tags: $scope.current_tags
            })
            .success(function(response) {
                $scope.suggestion_tags = response;
            });
        } else if ($("#name").val() != "") {
            $http.post(AppService.GetAPIServer() + '/api/product/tag/suggestion', {
                name: $("#name").val()
            })
            .success(function(response) {
                $scope.suggestion_tags = response;
            });
        }
    });

    $("#name").blur(function() {
        if ($scope.current_tags.length == 0 && $("#name").val() != "") {
            $http.post(AppService.GetAPIServer() + '/api/product/tag/suggestion', {
                name: $("#name").val()
            })
            .success(function(response) {
                $scope.suggestion_tags = response;
            });
        }
    });
}]);

myapp.controller('ProductQueryController', ['$scope', '$rootScope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $http, $location, $route, AuthService, AppService) {
    $scope.isLoggedIn = AuthService.IsLoggedIn();

    if ($location.search().keyword != null) {
        $scope.criteria_keyword = $location.search().keyword
        $scope.keyword = $location.search().keyword
        document.title = "Search for " + $scope.keyword + " - IlliniSale";
    } else {
        $scope.criteria_keyword = ""
        $scope.keyword = ""
        document.title = "Search - IlliniSale";
    }

    if ($location.search().category != null) {
        $scope.criteria_category = $location.search().category
    } else {
        $scope.criteria_category = "all"
    }

    if ($location.search().min_price != null) {
        $scope.criteria_min_price = parseInt($location.search().min_price)
    } else {
        $scope.criteria_min_price = ""
    }

    if ($location.search().max_price != null) {
        $scope.criteria_max_price = parseInt($location.search().max_price)
    } else {
        $scope.criteria_max_price = ""
    }

    if ($location.search().page != null) {
        $scope.currentPage = parseInt($location.search().page);
    } else {
        $scope.currentPage = 1;
    }

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

    $scope.set_pagination_bar = function() {
        $scope.isFirstPage = $scope.currentPage == 1;
        $scope.isLastPage = $scope.currentPage == $scope.totalPages;
        $scope.paginationBar = []

        var pagebar_start = 0, pagebar_end = 0;

        if ($scope.totalPages < 5) {
            pagebar_start = 1;
            pagebar_end = $scope.totalPages;
        } else if ($scope.currentPage <= 5) {
            pagebar_start = 1;
            pagebar_end = 5;
        } else if ($scope.currentPage > $scope.totalPages - 4) {
            pagebar_start = $scope.totalPages - 4;
            pagebar_end = $scope.totalPages;
        } else {
            pagebar_start = $scope.currentPage - 2;
            pagebar_end = $scope.currentPage + 2;
        }

        for (var i = pagebar_start; i <= pagebar_end; i++) {
            $scope.paginationBar.push({
                page: i,
                current: i == $scope.currentPage
            });
        }
    };

    $scope.navigate_previous = function() {
        if ($scope.currentPage != 1) {
            $location.search('page', $scope.currentPage - 1);
        } else {
            $location.search('page', 1);
        }
    }

    $scope.navigate_to = function(page) {
        $location.search('page', page);
    }

    $scope.navigate_next = function() {
        if ($scope.currentPage != $scope.totalPages) {
            $location.search('page', $scope.currentPage + 1);
        } else {
            $location.search('page', $scope.totalPages);
        }
    }

    $scope.search = function() {
        $location.path('/product/query').search({
            'keyword': $scope.criteria_keyword,
            'category': $scope.criteria_category,
            'min_price': $scope.criteria_min_price,
            'max_price': $scope.criteria_max_price
        });
    };

    $scope.category_list = $rootScope.category_list.slice();
    $scope.category_list.splice(0, 0, {id: "all", name: "All"});

    $http.get(AppService.GetAPIServer() + '/api/product/query?keyword=' + $scope.criteria_keyword + '&category=' + $scope.criteria_category + '&price_low=' + $scope.criteria_min_price + '&price_high=' + $scope.criteria_max_price + '&page=' + $scope.currentPage).success(function(response) {
        $scope.products_list = response.results;
        $scope.totalPages = response.total_pages;
        $scope.set_pagination_bar();
    });
}]);

myapp.controller('UserProfileController', ['$scope', '$rootScope', '$localStorage', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $localStorage, $http, $location, $route, AuthService, AppService) {
    $scope.isLoggedIn = AuthService.IsLoggedIn();
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
        document.title = $scope.user.nickname + "'s Profile - IlliniSale";
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

    $http.get(AppService.GetAPIServer() + '/api/user/' + $scope.userId + "/review").success(function(response) {
        $scope.reviews_list = response
    });
}]);

myapp.controller('WantlistController', ['$scope', '$rootScope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $http, $location, $route, AuthService, AppService) {
    document.title = "My Wantlist - IlliniSale";

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

myapp.controller('MyBidsController', ['$scope', '$rootScope', '$http', '$location', '$route', 'AuthService', 'AppService', function($scope, $rootScope, $http, $location, $route, AuthService, AppService) {
    document.title = "My Bids - IlliniSale";

    if (!AuthService.IsLoggedIn()) {
        $location.path('/user/login').search('redirect', '/mybids');
    }

    $scope.action_pending = false;

    if ($route.current.params.bid_id != null) {
        $scope.action_pending = true;
        $scope.action_type = "highlight";
        $scope.action_bid_id = $route.current.params.bid_id;
    } else if ($route.current.params.user_id != null) {
        $scope.action_pending = true;
        $scope.action_type = "message";
        $scope.action_user_id = $route.current.params.user_id;
    }

    $scope.accept = function(bid) {
        if (bid.is_new) {
            $http.put(AppService.GetAPIServer() + '/api/bid/' + bid.bid_id, {
                    "accept": 1
                }).success(function(response) {
                    bid.status = "accepted";
                    bid.status_display = "Accepted";
                    bid.is_new = false;
                }).error(function(data, status, headers, config) {
                    alertify.error("Fail to accept, try again later!");
                });
        }
    };

    $scope.reject = function(bid) {
        if (bid.is_new) {
            $http.put(AppService.GetAPIServer() + '/api/bid/' + bid.bid_id, {
                    "accept": 0
                }).success(function(response) {
                    bid.status = "rejected";
                    bid.status_display = "Rejected";
                    bid.is_new = false;
                }).error(function(data, status, headers, config) {
                    alertify.error("Fail to reject, try again later!");
                });
        }
    };

    $scope.delete = function(bid) {
        if (bid.is_new) {
            $http.delete(AppService.GetAPIServer() + '/api/bid/' + bid.bid_id)
                .success(function(response) {
                    var index = $scope.bids_list.bids.indexOf(bid);
                    $scope.bids_list.bids.splice(index, 1); 
                }).error(function(data, status, headers, config) {
                    alertify.error("Fail to delete, try again later!");
                });
        }
    };

    $scope.contact = function(user_id, nickname) {
        $scope.current_conversation = {
            "user_id": user_id,
            "nickname": nickname
        };

        $http.get(AppService.GetAPIServer() + '/api/message/' + user_id)
            .success(function(response) {
                $scope.current_conversation.messages = response
                for (var i = 0; i < $scope.current_conversation.messages.length; i++) {
                    $scope.current_conversation.messages[i].from_me = $scope.current_conversation.messages[i].speaker == $rootScope.current_user.user_id;
                }
            });
    };

    $scope.send_message = function() {
        $http.post(AppService.GetAPIServer() + '/api/message/' + $scope.current_conversation.user_id, {
                    "content": $("#new_message").val()
                }).success(function(response) {
                    $scope.current_conversation.messages.push({
                        "content": $("#new_message").val(),
                        "timestamp": AppService.GetCurrentTime(),
                        "speaker": $rootScope.current_user.user_id,
                        "from_me": true
                    });
                    $("#new_message").val("");
                }).error(function(data, status, headers, config) {
                    alertify.error("Fail to send, try again later!");
                });
    };

    $scope.review = function(bid) {
        $scope.current_review = {
            "bid_id": bid.bid_id,
            "user_id": bid.product.seller_user_id,
            "nickname": bid.product.seller_nickname
        };
    };

    $scope.submit_review = function() {
        $http.post(AppService.GetAPIServer() + '/api/user/' + $scope.current_review.user_id + '/review', {
                "bid_id": $scope.current_review.bid_id,
                "rating": parseInt($("#new_rating").val()),
                "content": $("#new_review").val()
            }).success(function(response) {
                for (var i = 0; i < $scope.bids_list.bids.length; i++) {
                    if ($scope.bids_list.bids[i].bid_id == $scope.current_review.bid_id) {
                        $scope.bids_list.bids[i].is_reviewed = 1;
                    }
                }
                $("#new_review").val("");
                $("#modal_review").modal('hide');
                alertify.success("Your review has been posted.")
            }).error(function(data, status, headers, config) {
                alertify.error("Fail to submit, try again later!");
            });
    };

    $http.get(AppService.GetAPIServer() + '/api/bid').success(function(response) {
        $scope.bids_list = response;

        for (var i = 0; i < $scope.bids_list.sells.length; i++) {
            $scope.bids_list.sells[i].bid_time = AppService.GetDateTimeFromSecond($scope.bids_list.sells[i].timestamp);
            $scope.bids_list.sells[i].is_new = $scope.bids_list.sells[i].status == "new";
            switch ($scope.bids_list.sells[i].status) {
                case "new":
                    $scope.bids_list.sells[i].status_display = "New";
                    break;
                case "accepted":
                    $scope.bids_list.sells[i].status_display = "Accepted";
                    break;
                case "rejected":
                    $scope.bids_list.sells[i].status_display = "Rejected";
                    break;
            }

            if ($scope.action_pending &&
                $scope.action_type == "highlight" &&
                $scope.bids_list.sells[i].bid_id == $scope.action_bid_id) {
                $scope.bids_list.sells[i].highlight = true;
                $scope.action_pending = false;
            } else {
                $scope.bids_list.sells[i].highlight = false;
            }

            if ($scope.action_pending && 
                $scope.action_type == "message" &&
                $scope.bids_list.sells[i].bidder.user_id == $scope.action_user_id) {
                $scope.contact($scope.bids_list.sells[i].bidder.user_id, $scope.bids_list.sells[i].bidder.nickname);
                $("#modal_message").modal("show");
                $scope.action_pending = false;
            }
        }

        for (var i = 0; i < $scope.bids_list.bids.length; i++) {
            $scope.bids_list.bids[i].bid_time = AppService.GetDateTimeFromSecond($scope.bids_list.bids[i].timestamp);
            $scope.bids_list.bids[i].is_new = $scope.bids_list.bids[i].status == "new";
            $scope.bids_list.bids[i].is_accepted = $scope.bids_list.bids[i].status == "accepted";
            switch ($scope.bids_list.bids[i].status) {
                case "new":
                    $scope.bids_list.bids[i].status_display = "Pending";
                    break;
                case "accepted":
                    $scope.bids_list.bids[i].status_display = "Accepted";
                    break;
                case "rejected":
                    $scope.bids_list.bids[i].status_display = "Rejected";
                    break;
            }

            if ($scope.action_pending && 
                $scope.action_type == "highlight" &&
                $scope.bids_list.bids[i].bid_id == $scope.action_bid_id) {
                $scope.bids_list.bids[i].highlight = true;
                $scope.action_pending = false;
            } else {
                $scope.bids_list.bids[i].highlight = false;
            }

            if ($scope.action_pending && 
                $scope.action_type == "message" &&
                $scope.bids_list.bids[i].product.seller_user_id == $scope.action_user_id) {
                $scope.contact($scope.bids_list.bids[i].product.seller_user_id, $scope.bids_list.bids[i].product.seller_nickname);
                $("#modal_message").modal("show");
                $scope.action_pending = false;
            }
        }
    });
}]);