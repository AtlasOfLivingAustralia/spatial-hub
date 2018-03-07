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
                SessionsService.saveAndLogin(SessionsService.current(),null, null, true);
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
                }, function (response) {
                    //try silent login
                    var html = $('<iframe style="display:none" src="' + $SH.loginUrl +
                        encodeURIComponent(document.URL + "?silent=true") + '"></iframe>').load(function () {
                        //did silent login attempt succeed?
                        $http.post($SH.baseUrl + "/portal/ping?sessionId=" + $SH.sessionId, data).then(function (response) {
                            $timeout(ping, $SH.keepAliveTimeout)
                        }, function (response) {
                               var status = "<div class='alert alert-ala-danger alert-dismissable' id='statusInfo' role='alert'>" +
                                '<div class="col-md-12">' +
                                '<p><strong>Warning!</strong> You lost connection, <a href="#" class="alert-link" ng-click="reconnect()" name = "saveAndLogin">Click</a> to connect again.</p>'
                                '</div>'

                            var js = "<script>$(function(){$('a[name=saveAndLogin]').click( function(){ " +
                                        "angular.element('div[name=divMappedLayers]').scope().reconnect(); " +
                                    "});" +
                                "});</script>"
                            $('div#map').prepend(status);
                            $('div#map').prepend(js);
                        });
                    });
                    $('body').append($(html));
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
