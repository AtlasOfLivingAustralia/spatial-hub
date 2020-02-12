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

            var config = {
                doiServiceUrl:$SH.doiServiceUrl,
                doiSearchFilter:$SH.doiSearchFilter
            };
            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'DoiService';
                httpconfig.method = method;

                return httpconfig;
            };

            return {
                isEnabled: function() {
                    return config.doiServiceUrl;
                },
                search: function (term) {
                    var url = $SH.proxyUrl+'?url=';
                    var doiUrl = config.doiServiceUrl + "/doi/search?max=10&offset=0&sort=dateMinted&order=asc";
                    url += encodeURIComponent(doiUrl);
                    url += "&q="+encodeURIComponent(term);
                    if (config.doiSearchFilter) {
                        url += "&fq="+encodeURIComponent(config.doiSearchFilter);
                    }
                    return $http.get(url, _httpDescription('search')).then(function (response) {
                        return response.data;
                        }, function(error) {
                            return error;
                    });
                },
                /**
                 * Extracts the data from the supplied DOI to produce a query that will replicate the
                 * query used to create the DOI.
                 */
                buildQueryFromDoi: function(doi) {
                    var params = null;
                    var url = doi.applicationMetadata && doi.applicationMetadata.searchUrl;
                    if (url) {
                        // Parse the parameters.
                        params = UrlParamsService.parseSearchParams(url);
                    }
                    // The query is expected to be an array
                    if (params.q) {
                        params.q = [params.q];
                    }
                    params.name = doi.title;
                    return params;
                },
                /** Takes a DOI and contructs a string to display summary information about the DOI */
                buildInfoString: function(doi) {

                    var info = '';
                    if (doi.providerMetadata && doi.providerMetadata.contributors) {
                        for (var i=0; i<doi.providerMetadata.contributors.length; i++) {
                            if (doi.providerMetadata.contributors[i].type == 'Distributor') {
                                info += doi.providerMetadata.contributors[i].name;
                            }
                        }
                    }
                    if (doi.applicationMetadata) {
                        if (doi.applicationMetadata.queryTitle) {
                            if (info) {
                                info += ', ';
                            }
                            info += doi.applicationMetadata.queryTitle
                        }
                        if (doi.applicationMetadata.recordCount) {
                            if (info) {
                                info += ' ';
                            }
                            info += '('+doi.applicationMetadata.recordCount+' records)';
                        }
                    }
                    return info;

                }
            };
        }])
}(angular));