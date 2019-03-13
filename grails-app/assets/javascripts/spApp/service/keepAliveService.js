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

            var reconnectMessage = function () {
                $('#reconnect-message').show()
            };

            var loginAgainMessage = function () {
                $('#login-again-message').show()
            };

            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'KeepAliveService';
                httpconfig.method = method;

                return httpconfig;
            };

            var ping = function () {
                var json = {}; //JSON.stringify(SessionsService.current());

                var data;
                if (status !== json) {
                    status = json;
                    data = json;
                }

                //check for ala-login timeout
                $http.post($SH.baseUrl + "/portal/ping?sessionId=" + $SH.sessionId, data, _httpDescription('ping', {ignoreErrors: true})).then(function (response) {
                    $timeout(ping, $SH.keepAliveTimeout)
                }, function (response) {
                    //try silent login
                    //Server is not accessible
                    if (response.status == -1) {
                        reconnectMessage();
                    } else {
                        //The load function of iframe will not be fired on Firefox, if it src url is not accessible
                        var html = $('<iframe style="display:none" src="' + $SH.loginUrl +
                            encodeURIComponent(document.URL + "?silent=true") + '"></iframe>').load(function () {
                            //did silent login attempt succeed?
                            $http.post($SH.baseUrl + "/portal/ping?sessionId=" + $SH.sessionId, data, _httpDescription('ping', {ignoreErrors: true})).then(function (response) {
                                $timeout(ping, $SH.keepAliveTimeout)
                            }, function (response) {
                                loginAgainMessage();
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

                reconnect: function () {
                    reconnect();
                }
            };
        }])
}(angular));
