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
                    var a = iElement.autocomplete({
                        source: function (searchTerm, response) {
                            LayersService.searchLayers(searchTerm.term).then(function (data) {
                                response($.map(data.data, function (item) {
                                    if ((item.layer.type === 'Environmental' && scope._environmental) ||
                                        (item.layer.type === 'Contextual' && scope._contextual)) {
                                        return {
                                            label: item.name,
                                            info: (item.layer.classification1 ? item.layer.classification1 + ': ' : '') + (item.layer.classification2 ? item.layer.classification2 + ': ' : '') + (item.layer.type ? item.layer.type : ''),
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

                    a.data("ui-autocomplete")._renderItem = function (ul, item) {
                        var html = "<li class='autocomplete-item' >" + item.label + "<br><i>" + item.info + "</i></li>";
                        return $("<li>")
                            .append($("<a>").append(html))
                            .appendTo(ul);
                    };
                }
            };
        }])
}(angular));

