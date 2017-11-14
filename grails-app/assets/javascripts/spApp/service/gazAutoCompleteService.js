(function (angular) {
    'use strict';
    angular.module('gaz-auto-complete-service', ['layers-service'])
        .factory("GazAutoCompleteService", ["$http", "LayersService", function ($http, LayersService) {
            return {
                search: function (term) {
                    return $http.get(LayersService.url() + "/search?q=" + term).then(function (response) {
                        return response.data;
                    });
                }
            };
        }])
}(angular));