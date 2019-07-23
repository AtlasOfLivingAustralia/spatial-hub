(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name SpeciesAutoCompleteService
     * @description
     *   List species
     */
    angular.module('doi-service', [])
        .factory("DoiService", ["$http", "$rootScope", "UrlParamsService", function ($http, $rootScope, UrlParamsService) {
            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'DoiService';
                httpconfig.method = method;

                return httpconfig;
            };

            return {
                search: function (term) {
                    var url = $SH.proxyUrl+'?url=';
                    var doiUrl = $SH.doiServiceUrl + "/doi/search?max=10&offset=0&sort=dateMinted&order=asc";
                    url += encodeURIComponent(doiUrl);
                    url += "&q="+encodeURIComponent(term);
                    return $http.get(url, _httpDescription('search')).then(function (response) {
                        return response.data;
                        }, function(error) {
                            return error;
                    });
                },
                /**
                 * Returns the workflow id associated with a DOI.
                 * @param doi the selected DOI
                 */
                getWorkflowId: function(doi) {
                    return doi.applicationMetadata.workflowId;
                },
                loadDataset: function(doi) {

                    var url = doi.applicationMetadata && doi.applicationMetadata.searchUrl;
                    if (url) {
                        // Parse the parameters.
                        var params = UrlParamsService.parseSearchParams(url);
                        UrlParamsService.processUrlParams(params);
                    }
                },
                getDatasetQuery: function(doi) {
                    var params = null;
                    var url = doi.applicationMetadata && doi.applicationMetadata.searchUrl;
                    if (url) {
                        // Parse the parameters.
                        params = UrlParamsService.parseSearchParams(url);
                    }
                    return params;
                }
            };
        }])
}(angular));