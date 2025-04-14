(function (angular) {
    'use strict';
    /**
     * @deprecated
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
                 */
                list: function (userId) {
                    var urlProxy = $SH.baseUrl + "/collection/list?alaId=" + userId
                    return $http.get(urlProxy, _httpDescription('list', {})).then(function (response) {
                        return response.data;
                    });
                }
            };
        }])
}(angular));
