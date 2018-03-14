(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name KeepAliveService
     * @description
     *   Service to maintain user login and copy session state to the server.
     *
     *   Should it fail to keep a user logged in it will prompt the user to save the session on the server and login
     *   again or continue without logging in again.
     */
    angular.module('keep-alive-service', [])
        .factory("KeepAliveService", ["SessionsService", '$http', '$timeout', function (SessionsService, $http, $timeout) {
            var status = '{}';
            var started = false;

            var reconnect = function(){
                return SessionsService.saveAndLogin(SessionsService.current(),null, null, true);
            }

            var ping = function () {
                var json = JSON.stringify(SessionsService.current());

                var data;
                if (status !== json) {
                    status = json;
                    data = json;
                }
                //check for ala-login timeout
                $http.post($SH.baseUrl + "/portal/ping?sessionId=" + $SH.sessionId, data).then(function (response) {
                    $timeout(ping, $SH.keepAliveTimeout)
                }, function (error) {
                    //try silent login
                    // var test = $('<iframe src="http://google.om" id="test">')
                    // $('body').prepend(test)
                    // document.getElementsById('test').onload=function(){
                    //     alert('I am fired')
                    // }
                    //possbile the server is not accessible
                    if(error.status ==-1){

                        var status = "<div class='alert alert-ala-danger alert-dismissable' id='statusInfo' role='alert'>" +
                            '<p><strong>Warning!</strong> You lost connection to the server, reconnecting.....</p>'
                        '</div>'

                        var js = "<script>$(function(){" +
                            "function reconnect(){" +
                            "var succeed = angular.element('div[name=divMappedLayers]').scope().reconnect(); " +
                            "if (!succeed) {" +
                            "var countDownDate = new Date().getTime();" +
                            "var x = setInterval(function() { " +
                            "var now = new Date().getTime();" +
                            "var distance = now - countDownDate;"+
                            "var remaining = 30 - Math.floor((distance % (1000 * 60)) / 1000);"+
                            "$('div#statusInfo > p').html('<strong>Connecting failed!</strong>  Try again in <strong>'+ remaining + '</strong> seconds');" +
                            "if (remaining <=0) {" +
                            "$('div#statusInfo > p').html('Connecting ...');" +
                            "clearInterval(x); " +
                            "reconnect()}; }, 1000)" +
                            "} "+
                            "}" +

                            "$('a[name=saveAndLogin]').click( function(){ " +
                            "reconnect()" +
                            "});" +
                            "reconnect()}); </script>"
                        $('div#map').prepend(status);
                        $('div#map').prepend(js);
                    }else{
                        //The load function of iframe will not be fired on Firefox, if it src url is not accessible
                        var html = $('<iframe style="display:none" src="' + $SH.loginUrl +
                            encodeURIComponent(document.URL + "?silent=true") + '"></iframe>').load(function () {
                            //did silent login attempt succeed?
                            $http.post($SH.baseUrl + "/portal/ping?sessionId=" + $SH.sessionId, data).then(function (response) {
                                $timeout(ping, $SH.keepAliveTimeout)
                            }, function (response) {
                                var status = "<div class='alert alert-ala-danger alert-dismissable' id='statusInfo' role='alert'>" +
                                    '<p><strong>Warning!</strong> You lost authentication, <a href="#" class="alert-link" ng-click="reconnect()" name = "saveAndLogin">Click</a> to save and login again.</p>'
                                '</div>'

                                var js = "<script>$(function(){" +
                                    "function reconnect(){" +
                                    "var succeed = angular.element('div[name=divMappedLayers]').scope().reconnect(); " +
                                    "if (!succeed) {" +
                                    "var countDownDate = new Date().getTime();" +
                                    "var x = setInterval(function() { " +
                                    "var now = new Date().getTime();" +
                                    "var distance = now - countDownDate;"+
                                    "var remaining = 10 - Math.floor((distance % (1000 * 60)) / 1000);"+
                                    "$('div#statusInfo > p').html('<strong>Reconnecting failed!</strong>  Try again in <strong>'+ remaining + '</strong> seconds');" +
                                    "if (remaining <=0) {" +
                                    "$('div#statusInfo > p').html('Connecting ...');" +
                                    "clearInterval(x); " +
                                    "reconnect()}; }, 1000)" +
                                    "} "+
                                    "}" +

                                    "$('a[name=saveAndLogin]').click( function(){ " +
                                    "reconnect()" +
                                    "});" +
                                    "});</script>"
                                $('div#map').prepend(status);
                                $('div#map').prepend(js);
                            });
                        });
                        $('body').append($(html));
                    }
                })
            };

            return {
                /**
                 * starts this service
                 */
                start: function () {
                    if (!started) {
                        started = true;

                        ping();
                    }
                },

                reconnect: function(){
                    reconnect();
                }
            };
        }])
}(angular));
