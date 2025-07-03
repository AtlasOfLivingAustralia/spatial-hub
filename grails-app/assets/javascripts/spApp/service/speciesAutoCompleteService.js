(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name SpeciesAutoCompleteService
     * @description
     *   List species
     */
    angular.module('species-auto-complete-service', [])
        .factory("SpeciesAutoCompleteService", ["$http", "$rootScope", function ($http, $rootScope) {
            var lastUrl = '';

            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'SpeciesAutoCompleteService';
                httpconfig.method = method;

                return httpconfig;
            };

            var finishLoading = function (a, data) {
                if (data.url === lastUrl) {
                    //hide all species spinners
                    $('.species-spinner').removeClass('species-spinner')
                }
            };

            $rootScope.$on("cfpLoadingBar:loaded", finishLoading);

            return {
                /**
                 * Search for species
                 * @memberof SpeciesAutoCompleteService
                 * @param {String} search term
                 * @returns {Promise(List)} list of species
                 *
                 * @example
                 * Input:
                 *  "macropus"
                 *
                 * Output:
                 *  {
                        "searchResults": {
                        "startIndex": 0,
                        "totalRecords": 74,
                        "query": "macropus",
                        "pageSize": 10,
                        "sort": "score",
                        "dir": "desc",
                        "results": [{
                            "imageCount": 0,
                            "idxType": "TAXON",
                            "nameComplete": "Macropus",
                            "hasChildren": false,
                            "isExcluded": false,
                            "distributionsCount": 0,
                            "score": 7419.246,
                            "highlight": "<strong>Macropus</strong>",
                            "tracksCount": 0,
                            "linkIdentifier": "urn:lsid:biodiversity.org.au:afd.taxon:b1d9bf29-648f-47e6-8544-2c2fbdf632b1",
                            "rank": "genus",
                            "checklistsCount": 0,
                            "order": "Diprotodontia",
                            "author": "Shaw, 1790",
                            "isAustralian": "recorded",
                            "right": "104204",
                            "kingdom": "Animalia",
                            "phylum": "Chordata",
                            "classs": "Mammalia",
                            "rawRank": "GENUS",
                            "left": "104190",
                            "genus": "Macropus",
                            "rankId": 6000,
                            "parentGuid": "urn:lsid:biodiversity.org.au:afd.taxon:190ad4b1-0444-4791-96a5-ee514438d7e6",
                            "name": "Macropus",
                            "guid": "urn:lsid:biodiversity.org.au:afd.taxon:b1d9bf29-648f-47e6-8544-2c2fbdf632b1",
                            "family": "Macropodidae",
                            "occCount": 147560
                        },

                 */
                search: function (term, spinner) {
                    //show only this species spinner
                    spinner.addClass('species-spinner');

                    var url = $SH.bieServiceUrl + "/search/auto?q=" + encodeURIComponent(term) + "&idxType=TAXON";
                    lastUrl = url;

                    return $http.get(url, _httpDescription('search')).then(function (response) {
                        return response.data;
                    });
                }
            };
        }])
}(angular));