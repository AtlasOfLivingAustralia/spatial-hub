(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name areaListSelect
     * @description
     *   Radio button list of predefined areas
     */
    angular.module('area-list-select-directive', ['predefined-areas-service']).directive('areaListSelect',
        ['PredefinedAreasService', function (PredefinedAreasService) {
            return {
                scope: {
                    _custom: '&onCustom'
                },
                template: "<select ng-model='selectedItem' ng-change='_custom()(selectedItem)'><option ng-repeat='x in list' value='{{x.value}}'>{{x.label}}</option></select>",
                link: function (scope, element, attrs) {
                    scope.list = PredefinedAreasService.getList()
                }
            };
        }])
}(angular));