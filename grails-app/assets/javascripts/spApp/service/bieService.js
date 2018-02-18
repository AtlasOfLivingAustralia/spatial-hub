(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name BieService
     * @param {service} $http angular html service
     * @description
     *   Methods to interact with ALA BIE
     */
    angular.module('bie-service', [])
        .factory("BieService", ["$http", function ($http) {
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
                    return $http.get($SH.bieServiceUrl + "/classification/" + lsid).then(function (response) {
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
                 * @memberof BieService
                 * @param {List} names List of taxon names to search
                 * @returns {Promise(List)} search results that will contain LSID if found
                 *
                 * @example
                 * Input:
                 * ["Macropus"]
                 *
                 * Output:
                 * [{
                 *  "identifier": "urn:lsid:biodiversity.org.au:afd.taxon:b1d9bf29-648f-47e6-8544-2c2fbdf632b1",
                 *  "guid": "urn:lsid:biodiversity.org.au:afd.taxon:b1d9bf29-648f-47e6-8544-2c2fbdf632b1",
                 *  "parentGuid": "urn:lsid:biodiversity.org.au:afd.taxon:3281c966-5119-4146-89e5-3c874754f23a",
                 *  "name": "Macropus",
                 *  "nameComplete": "Macropus Shaw, 1790",
                 *  "commonName": null,
                 *  "commonNameSingle": null,
                 *  "rank": "genus",
                 *  "rankId": 6000,
                 *  "acceptedConceptGuid": "urn:lsid:biodiversity.org.au:afd.taxon:b1d9bf29-648f-47e6-8544-2c2fbdf632b1",
                 *  "acceptedConceptName": "Macropus",
                 *  "taxonomicStatus": "accepted",
                 *  "imageId": "274ed24e-481e-4532-bead-66fa479fb272",
                 *  "imageUrl": "https://images.ala.org.au/image/proxyImage?imageId=274ed24e-481e-4532-bead-66fa479fb272",
                 *  "thumbnailUrl": "https://images.ala.org.au/image/proxyImageThumbnail?imageId=274ed24e-481e-4532-bead-66fa479fb272",
                 *  "largeImageUrl": "https://images.ala.org.au/image/proxyImageThumbnailLarge?imageId=274ed24e-481e-4532-bead-66fa479fb272",
                 *  "smallImageUrl": "https://images.ala.org.au/image/proxyImageThumbnailLarge?imageId=274ed24e-481e-4532-bead-66fa479fb272",
                 *  "imageMetadataUrl": "https://images.ala.org.au/ws/image/274ed24e-481e-4532-bead-66fa479fb272",
                 *  "kingdom": "ANIMALIA",
                 *  "phylum": "CHORDATA",
                 *  "classs": "MAMMALIA",
                 *  "order": "DIPROTODONTIA",
                 *  "family": "MACROPODIDAE",
                 *  "genus": null,
                 *  "author": "Shaw, 1790",
                 *  "linkIdentifier": null,
                 *  "searchTerm": "Macropus"
                 *  }]
                 */
                nameLookup: function (names) {
                    return $http.post($SH.bieServiceUrl + "/species/lookup/bulk", {
                        names: names,
                        vernacular: false
                    }).then(function (response) {
                        var list = response.data;
                        for (var i in list) {
                            if (list.hasOwnProperty(i)) {
                                list[i].searchTerm = names[i]
                            }
                        }
                        return list
                    });
                },

                /**
                 * Bulk taxon information lookup using LSIDs
                 * @memberof BieService
                 * @param {List} lsids List of LSIDs to search
                 * @returns {Promise(List)} search results that will contain taxon information if found
                 *
                 * @example
                 * Input:
                 * ["http://id.biodiversity.org.au/instance/apni/852793"]
                 *
                 * Ouput:
                 * [{
                 *  "guid": "http://id.biodiversity.org.au/instance/apni/852793",
                 *  "name": "Eucalyptus subcaerulea",
                 *  "scientificName": "Eucalyptus subcaerulea",
                 *  "author": "K.D.Hill",
                 *  "nameComplete": "Eucalyptus subcaerulea K.D.Hill",
                 *  "rank": "species",
                 *  "kingdom": null,
                 *  "phylum": null,
                 *  "classs": null,
                 *  "order": null,
                 *  "family": null,
                 *  "genus": null,
                 *  "datasetName": "APC",
                 *  "datasetID": "dr5214",
                 *  "acceptedConceptGuid": "http://id.biodiversity.org.au/instance/apni/852793",
                 *  "searchTerm": "http://id.biodiversity.org.au/instance/apni/852793"
                 *  }]
                 */
                guidLookup: function (guids) {
                    return $http.post($SH.bieServiceUrl + "/species/guids/bulklookup", guids).then(function (response) {
                        var list = response.data.searchDTOList;
                        for (var i in list) {
                            if (list.hasOwnProperty(i)) {
                                list[i].searchTerm = guids[i];
                                list[i].acceptedConceptGuid = list[i].guid
                            }
                        }
                        return list
                    });
                }
            };
        }])
}(angular));
