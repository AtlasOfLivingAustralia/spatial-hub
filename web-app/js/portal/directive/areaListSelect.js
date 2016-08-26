(function (angular) {
    'use strict';
    angular.module('area-list-select-directive', ['predefined-areas-service']).directive('areaListSelect',
        ['PredefinedAreasService', function (PredefinedAreasService) {
            return {
                scope: {
                    custom: '&onCustom'
                },
                template: "<select ng-model='selectedItem' ng-change='custom()(selectedItem)'><option ng-repeat='x in list' value='{{x.value}}'>{{x.label}}</option></select>",
                link: function (scope, element, attrs) {
                    scope.list = PredefinedAreasService.getList()
                }
            };
        }])
}(angular));