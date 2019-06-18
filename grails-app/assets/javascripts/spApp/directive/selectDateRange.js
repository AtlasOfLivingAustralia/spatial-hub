(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name selectDaterange
     * @description
     *   Select a date range
     */
    angular.module('select-date-range-directive', []).directive('selectDateRange',
        ['BiocacheService', function (biocacheService) {
            return {
                scope: {
                    _selectedDateRange: '=selectedDateRange',
                    _uniqueId: '=uniqueId',
                    _custom: '&onCustom'
                },
                templateUrl: "/spApp/selectDateRangeCtrl.htm",
                link: function (scope, element, attrs) {
                    scope.dateMin = new Date($SH.dateMin);
                    scope.dateMax = new Date($SH.dateMax);

                    scope.enabled = false;

                    scope.dateStart = scope.dateMin;
                    scope.dateEnd = scope.dateMax;

                    scope.apply = function () {
                        if (!scope.enabled || scope.dateStart === undefined || scope.dateEnd === undefined) {
                            scope._selectedDateRange.fq = []
                        } else {
                            scope._selectedDateRange.fq = [$SH.dateFacet + ":[" + scope.dateStart.toISOString() + " TO " + scope.dateEnd.toISOString() + "]"]
                        }
                        // inform parent
                        if (scope._custom !== undefined) {
                            scope._custom()
                        }
                    }

                    scope.apply();
                }
            };
        }])
}(angular));