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
        .factory("DoiService", ["$http", "$rootScope", "$q", "BiocacheService", function ($http, $rootScope, $q, BiocacheService) {

            var config = {
                doiServiceUrl:$SH.doiServiceUrl,
                doiSearchFilter:$SH.doiSearchFilter,
                applicationName:$SH.applicationName,
                bieServiceUrl:$SH.bieServiceUrl
            };
            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'DoiService';
                httpconfig.method = method;

                return httpconfig;
            };

            var thiz = {
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
                 * Extracts the query URL used to create the DOI from the DOI metadata.
                 */
                getQueryUrl: function(doiMetadata) {
                    return doiMetadata.applicationMetadata && doiMetadata.applicationMetadata.searchUrl;
                },
                /**
                 * Extracts the data from the supplied DOI to produce a query that will replicate the
                 * query used to create the DOI.
                 */
                buildQueryFromDoi: function(doi, queryParams) {
                    queryParams = queryParams || {};
                    // The query is expected to be an array
                    if (queryParams.q) {
                        queryParams.q = [queryParams.q];
                    }
                    queryParams.name = doi.title;
                    return queryParams;
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

                },
                lsidLookup:function(lsid) {
                    var speciesUrl = config.bieServiceUrl+'/species/'+lsid+'.json';

                    return $http.get(speciesUrl).then(function(result) {
                        result = result && result.data;
                        var speciesInfo = {};

                        speciesInfo.name = result.taxonConcept && result.taxonConcept.nameString;
                        if (result.classification && result.classification.scientificName) {
                            speciesInfo.scientificName = result.classification.scientificName;
                        }

                        if (result.commonNames) {
                            var commonNames = [];
                            for (var i=0; i<result.commonNames.length; i++) {
                                commonNames.push(result.commonNames[i].nameString);
                            }
                            speciesInfo.commonNames = commonNames;
                        }
                        return speciesInfo;
                    });
                },
                assembleDoiMetadata: function(species, area, workflowData) {
                    var deferred = $q.defer();
                    var doiApplicationData = {
                        applicationName:config.applicationName || "CSDM",
                        organisation:workflowData.userOrganisation,
                        modeller:workflowData.userDisplayName,
                        workflowAnnotation: workflowData.workflowAnnotation,
                        dataSetAnnotation: workflowData.dataSetAnnotation
                    };

                    var q = species.q;
                    for (var i=0; i<q.length; i++) {
                        if (q[i].indexOf('lsid:') == 0) {
                            doiApplicationData.lsid = q[i].substring(5);
                        }
                    }
                    if (doiApplicationData.lsid) {
                        thiz.lsidLookup(doiApplicationData.lsid).then(function(names) {
                            for (var key in names) {
                                if (names.hasOwnProperty(key)) {
                                    doiApplicationData[key] = names[key];
                                }
                            }
                            deferred.resolve(doiApplicationData);
                        }, function(error) {
                            // This isn't fatal, we just won't have names to attach to the DOI.
                            deferred.resolve(doiApplicationData);
                        });
                    }
                    else {
                        deferred.resolve(doiApplicationData);
                    }
                    return deferred.promise;
                },
                mintDoi: function(species, area, workflowAnnotation) {
                    return this.assembleDoiMetadata(species, area, workflowAnnotation).then(function(doiMetadata) {
                        // Delegate to the BiocacheService to initiate the download and mint the DOI.
                        return BiocacheService.downloadAsync(species, area, doiMetadata);
                    });
                }
            };
            return thiz;
        }])
}(angular));