(function (angular) {
    'use strict';
    angular.module('keep-alive-service', [])
        .factory("KeepAliveService", ["SessionsService", '$http', '$timeout', function (SessionsService, $http, $timeout) {
            var status = '{}';
            var started = false;

            var ping = function () {
                var json = JSON.stringify(SessionsService.current());

                var data;
                if (status !== json) {
                    status = json;
                    data = json;
                }

                //check for ala-login timeout
                $http.post("portal/ping?sessionId=" + $SH.sessionId, data).then(function (response) {
                    $timeout(ping, $SH.keepAliveTimeout)
                }, function (response) {
                    //try silent login
                    var html = $('<iframe style="display:none" src="' + $SH.loginUrl +
                        encodeURIComponent(document.URL + "?silent=true") + '"></iframe>').load(function () {
                        //did silent login attempt succeed?
                        $http.post("portal/ping?sessionId=" + $SH.sessionId, data).then(function (response) {
                            $timeout(ping, $SH.keepAliveTimeout)
                        }, function (response) {
                            bootbox.confirm($i18n("A problem was detected. Click OK to retry or Cancel to ignore."),
                                function (result) {
                                    if (result) {
                                        SessionsService.saveAndLogin(SessionsService.current());
                                    }
                                }
                            );
                        });
                    });
                    $('body').append($(html));
                })
            };

            return {
                start: function () {
                    if (!started) {
                        started = true;

                        ping();
                    }
                }
            };
        }])
}(angular));
