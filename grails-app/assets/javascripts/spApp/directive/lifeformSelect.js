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
        ['BiocacheService', '$http', function (biocacheService, $http) {
            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'LifeformSelect';
                httpconfig.method = method;

                return httpconfig;
            };
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

                    return $http.get($SH.baseUrl + "/portal/lifeforms", _httpDescription('lifeform')).then(function (response) {
                        $.each(response.data, function (idx, item) {
                            item.query = biocacheService.newQuery([item.fq], item.label);
                            scope.list.push(item)
                        });
                    });
                }
            };
        }])
}(angular));
