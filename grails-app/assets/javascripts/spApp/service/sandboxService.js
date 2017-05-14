(function (angular) {
    'use strict';
    angular.module('sandbox-service', [])
        .factory("SandboxService", ["$http", function ($http) {
            return {
                list: function (userId) {
                    return $http.get($SH.collectionsUrl + "/ws/tempDataResource?alaId=" + userId, {withCredentials: true}).then(function (response) {
                        return response.data;
                    });
                }
            };
        }])
}(angular));