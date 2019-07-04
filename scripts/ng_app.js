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
    $scope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if(phase == '$apply' || phase == '$digest') {
        if(fn && (typeof(fn) === 'function')) {
          fn();
      }
  } else {
    this.$apply(fn);
}
};
var db                   = firebase.firestore();
$scope.orders            = [];
$scope.order_detail      = {docID: null}
$scope.isLoading         = false;
$scope.isLoading_modal   = false;
$scope.isOrderStatusEdit = false;
$scope.count             = {
    total_orders   : 0,
    delivery_orders: 0,
    walkin_orders  : 0,
    total_customers: 0
}
$scope.animation_div = true;
$scope.login_        = { email: null, password: null, ip: null };
$scope.$on('toggle_animation', function (event, data) {
    $scope.animation_div = data;
});
db.collection("orders")
.onSnapshot(function(querySnapshot) {
    let data_ = [];
    let count = {
        total_orders   : 0,
        delivery_orders: 0,
        walkin_orders  : 0,
        total_customers: 0

    }
    querySnapshot.forEach(function(doc) {
        let temp = doc.data();
        if(temp.delivery_option      == 0) count.delivery_orders++;
        else if(temp.delivery_option == 1) count.walkin_orders++;
        count.total_orders++;
        temp.docID = doc.id;
        if(temp.docID == $scope.order_detail.docID) $scope.order_detail.order_status = temp.order_status;
        data_.push(temp);
    });
    $scope.$apply(function () {
        count.total_customers = _.uniqBy(data_, 'userID').length;
        $scope.count          = count;
        $scope.orders         = data_;
    });
});
$scope.bindOrderDetail = async function (order_detail) {
    $scope.isLoading_modal = true;
    console.log(order_detail);
    let order_items = [];
    if(order_detail.prescription_type == 1){
        let images = [];
        if(order_detail.prescription_path_one != null){
            await firebase.storage().ref().child(order_detail.prescription_path_one).getDownloadURL()
            .then(function(url){
                $scope.$apply(function() {
                    order_items.push(url);
                });
            })
            .catch(function(error){
                switch (error.code) {
                    case 'storage/object-not-found':
                    console.error("File doesn't exist");
                    break;
                    case 'storage/unauthorized':
                    console.error("User doesn't have permission to access the object");
                    break;
                    case 'storage/canceled':
                    console.error("User canceled the upload");
                    break;
                    case 'storage/unknown':
                    console.error("Unknown error occurred, inspect the server response");
                    break;
                }
            })
        }
        if(order_detail.prescription_path_two != null){
            await firebase.storage().ref().child(order_detail.prescription_path_two).getDownloadURL()
            .then(function(url){
                $scope.$apply(function() {
                    order_items.push(url);
                });
            })
            .catch(function(error){
                switch (error.code) {
                    case 'storage/object-not-found':
                    console.error("File doesn't exist");
                    break;
                    case 'storage/unauthorized':
                    console.error("User doesn't have permission to access the object");
                    break;
                    case 'storage/canceled':
                    console.error("User canceled the upload");
                    break;
                    case 'storage/unknown':
                    console.error("Unknown error occurred, inspect the server response");
                    break;
                }
            })
        }
        order_detail.order_items = images;
    }
    else if(order_detail.prescription_type == 2){
        if(typeof order_detail.order_items != 'object') order_detail.order_items = JSON.parse(order_detail.order_items);
        angular.forEach(order_detail.order_items, function(value, key){
            order_items.push(value);    
        });
        order_items = order_items;
    }
    order_detail.order_items = order_items;
    $scope.safeApply(function () {
        $scope.isLoading_modal = false;
        $scope.order_detail = order_detail;
    });        
};
$scope.emptyOrderDetails = function () {
    $scope.order_detail = {docID : null};
};

$scope.changeOrderStatus_open = function(item = null){
    if(item == null) return;
    console.log(item);
    $scope.isOrderStatusEdit = true;
}
$scope.changeOrderStatus_close = function(item = null){
    $scope.isOrderStatusEdit = false;
}
$scope.changeOrderStatus = function(status, order_detail){
    if(status == null) return;
    if(confirm("Are you sure to change status?")){
        console.log(status);
        console.log(order_detail);
        db.collection("orders").doc(order_detail.docID).update({
            order_status    : status,
            action_timestamp: moment().format('YYYY-MM-DD hh:mm:ss')
        }).then(function(){
            console.log('updated!');
        }).catch(function(error){
            console.log(error);
        }).finally(function(){
            $scope.order_detail.order_status = status;
        });
    }
    $scope.changeOrderStatus_close();
}
$scope.setupPage = function () {

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