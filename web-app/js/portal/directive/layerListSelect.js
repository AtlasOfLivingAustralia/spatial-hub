(function (angular) {
    'use strict';
    angular.module('layer-list-select-directive', ['predefined-layer-lists-service']).
    directive('layerListSelect', ['PredefinedLayerListsService', function (PredefinedLayerListsService) {
        return {
            scope: {
                custom: '&onCustom'
            },
            template: "<select ng-model='selectedItem' ng-change='custom()(selectedItem)'><option ng-repeat='x in list' value='{{x.value}}'>{{x.label}}</option></select>",
            link: function (scope, element, attrs) {
                scope.list = PredefinedLayerListsService.getList()
            }
        };
    }])
}(angular));