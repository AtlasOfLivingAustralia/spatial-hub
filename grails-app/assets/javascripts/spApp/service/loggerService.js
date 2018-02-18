(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name LoggerService
     * @description
     *   Logger for client side tools
     */
    angular.module('logger-service', [])
        .factory('LoggerService', ['$http', function ($http) {

            //TODO: current session history for retrieval of client side tool outputs (stored) and spatial-service outputs
            var history = [];

            return {
                /**
                 * Log event for this user. e.g. client side tool usage
                 *
                 * @memberof LoggerService
                 * @param {string} category1 top level event category
                 * @param {string} category2 detail level event category
                 * @param {map} data data to log
                 * @returns {Promise}
                 */
                log: function (category1, category2, data) {
                    var params = '?category1=' + encodeURIComponent(category1) +
                        '&category2=' + encodeURIComponent(category2) +
                        '&sessionId=' + encodeURIComponent($SH.sessionId) +
                        '&userId=' + encodeURIComponent($SH.userId);

                    return $http.post($SH.layersServiceUrl + "/log" + params, data)
                }
            }
        }])
}(angular));