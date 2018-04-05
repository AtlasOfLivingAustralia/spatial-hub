(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name gazAutoComplete
     * @description
     *   Gazetteer autocomplete
     */
    angular.module('gaz-auto-complete-directive', ['gaz-auto-complete-service']).directive('gazAutoComplete',
        ['$timeout', 'GazAutoCompleteService', function ($timeout, GazAutoCompleteService) {
            return {
                scope: {
                    _userobjects: '=',
                    _custom: '&onCustom'
                },
                link: function (scope, iElement, iAttrs) {
                    iElement.autocomplete({
                        source: function (searchTerm, response) {
                            GazAutoCompleteService.search(searchTerm.term).then(function (data) {
                                response($.map(data, function (item) {
                                    if (item.fid !== $SH.userObjectsField || scope._userobjects) {
                                        return {
                                            label: item.name + ", " + item.fieldname,
                                            //item.description
                                            value: item
                                        }
                                    } else {
                                        return null
                                    }
                                }))
                            });
                        },

                        select: function (event, ui) {
                            scope._custom()(ui.item.value.pid);
                            scope.label = ui.item.label;

                            $timeout(function () {
                                iElement.val(scope.label);
                            }, 0)
                        }
                    });
                }
            };
        }])
}(angular));