(function (angular) {
    'use strict';
    angular.module('logger-service', [])
        .factory('LoggerService', ['$http', function ($http) {

            var history = [];

            return {
                log: function (category1, category2, data) {
                    var params = '?category1=' + encodeURIComponent(category1) +
                        '&category2=' + encodeURIComponent(category2) +
                        '&sessionId=' + encodeURIComponent($SH.sessionId) +
                        '&userId=' + encodeURIComponent($SH.userId);

                    return $http.post($SH.layersServiceUrl + "/log" + params, data)
                },
                list: function (category1) {
                    return $http.post($SH.layersServiceUrl + "/categoryDetail/" + category1)
                }
            }
        }])
}(angular));