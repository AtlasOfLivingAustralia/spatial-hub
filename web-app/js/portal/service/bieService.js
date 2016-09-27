(function (angular) {
    'use strict';
    angular.module('bie-service', [])
        .factory("BieService", ["$http", function ($http) {
            return {
                classification: function (lsid) {
                    return $http.get(SpatialPortalConfig.bieUrl + "/ws/classification/" + lsid).then(function (response) {
                        var list = response.data
                        for (var i in list) {
                            list[i].url = SpatialPortalConfig.bieUrl + '/species/' + list[i].guid
                        }
                        return list
                    });
                }
            };
        }])
}(angular));
