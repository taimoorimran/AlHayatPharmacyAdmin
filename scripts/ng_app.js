angular.module('myModule', [])
.filter("trustUrl", ['$sce', function ($sce) {
    return function (recordingUrl) {
        return $sce.trustAsResourceUrl(recordingUrl);
    };
}])
.filter('moment', [
    function () {
        return function (date, method) {
            var momented = moment(date);
            return momented[method].apply(momented, Array.prototype.slice.call(arguments, 2));
        };
    }
    ])
.controller('myController', function ($scope, $http, $q, $sce, $timeout) {
    var db = firebase.firestore();
    $scope.orders = [];
    $scope.animation_div = true;
    $scope.login_ = { email: null, password: null, ip: null };
    $scope.$on('toggle_animation', function (event, data) {
        $scope.animation_div = data;
    });
    db.collection("orders")
    .onSnapshot(function(querySnapshot) {
        let data_ = [];
        querySnapshot.forEach(function(doc) {
            data_.push(doc.data());
        });
        console.log(data_);
        $scope.$apply(function () {
            $scope.orders = data_;
        });
    });
    $scope.bindOrderDetail = function (order_detail) {
        console.log(order_detail);
        let order_items = [];
        if(order_detail.prescription_type == 2){
            angular.forEach(JSON.parse(order_detail.order_items), function(value, key){
                order_items.push(value);    
            });
            order_items = order_items;
            console.log(order_items);
        }
        order_detail.order_items = order_items;
        $scope.order_detail      = order_detail;
    };
    $scope.emptyOrderDetails = function () {
        $scope.order_detail = null;
    };
    $scope.getUsers = function () {
    }
    $scope.getSurveys = function () {

    }
    $scope.setupPage = function () {
        $scope.UserData = [];
        $scope.SurveyData = [];
        $scope.ProcessedUsers = [];
        $scope.getUsers();
        $scope.getSurveys();
    }
    $scope.getItemIcon = function (itemType) {
        if (itemType == 'TV') return 'icon-screen-desktop';
        else if (itemType == 'Mobile') return 'icon-screen-smartphone';
        else if (itemType == 'Magzine') return 'icon-book-open';
        else if (itemType == 'Newspaper') return 'icon-book-open';
        else return 'icon-home';

    };
    $scope.checkImage = function (url) {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        return http.status != 404;
    }
    $scope.login = function () {
        if ($scope.login_.email != 'admin@markematics.net') {
            alert('Wrong Username!');
            return;
        }
        if ($scope.login_.password != '123456789') {
            alert('Wrong Password!');
            return;
        }
        $scope.showAnimation();
        $scope.isLoggedIn = true;
        $scope.goBack();
    }
    $scope.logout = function () {
        $scope.isLoggedIn = false;
        $scope.animationShowed = false;
    }
    $scope.showAnimation = function () {
        $timeout(function () {
            $scope.animationShowed = true;
        }, 6000);
    }
});