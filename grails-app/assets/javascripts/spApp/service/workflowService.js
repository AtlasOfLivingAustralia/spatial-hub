(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name WorkflowService
     * @description
     *   Access to workflows in spatial-service
     */
    angular.module('workflow-service', [])
        .factory('WorkflowService', ['$http', '$timeout', '$q', function ($http, $timeout, $q) {
            var layers = [];

            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'WorkflowService';
                httpconfig.method = method;

                return httpconfig;
            };

            var thiz = {
                save: function (data) {
                    return $http.post($SH.layersServiceUrl + "/workflow/save", data, _httpDescription("save"))
                },

                search: function (searchTerm, start, limit) {
                    return $http.get($SH.layersServiceUrl + "/workflow/search?q=" + searchTerm + "&start=" + start + "&limit=" + limit, _httpDescription("search"))
                },

                get: function (id) {
                    return $http.get($SH.layersServiceUrl + "/workflow/show/" + id + "?workflow=true", _httpDescription("get"))
                }
            }

            return thiz;
        }])
}(angular));