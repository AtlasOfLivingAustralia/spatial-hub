(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name layerListSelect
     * @description
     *   Select dropdown of predefined layer lists
     */
    angular.module('layer-list-select-directive', ['predefined-layer-lists-service']).directive('layerListSelect',
        ['PredefinedLayerListsService', function (PredefinedLayerListsService) {
            return {
                scope: {
                    _custom: '&onCustom'
                },
                template: "<select ng-model='selectedItem' ng-change='_custom()(selectedItem)'><option ng-repeat='x in list' value='{{x.value}}'>{{x.label}}</option></select>",
                link: function (scope, element, attrs) {
                    scope.list = PredefinedLayerListsService.getList()
                }
            };
        }])
}(angular));