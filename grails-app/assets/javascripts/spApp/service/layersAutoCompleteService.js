(function (angular) {
    'use strict';
    angular.module('layers-auto-complete-service', ['layers-service'])
        .factory("LayersAutoCompleteService", ["$http", "LayersService", function ($http, LayersService) {
            return {
                search: function (term) {
                    var url = LayersService.url() + "/fields/search?q=" + term;
                    return $http.get($SH.proxyUrl + "?url=" + encodeURIComponent(url)).then(function (response) {
                        return response.data;
                    });
                }
            };
        }])
}(angular));