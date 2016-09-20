(function (angular) {
    'use strict';
    angular.module('species-auto-complete-service', [])
        .factory("SpeciesAutoCompleteService", ["$http", function ($http) {
            return {
                search: function (term) {
                    return $http.get(SpatialPortalConfig.biocacheServiceUrl + "/autocomplete/search?q=" + term).then(function (response) {
                        return response.data;
                    });
                }
            };
        }])
}(angular));