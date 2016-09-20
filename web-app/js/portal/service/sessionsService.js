(function (angular) {
    'use strict';
    angular.module('sessions-service', [])
        .factory('SessionsService', ['$http', function ($http) {

            return {
                list: function () {
                    return $http.get("portal/listSaves").then(function (response) {
                        return response.data
                    });
                },
                save: function (data) {
                    return $http.post("portal/saveData?sessionId=" + SpatialPortalConfig.sessionId, data).then(function (response) {
                        console.log(response.data)
                        alert(response.data.url)
                    });
                },
                get: function (sessionId) {
                    return $http.get("portal/getSaved?sessionId=" + sessionId).then(function (response) {
                        console.log(response.data)
                        return response.data
                    });
                }
            }
        }])
}(angular));