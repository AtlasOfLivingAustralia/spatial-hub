(function (angular) {
    'use strict';
    angular.module('species-auto-complete-directive', ['species-auto-complete-service'])
        .directive('speciesAutoComplete', ['$timeout', 'SpeciesAutoCompleteService', function ($timeout, SpeciesAutoCompleteService) {
            return {
                scope: {
                    custom: '&onCustom'
                },
                link: function (scope, iElement, iAttrs) {
                    iElement.autocomplete({
                        source: function (searchTerm, response) {
                            SpeciesAutoCompleteService.search(searchTerm.term).then(function (data) {
                                response($.map(data.searchResults.results, function (item) {
                                    return {
                                        label: item.name + ", " +
                                        (item.commonName ? item.commonName + ' ' : ' ') +
                                        '(' + item.occCount + ' occurrences)',
                                        value: item
                                    }
                                }))
                            });
                        },

                        select: function (event, ui) {
                            scope.custom()({
                                q: ["lsid:" + ui.item.value.guid], name: ui.item.value.name,
                                bs: SpatialPortalConfig.biocacheServiceUrl, ws: SpatialPortalConfig.biocacheUrl
                            })
                            scope.label = ui.item.label

                            $timeout(function () {
                                iElement.val(scope.label);
                            }, 0)
                        }
                    });
                }
            };

        }])
}(angular));
