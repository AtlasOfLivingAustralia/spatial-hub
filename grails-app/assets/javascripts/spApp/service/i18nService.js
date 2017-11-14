(function (angular) {
    'use strict';
    angular.module('i18n-service', [])
        .factory("i18nService", ["$http", "gLang", function ($http, gLang) {
            var map = gLang

            var object = {
                v: function(k) {
                    return map[k.replace(" ", "_")]
                },
                set: function (k, v) {
                    k = k.replace(" ", "_");

                    map[k] = v;
                },
                commit: function (k, v) {
                    k = k.replace(" ", "_");

                    map[k] = v;

                    $http.post($SH.baseUrl + "/portal/i18n?lang=" + $SH.i18n, {key: k, value: v})
                }
            };

            return object;
        }])
}(angular));
