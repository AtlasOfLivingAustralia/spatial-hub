(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name BieService
     * @description
     *   Methods to interact with ALA BIE and Name Matching services
     */
    angular.module('bie-service', [])
        .factory("BieService", ["$http", "$q", function ($http, $q) {
            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'BieService';
                httpconfig.method = method;

                return httpconfig;
            };

            return {
                /**
                 * Get taxon classification information
                 * @memberof BieService
                 * @param {String} lsid taxon LSID
                 * @returns {Promise(List)} classification
                 *
                 * @example
                 * Input:
                 * ["http://id.biodiversity.org.au/instance/apni/852793"]
                 *
                 * Output:
                 * [{
                 *  "rank": "species",
                 *  "rankID": 7000,
                 *  "scientificName": "Eucalyptus subcaerulea",
                 *  "guid": "http://id.biodiversity.org.au/instance/apni/852793",
                 *  "url": "https://bie.ala.org.au/species/http://id.biodiversity.org.au/instance/apni/852793"
                 * }]
                 */
                classification: function (lsid) {
                    return $http.get($SH.bieServiceUrl + "/classification/" + lsid, _httpDescription('classification')).then(function (response) {
                        var list = response.data;
                        for (var i in list) {
                            if (list.hasOwnProperty(i)) {
                                list[i].url = $SH.bieUrl + '/species/' + list[i].guid
                            }
                        }
                        return list
                    });
                },

                /**
                 * Bulk LSID lookup using taxon names
                 *
                 * Uses name matching service's /api/getGuidsForTaxa and /api/getAllByTaxonID because
                 * /api/searchAllByClassification failed to return results for some names.
                 *
                 * @memberof BieService
                 * @param {List} names List of taxon names to search
                 * @returns {Promise(List)} search results that will contain LSID if found
                 *
                 * @example
                 * Input:
                 * ["Macropus"]
                 *
                 * Output (may contain additional fields):
                 * [{
                 *  "identifier": "urn:lsid:biodiversity.org.au:afd.taxon:b1d9bf29-648f-47e6-8544-2c2fbdf632b1",
                 *  "searchTerm": "Macropus",
                 *  "acceptedConceptGuid": "urn:lsid:biodiversity.org.au:afd.taxon:b1d9bf29-648f-47e6-8544-2c2fbdf632b1",
                 *  "name": "Macropus",
                 *  "kingdom": "ANIMALIA",
                 *  "family": "MACROPODIDAE"
                 *  }]
                 */
                nameLookup: function (names) {
                    return $http.post($SH.namematchingUrl + "/api/getGuidsForTaxa", names,
                        _httpDescription('nameLookup2')).then(function (response) {

                        var list = response.data;

                        // URL encode list
                        var encodedIds = list.map(function (item) {
                            return encodeURIComponent(item, "UTF-8");
                        })

                        // do batching because the URL gets too long
                        var batchSize = 1;
                        var promises = [];

                        for (let i = 0; i < encodedIds.length; i += batchSize) {
                            var batch = encodedIds.slice(i, i + batchSize);
                            var taxonParam = "&taxonIDs=" + batch.join("&taxonIDs=");
                            var promise = $http.post($SH.namematchingUrl + "/api/getAllByTaxonID?follow=true" + taxonParam, {}, _httpDescription('nameLookup2'))
                                .then(function (response2) {
                                    var list2 = response2.data;

                                    for (var j in list2) {
                                        if (list2.hasOwnProperty(j)) {
                                            list2[j].name = list2[j].scientificName;
                                            list2[j].searchTerm = names[i + Number(j)];
                                            list2[j].acceptedConceptGuid = list[i + Number(j)];
                                            list2[j].identifier = list[i + Number(j)];
                                        }
                                    }
                                    return list2;
                                });
                            promises.push(promise);
                        }

                        return $q.all(promises).then(function (results) {
                            return [].concat.apply([], results); // Flatten the array of results
                        });
                    });

                },

                /**
                 * Single taxon information lookup using LSIDs. Uses name matching service.
                 *
                 * @memberof BieService
                 * @param {String} LSID to search
                 * @returns {Promise} search results that will contain taxon information if found
                 *
                 * @example
                 * Input:
                 * ["http://id.biodiversity.org.au/instance/apni/852793"]
                 *
                 * Output (may contain additional fields):
                 * {
                 *  "identifier": "urn:lsid:biodiversity.org.au:afd.taxon:b1d9bf29-648f-47e6-8544-2c2fbdf632b1",
                 *  "searchTerm": "urn:lsid:biodiversity.org.au:afd.taxon:b1d9bf29-648f-47e6-8544-2c2fbdf632b1",
                 *  "acceptedConceptGuid": "urn:lsid:biodiversity.org.au:afd.taxon:b1d9bf29-648f-47e6-8544-2c2fbdf632b1",
                 *  "name": "Macropus",
                 *  "kingdom": "ANIMALIA",
                 *  "family": "MACROPODIDAE"
                 *  }
                 */
                guidLookup: function (lsid) {
                    return $http.post($SH.namematchingUrl + "/api/getAllByTaxonID?follow=true&taxonIDs=" + encodeURIComponent(lsid), {}, _httpDescription('nameLookup2'))
                        .then(function (response2) {
                            var list2 = response2.data;

                            for (var j in list2) {
                                if (list2.hasOwnProperty(j)) {
                                    list2[j].name = list2[j].scientificName;
                                    list2[j].searchTerm = lsid;
                                    list2[j].acceptedConceptGuid = list2[j].taxonConceptID;
                                    list2[j].identifier = list2[j].taxonConceptID;
                                }
                            }
                            return list2[[0]];
                        });
                }
            };
        }])
}(angular));
