(function (angular) {
    'use strict';
    angular.module('layers-auto-complete-service', ['layers-service'])
        .factory("LayersAutoCompleteService", ["$http", "LayersService", function ($http, LayersService) {
            return {
                search: function (term) {
                    return $http.get(LayersService.url() + "/fields/search?q=" + term).then(function (response) {
                        return response.data;
                    });
                }
            };
        }])
}(angular));