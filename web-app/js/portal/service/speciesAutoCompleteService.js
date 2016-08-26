(function (angular) {
    'use strict';
    angular.module('species-auto-complete-service', [])
        .factory("SpeciesAutoCompleteService", ["$http", function ($http) {
            return {
                search: function (term) {
                    //return $http.get(/*"http://bie.ala.org.au/ws/search.json?q="*/
                    //    //"http://ala-cohen.it.csiro.au/biocache-service/autocomplete/search?all=true&q=" + term).then(function (response) {
                    //    SpatialPortalConfig.biocacheUrl + "/autocomplete/search?all=true&q=" + term).then(function (response) {
                    //    /*"http://bie.ala.org.au/ws/search.json?fq=idxtype:TAXON&q="*/
                    //    return response.data;
                    //});
                    return $http.get(/*"http://bie.ala.org.au/ws/search.json?q="*/
                        "http://ala-cohen.it.csiro.au/biocache-service/autocomplete/search?q=" + term).then(function (response) {
                        //SpatialPortalConfig.biocacheServiceUrl + "/autocomplete/search?q=" + term).then(function (response) {
                        /*"http://bie.ala.org.au/ws/search.json?fq=idxtype:TAXON&q="*/
                        return response.data;
                    });
                }
            };
        }])
}(angular));