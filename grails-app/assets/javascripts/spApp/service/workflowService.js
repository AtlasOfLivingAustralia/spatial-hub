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
                httpconfig.withCredentials = true;
                httpconfig.ignoreErrors = true;
                httpconfig.service = 'WorkflowService';
                httpconfig.method = method;

                return httpconfig;
            };

            var thiz = {
                /**
                 *
                 * @param name
                 * @param isPublic
                 * @param data
                 * @param mintDoi make the saved workflow readonly
                 * @returns {HttpPromise}
                 */
                save: function (name, isPublic, data, mintDoi) {
                    if (mintDoi === undefined) mintDoi = false;
                    return $http.post($SH.baseUrl + "/workflow/save", {
                        description: name,
                        isPublic: isPublic,
                        metadata: data,
                        doi: mintDoi
                    }, _httpDescription("save"))
                },

                search: function (searchTerm, start, limit) {
                    return $http.get($SH.baseUrl + "/workflow/search?q=" + searchTerm + "&start=" + start + "&limit=" + limit, _httpDescription("search"))
                },

                get: function (id) {
                    return $http.get($SH.baseUrl + "/workflow/show/" + id + "?workflow=true", _httpDescription("get"))
                },

                delete: function (id) {
                    return $http.get($SH.baseUrl + "/workflow/delete/" + id, _httpDescription("delete"))
                },

                cleanup: function (workflow) {
                    // cleanup unnecessary workflow items
                    $.map(workflow, function (i) {
                        if (i.raw) delete i.raw
                        if ($.isArray(i.data.data)) {
                            $.map(i.data.data, function (subv) {
                                if (subv.raw) delete subv.raw
                                if (subv.enabled) delete subv.enabled
                            })
                        }
                    })
                },

                // all text fields are mandatory
                isValid: function (workflowProperties) {
                    if (!workflowProperties.name) return false;

                    var valid = true;
                    $.map(workflowProperties.workflow, function (i) {
                        if (i.description === undefined || i.description.trim().length == 0) valid = false
                        if ($.isArray(i.data.data)) {
                            $.map(i.data.data, function (subv) {
                                if (subv.description === undefined || subv.description.trim().length == 0) valid = false
                            })
                        }
                    })

                    return valid;
                },

                initDescriptions: function (workflow) {
                    $.map(workflow, function (v) {
                        if (typeof (v.data) == 'string') {
                            v.data = JSON.parse(v.data)
                        }

                        v.raw = JSON.stringify(v.data)

                        if ($.isArray(v.data.data)) {
                            $.map(v.data.data, function (subv) {
                                subv.raw = JSON.stringify(subv.facet)
                                subv.enabled = true
                            })
                        }
                    })
                }
            }

            return thiz;
        }])
}(angular));
