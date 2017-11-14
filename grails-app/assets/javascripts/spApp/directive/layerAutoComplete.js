(function (angular) {
    'use strict';
    angular.module('layer-auto-complete-directive', ['layers-auto-complete-service'])
        .directive('layerAutoComplete', ['$timeout', 'LayersAutoCompleteService', function ($timeout, LayersAutoCompleteService) {
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
                            LayersAutoCompleteService.search(searchTerm.term).then(function (data) {
                                response($.map(data, function (item) {
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

