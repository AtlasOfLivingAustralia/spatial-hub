(function (angular) {
    'use strict';
    angular.module('logger-service', [])
        .factory('LoggerService', ['$http', function ($http) {

            return {
                log: function (category1, category2, data) {
                    var params = '?category1=' + encodeURIComponent(category1) +
                        '&category2=' + encodeURIComponent(category2) +
                        '&sessionId=' + encodeURIComponent(SpatialPortalConfig.sessionId) +
                        '&userId=' + encodeURIComponent(SpatialPortalConfig.userId)

                    return $http.post(SpatialPortalConfig.layersServiceUrl + "/log" + params, data)
                }
            }
        }])
}(angular));