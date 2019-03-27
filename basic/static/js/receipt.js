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
app.controller('recipt',function ($http,$scope,$window,$location,Upload) {
    $scope.fid = $location.search().fid;
    $scope.userId = getCookie("userId");
    /*************************************************获取当前审批数据***************************************************************/
    // 数据获取
    $scope.recipt= function () {
        // 获取当前审批数据
        $http({
            method: 'GET',
            url:'http://192.168.1.251:8033/Eq/Repair/getRepairInfo_',
            params:{
                userId:$scope.userId,
                fid:$scope.fid
            }
        }).then(function(response) {
            $scope.repairsList = response.data.repairInfo;
            $scope.repairsList[0].files = [];
        }, function(response) {
            // 请求失败执行代码
        });
    };

    // 获取维修类型
    $scope.service= function () {
        // 获取当前审批数据
        $http({
            method: 'GET',
            url:'http://192.168.1.251:8033/Eq/Select/selectSlkDictByLable?lable=repairtype',
        }).then(function(response) {
            $scope.services = response.data.list;
        }, function(response) {
            // 请求失败执行代码
        });
    };

    $scope.service();
    // 点击拨打电话
    $scope.callphone=function (all) {
        window.location.href = "tel:"+all.phone;
    };
    // 初始化
    $scope.recipt();
    /**************************** 抽取mui方法 start************************************/
    $scope.muiConfirm=function (msg,callback) {
        var btnArray = ['确认', '取消'];
        mui.confirm(msg, '温馨提示', btnArray,function(e){
            if(typeof callback === "function"){
                if(e.index==0){
                    callback();
                }
            }
        });
    };
    $scope.muiAlert=function (msg,callback) {
        var btnArray = ['确认'];
        mui.confirm(msg, '温馨提示', btnArray, function(){
            if(typeof callback === "function"){
                callback();
            }
        });
    };
    /**************************** 抽取mui方法 end************************************/

    /**************************** 上传图片 start************************************/
    $scope.upFiles=function ($files,all) {
        all.files=all.files.concat($files);
    };
    async function uploadFiles(i,allFile,length,all) {
        await Upload.upload({
            url:'http://192.168.1.251:8033/Eq/Repair/upload',
            data: {file: allFile.files},
            arrayKey: ''
        }).then(function (resp) {
            var result = resp.data;
            if(result.flag){
                allFile.printimg=result.fileurl;
                allFile.files=[];
            }else {
                console.log("没上传图片");
            }
            if(i==length){
                $scope.overSerOne(all);
            }
        });
    }
    /**************************** 上传图片 end************************************/
    /**************************** 删除图片 start************************************/
    $scope.deleteFile=function(all,index){
        $scope.muiConfirm("是否确认删除？",function () {
            $scope.$apply(all.files.splice(index,1));
        });
    };
    /**************************** 删除图片 end************************************/
    /**************************** 确认 start************************************/
    $scope.overSer =function (all) {
        $('.mui-loading').show();
        $scope.muiConfirm("是否确认提交？",async function () {
            var allList = $scope.repairsList;
            var length = allList.length-1;
            for(var i in allList){
                await uploadFiles(i,allList[i],length,all)
            }
        });
    };

    // 展示图片 本地
    $scope.img_shows=function(that) {
        $scope.picfile=that;
        $("#imgModel").modal("show");
        return false;
    };
    /**************************** 确认 end************************************/
    // 选中维修类型radio
    $scope.refusesId='';
    $scope.mainType=function(all) {
        $scope.refusesId=all.id;
    };
    // 点击完成维修提交
   $scope.overSerOne=function (all) {
       all.repairtype=$scope.refusesId;
       $http({
           method: 'post',
           dataType : 'json',
           params: {
               userId:$scope.userId,//当前登陆人fid
               fid:all.fid, /* 报修单fid */
               repair_code:all.repair_code, /*保修单号*/
               equipment_id:all.equipment_id,  /* 报修设备fid */
               repairtype:all.repairtype,//维修类型
               printimg:all.printimg,//上传图片
               state:4,/* 2-已接单（接单按钮） 3-已拒绝（拒绝按钮） 5-已完成(必须评价才可以确认完成，确认完成按钮)  6-已取消（取消按钮） 7-已转单（转单按钮） */
               problem:all.problem,//故障问题说明
               cost:all.cost,//费用
               othercost:all.othercost,//其他费用
               explains:all.explains,//维修说明
           },
           contentType:"application/json",
           url:'http://192.168.1.251:8033/Eq/Repair/modifyCompleteRepair',
       }).then(function(response) {
           var btnArray = ['确认'];
           if(response.data){
               mui.confirm(response.data.message, '提示', btnArray, function() {
                   window.location.href = '../Hardware/mainRecord.html';
               });
           }
       });
   }


});