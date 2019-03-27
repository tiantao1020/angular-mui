// 获取cookie
function getCookie(name){
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return 1;
}
var app = angular.module('myApp', []);
app.config( function($httpProvider,$locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
    $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
    $locationProvider.html5Mode(true);
});
app.controller('mainRecord',function ($http,$scope,$window,$location) {
    $scope.userId =1 ;//getCookie("userId")
    $scope.refDet='';
/*************************************************获取当前审批数据***************************************************************/
    // 数据获取
    $scope.mainRecord= function () {
        $http({
            method: 'GET',
            url:'http://192.168.1.251:8033/Eq/Repair/getRepairInfo_?userId='+$scope.userId,
        }).then(function(response) {
            if (response.data.message=="暂无数据"){
                $(".all_null").css('display','block');
            }
            history.pushState("","","?userId="+$scope.userId);//直接获取状态，刷新
            $scope.repairsList = response.data.repairInfo;
            if (response.data.message=="获取成功") {
                $scope.repairsList.forEach(function (e) {
                    if (e.repStateName =="已转单"){
                        e.clazz = 'TraOrder'
                    }else if (e.repStateName =="已完成"){
                        e.clazz = 'ComOrder'
                    }else if (e.repStateName =="已接单"){
                        e.clazz = 'RecOrder'
                    }else if (e.repStateName =="已拒绝"){
                        e.clazz = 'RejOrder'
                    }else if (e.repStateName =="已维修"){
                        e.clazz = 'RepOrder'
                    }else if (e.repStateName =="待接单"){
                        e.clazz = 'WaiOrder'
                    }
                    if (e.urgentName =="紧急"){
                        e.urgent = 'urgent'
                    }else if (e.urgentName =="一般"){
                        e.urgent = 'commonly'
                    }
                })
            }
        }, function(response) {
            // 请求失败执行代码
        });
    };
    // 初始化
    $scope.mainRecord();
/****************************************************维修状态数量************************************************************/
    // 维修状态数量
    $scope.countRepair= function () {
        // 获取当前审批数据
        $http({
            method: 'post',
            url:'http://192.168.1.251:8033/Eq/Repair/countRepair?userId='+$scope.userId,
        }).then(function(response) {
            $scope.countList = response.data.countList;
        }, function(response) {
            // 请求失败执行代码
        });
    };
    // 初始化维修状态数量
    $scope.countRepair();
/**************************************************点击按钮变色同时调用维修状态方法**************************************************************/
    // 点击按钮变色同时调用维修状态方法
    $scope.queState=function (that,numAll,idArr) {
        if (that==''){
            $('.con_span1').html('全<span style="visibility: hidden">猜</span>部');
            $('.con_span2').html(numAll.countTotal);
        }else if (that==1){
            $('.con_span1').html('待接单');
            $('.con_span2').html(numAll.submitTotal);
        }else if (that==2){
            $('.con_span1').html('已接单');
            $('.con_span2').html(numAll.catchTotal);
        }else if (that==4){
            $('.con_span1').html('待确定');
            $('.con_span2').html(numAll.sureTotal);
        }else if (that==7){
            $('.con_span1').html('已转单');
            $('.con_span2').html(numAll.turnTotal);
        }else if (that==5){
            $('.con_span1').html('已完成');
            $('.con_span2').html(numAll.fulfilTotal);
        }else if (that==3){
            $('.con_span1').html('已拒绝');
            $('.con_span2').html(numAll.refuseTotal);
        }
        // 点击状态改变颜色
        $(idArr).addClass('con_seion').siblings().removeClass('con_seion');
        $('.con_ul').hide();
        $http({
            method: 'GET',
            url:'http://192.168.1.251:8033/Eq/Repair/getRepairInfo_?userId='+$scope.userId+'&state='+that,
        }).then(function(response) {
            $scope.repairsList = response.data.repairInfo;
            if (response.data.message=="获取成功") {
                $(".all_null").css('display','none');
                $scope.repairsList.forEach(function (e) {
                    if (e.repStateName =="已转单"){
                        e.clazz = 'TraOrder'
                    }else if (e.repStateName =="已完成"){
                        e.clazz = 'ComOrder'
                    }else if (e.repStateName =="已接单"){
                        e.clazz = 'RecOrder'
                    }else if (e.repStateName =="已拒绝"){
                        e.clazz = 'RejOrder'
                    }else if (e.repStateName =="已维修"){
                        e.clazz = 'RepOrder'
                    }else if (e.repStateName =="待接单"){
                        e.clazz = 'WaiOrder'
                    }
                })
            }else{
                $(".all_null").css('display','block');
            }
        }, function(response) {
            // 请求失败执行代码
        });
    };
/****************************************************模糊搜索事件************************************************************/
    // 模糊搜索事件
    $scope.myQuery = function() {
        var input, filter, ul, li, a, i;
        input = document.getElementById('myInput');
        filter = input.value.toUpperCase();
        ul = document.getElementById("mainRec");
        li = ul.getElementsByTagName('li');
        // 循环所有列表，查找匹配项
        for (i = 0; i < li.length; i++) {
            a = li[i].getElementsByTagName("a")[0];
            if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
                $(".all_null").css('display','none');
            } else if ($('.mainRec_li:visible').length <1){
                li[i].style.display = "none";
                $(".all_null").css('display','block');
            }else{
                li[i].style.display = "none";
            }
        }
    };
/****************************************************************************************************************/
    // 点击拒绝弹出拒绝内容
    $scope.delBtn=function () {
        $('.mui_ipt_row').css('z-index','0');
        $http({
            method: 'GET',
            url:'http://192.168.1.251:8033/Eq/Select/selectSlkDictByLable?lable=refuses',
        }).then(function(response) {
            $scope.listUl = response.data.list;
        }, function(response) {
            // 请求失败执行代码
        });
    };
    // 初始化
    $scope.delBtn();

    // 点击转单弹出转单内容
    $scope.chaOrd=function () {
        $('.mui_ipt_row').css('z-index','0');
        $http({
            method: 'GET',
            url:'http://192.168.1.251:8033/Eq/Repair/getUserList',
        }).then(function(response) {
            $scope.userList = response.data.userList;
        }, function(response) {
            // 请求失败执行代码
        });
    };
    // 初始化
    $scope.chaOrd();

    // 点击除电话外其他内容跳转页面
    $scope.viDet=function (all) {
        window.location.href = './overRecipt.html?fid='+all.fid;
    };

    // 点击查看评价跳转页面
    $scope.viewEva=function (all) {
        window.location.href = './overRecipt.html?fid='+all.fid;
    };

    // 点击完成维修跳转页面
    $scope.repair=function (all) {
        window.location.href = './receipt.html?fid='+all.fid;
    };

    // 点击input修改部分样式
    $scope.iptSty=function () {
        $('.con_ul').hide();
        $('.mui-content').css({'position':'fixed','top':'0px','z-index':'99999'});
        $('.mainRec_ul').css('margin','6.55rem 0px 2rem 0px');
        $('.mui_bar_nav').css('z-index','999999')
    };

    // 点击选择维修状态
    $scope.con_a=function () {
        $('.con_ul').toggle();
        $(".mainRec_ul").css("overflow","hideen");
        $('.cont_ipt').val("");
    };

    // 点击拨打电话
    $scope.callphone=function (all) {
        // $scope.viDet(return);
        cancelBubble();
        window.location.href = "tel:"+all.phone;
    };

    //阻止外层onclick事件
    function cancelBubble(e) {
        var evt = e ? e : window.event;
        if(evt.stopPropagation) { //W3C 
            evt.stopPropagation();
        } else { //IE      
            evt.cancelBubble = true;
        }
    }

    // 点击拒绝弹出拒绝内容
    $scope.refuses=function (all,state) {
        $scope.refDet=all;
        if (state==1){
            $('.ref_a').html('请选择拒绝理由');
            $('.showExp').show();
            $('.showNam').hide();
        }else if (state==2){
            $('.ref_a').html('请选择转单接收人');
            $('.showNam').show();
            $('.showExp').hide();
        }
        // 清空备注信息以及所选拒绝理由
        mui("#screen").popover('show');
        $('.mui_ipt_row').css('z-index','100');
    };

    // 拒绝中点击返回事件
    $scope.backBtn=function () {
        // 清空备注信息以及所选拒绝理由
        $('.mui_ipt_row').css('z-index','99999');
        mui("#screen").popover('hide');
    };

    // 接单提交
    $scope.receipt=function (all,state) {
        $http({
            method: 'post',
            dataType : 'json',
            params: {
                userId:$scope.userId,//当前登陆人fid
                fid:all.fid, /* 报修单fid */
                repair_code:all.repair_code, /*保修单号*/
                equipment_id:all.equipment_id,  /* 报修设备fid */
                phone:all.phone,/* 联系电话 */
                state:state/* 2-已接单（接单按钮） 3-已拒绝（拒绝按钮） 5-已完成(必须评价才可以确认完成，确认完成按钮)  6-已取消（取消按钮） 7-已转单（转单按钮） */
            },
            contentType:"application/json",
            url:'http://192.168.1.251:8033/Eq/Repair/updateRepairStateApp',
        }).then(function(response) {
            $('.mui_ipt_row').css('z-index','400');
            var btnArray = ['确认'];
            if(response.data){
                mui.confirm(response.data.message, '提示', btnArray, function() {
                    $scope.mainRecord();
                });
            }
        });
    };

    // 选中拒绝radio
    $scope.refusesIds=function(alls) {
        $scope.refusesId=alls.id;
    };

    // 点击拒绝中提交事件
    $scope.subReceipt=function () {
        var all = $scope.refDet;
        $http({
            method: 'post',
            dataType : 'json',
            params: {
                userId:$scope.userId,//当前登陆人fid
                fid:all.fid, /* 报修单fid */
                repair_code:all.repair_code, /*保修单号*/
                equipment_id:all.equipment_id,  /* 报修设备fid */
                phone:all.phone,/* 联系电话 */
                state:3,/* 2-已接单（接单按钮） 3-已拒绝（拒绝按钮） 5-已完成(必须评价才可以确认完成，确认完成按钮)  6-已取消（取消按钮） 7-已转单（转单按钮） */
                refuses:$scope.refusesId,/*拒绝理由*/
                refuse:$scope.refuse,/*拒绝备注*/
            },
            contentType:"application/json",
            url:'http://192.168.1.251:8033/Eq/Repair/updateRepairStateApp',
        }).then(function(response) {
            $('.mui_ipt_row').css('z-index','400');
            mui("#screen").popover('hide');
            var btnArray = ['确认'];
            if(response.data){
                mui.confirm(response.data.message, '提示', btnArray, function() {
                    $scope.mainRecord();
                });
            }
        });
    };

    // 选中转单radio
    $scope.transferId=function(alls) {
        $scope.transfer_id=alls.id;
    };

    // 点击转单中提交事件
    $scope.subReceipt=function () {
        var all = $scope.refDet;
        $http({
            method: 'post',
            dataType : 'json',
            params: {
                userId:$scope.userId,//当前登陆人fid
                fid:all.fid, /* 报修单fid */
                repair_code:all.repair_code, /*保修单号*/
                equipment_id:all.equipment_id,  /* 报修设备fid */
                phone:all.phone,/* 联系电话 */
                state:7,/* 2-已接单（接单按钮） 3-已拒绝（拒绝按钮） 5-已完成(必须评价才可以确认完成，确认完成按钮)  6-已取消（取消按钮） 7-已转单（转单按钮） */
                transfer_id:$scope.transfer_id,/*转单人*/
                transfers:$scope.transfers,/*转单理由*/
            },
            contentType:"application/json",
            url:'http://192.168.1.251:8033/Eq/Repair/updateRepairStateApp',
        }).then(function(response) {
            $('.mui_ipt_row').css('z-index','400');
            mui("#screen").popover('hide');
            var btnArray = ['确认'];
            if(response.data){
                mui.confirm(response.data.message, '提示', btnArray, function() {
                    $scope.mainRecord();
                });
            }
        });
    }

});

