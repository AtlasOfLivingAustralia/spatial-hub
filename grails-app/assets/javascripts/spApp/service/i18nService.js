(function (angular) {
    'use strict';
    angular.module('i18n-service', [])
        .factory("i18nService", ["$http", "gMessages", function ($http, gMessages) {
            var map = gMessages;

            var object = {
                map: map,
                v: function(k) {
                    var key = ("" + k).replace(" ", "_");
                    if (map[key] !== undefined) {
                        return map[key]
                    } else {
                        return k
                    }
                },
                set: function (k, v) {
                    k = ('' + k).replace(" ", "_");

                    map[k] = v;
                },
                commit: function (k, v) {
                    k = ('' + k).replace(" ", "_");

                    map[k] = v;

                    $http.post($SH.baseUrl + "/portal/i18n?lang=" + $SH.i18n, {key: k, value: v})
                }
            };

            return object;
        }])
}(angular));
