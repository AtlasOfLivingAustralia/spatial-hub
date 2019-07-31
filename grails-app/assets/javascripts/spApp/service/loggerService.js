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

            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'LoggerService';
                httpconfig.method = method;

                return httpconfig;
            };

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
                    history.push({category1: category1, category2: category2, data: data})

                    var params = '?category1=' + encodeURIComponent(category1) +
                        '&category2=' + encodeURIComponent(category2) +
                        '&sessionId=' + encodeURIComponent($SH.sessionId) +
                        '&userId=' + encodeURIComponent($SH.userId);

                    return $http.post($SH.layersServiceUrl + "/log" + params, data, _httpDescription('log', {
                        withCredentials: true,
                        ignoreErrors: true
                    }))
                },

                search: function (groupBy, countBy, sessionId, category1, category2, offset, max) {
                    var params = ''
                    if (groupBy) params += '&groupBy=' + encodeURIComponent(groupBy)
                    if (countBy) params += '&countBy=' + encodeURIComponent(countBy)
                    if (sessionId) params += '&sessionId=' + encodeURIComponent(sessionId)
                    if (category1) params += '&category1=' + encodeURIComponent(category1)
                    if (category2) params += '&category2=' + encodeURIComponent(category2)
                    if (offset) params += '&offset=' + encodeURIComponent(offset)
                    if (max) params += '&max=' + encodeURIComponent(max)

                    return $http.get($SH.layersServiceUrl + "/log/search?" + params, _httpDescription('search', {
                        withCredentials: true,
                        ignoreErrors: true,
                        headers: {Accept: "application/json"}
                    }))
                },

                localHistory: function () {
                    return history
                }
            }
        }])
}(angular));