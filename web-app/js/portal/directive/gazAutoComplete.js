(function (angular) {
    'use strict';
    angular.module('gaz-auto-complete-directive', ['gaz-auto-complete-service']).directive('gazAutoComplete',
        ['$timeout', 'GazAutoCompleteService', function ($timeout, GazAutoCompleteService) {
            return {
                scope: {
                    userobjects: '=',
                    custom: '&onCustom'
                },
                link: function (scope, iElement, iAttrs) {
                    iElement.autocomplete({
                        source: function (searchTerm, response) {
                            GazAutoCompleteService.search(searchTerm.term).then(function (data) {
                                response($.map(data, function (item) {
                                    if (item.fid !== SpatialPortalConfig.userObjectsField || scope.userobjects) {
                                        return {
                                            label: item.name + ", " + item.fieldname,
                                            value: item
                                        }
                                    } else {
                                        return null
                                    }
                                }))
                            });
                        },

                        select: function (event, ui) {
                            scope.custom()(ui.item.value.pid)
                            scope.label = ui.item.label

                            $timeout(function () {
                                iElement.val(scope.label);
                            }, 0)
                        }
                    });
                }
            };
        }])
}(angular));