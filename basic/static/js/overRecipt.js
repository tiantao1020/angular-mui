// 获取cookie
function getCookie(name){
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return 1;
}
var app = angular.module('myApp', ['ngFileUpload']);
app.config( function($httpProvider,$locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
    $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
    $locationProvider.html5Mode(true);
});
app.controller('overRecipt',function ($http,$scope,$window,$location) {
    $scope.fid = $location.search().fid;
    $scope.userId = getCookie("userId");
/*************************************************获取当前审批数据***************************************************************/
    // 数据获取
    $scope.mainRecord= function () {
        // 获取当前审批数据
        $http({
            method: 'GET',
            url:'http://192.168.1.251:8033/Repairs/getRepairAll_',
            params:{
                userId:$scope.userId,
                fid:$scope.fid
            }
        }).then(function(response) {
            $scope.repairsList = response.data.repairs;
            // 显示星星评价
            $scope.repairsList.forEach(function (e) {
                e.arr = new Array(e.grades);
            })
        }, function(response) {
            // 请求失败执行代码
        });
    };
    // 初始化
    $scope.mainRecord();
    // 阿里云图片展示
    // 展示图片 本地
    $scope.seeImg=function(that) {
        $scope.picfile=that;
        $("#imgModel").modal("show");
        return false;
    };
});