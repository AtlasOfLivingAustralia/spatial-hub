(function (angular) {
    'use strict';
    angular.module('species-auto-complete-service', [])
        .factory("SpeciesAutoCompleteService", ["$http", "$rootScope", function ($http, $rootScope) {
            var lastUrl = '';

            var finishLoading = function (a, data) {
                if (data.url === lastUrl) {
                    //hide all species spinners
                    $('.species-spinner').removeClass('species-spinner')
                }
            };

            $rootScope.$on("cfpLoadingBar:loaded", finishLoading);

            return {
                search: function (term, spinner) {
                    //show only this species spinner
                    spinner.addClass('species-spinner');

                    var url = $SH.biocacheServiceUrl + "/autocomplete/search?q=" + term;
                    lastUrl = url;

                    return $http.get(url).then(function (response) {
                        return response.data;
                    });
                }
            };
        }])
}(angular));