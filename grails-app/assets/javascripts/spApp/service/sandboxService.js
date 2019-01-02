(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name SandboxService
     * @description
     *   List sandbox layers available
     */
    angular.module('sandbox-service', [])
        .factory("SandboxService", ["$http", function ($http) {
            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'SandboxService';
                httpconfig.method = method;

                return httpconfig;
            };

            return {
                /**
                 * List sandbox layers for the current user. User must be logged in.
                 *
                 * @memberof SandboxService
                 * @param {string} userId
                 * @returns {List} list of sandbox uploads
                 *
                 * TODO: collections is unaware of sandbox instances so some validation should occur
                 *
                 * @example:
                 * Output:
                 *  [TODO: example]
                 */
                list: function (userId) {
                    return $http.get($SH.collectionsUrl + "/ws/tempDataResource?alaId=" + userId, _httpDescription('list', {withCredentials: true})).then(function (response) {
                        return response.data;
                    });
                }
            };
        }])
}(angular));