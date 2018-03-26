(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name layerAutoComplete
     * @description
     *   Autocomplete for spatial-service layers
     */
    angular.module('layer-auto-complete-directive', ['layers-service'])
        .directive('layerAutoComplete', ['$timeout', 'LayersService', function ($timeout, LayersService) {
            return {
                restrict: 'A',
                scope: {
                    _environmental: '=environmental',
                    _contextual: '=contextual',
                    _custom: '&onCustom'
                },
                link: function (scope, iElement, iAttrs) {
                    iElement.autocomplete({
                        source: function (searchTerm, response) {
                            LayersService.searchLayers(searchTerm.term).then(function (data) {
                                response($.map(data.data, function (item) {
                                    if ((item.layer.type === 'Environmental' && scope._environmental) ||
                                        (item.layer.type === 'Contextual' && scope._contextual)) {
                                        return {
                                            label: item.name,
                                            value: item
                                        }
                                    } else {
                                        return null
                                    }
                                }))
                            });
                        },

                        select: function (event, ui) {
                            scope._custom()(ui.item.value);

                            $timeout(function () {
                                iElement.val("");
                            }, 0)
                        }
                    });
                }
            };
        }])
}(angular));

