(function (angular) {
    'use strict';
    angular.module('bie-service', [])
        .factory("BieService", ["$http", function ($http) {
            return {
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
