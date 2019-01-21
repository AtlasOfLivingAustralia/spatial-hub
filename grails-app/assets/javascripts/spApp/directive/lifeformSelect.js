(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name lifeformSelect
     * @description
     *   Select dropdown of biocache lifeforms
     */
    angular.module('lifeform-select-directive', []).directive('lifeformSelect',
        ['BiocacheService', function (biocacheService) {
            return {
                scope: {
                    _custom: '&onCustom'
                },
                template: "<select ng-model='selectedItem' ng-change='selectItem(selectedItem)'><option ng-repeat='x in list' value='{{x.query}}'>{{x.label}}</option></select>",
                link: function (scope, element, attrs) {
                    scope.list = [];
                    scope.selectItem = function (selectedItem) {
                        scope._custom()(JSON.parse(selectedItem))
                    };

                    biocacheService.facetGeneral('species_group', biocacheService.newQuery(), -1, 0).then(function (data) {
                        $.each(data[0].fieldResult, function (idx, item) {
                            item.query = biocacheService.newQuery([item.fq], item.label);
                            scope.list.push(item)
                        });
                    })
                }
            };
        }])
}(angular));