(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name CsvCtrl
     * @description
     *   Display a CSV
     */
    angular.module('facet-ctrl', [])
        .controller('FacetCtrl', ['$scope', '$timeout', 'LayoutService', '$uibModalInstance', '$sce', 'data',
            function ($scope, $timeout, LayoutService, $uibModalInstance, $sce, data) {

                $scope.onChange = data.onChange;
                $scope.data = data.data;
                $scope.sortType = 'displayName';
                $scope.sortReverse = false;
                $scope.filter = '';
                $scope.category = '';
                $scope.selectedFacetsValue = '* Selected facets';

                $scope.categoryNames = []
                $scope.categories = [{name: '* All categories', value: ''},
                    {name: $scope.selectedFacetsValue, value: $scope.selectedFacetsValue}]
                $.map($scope.data, function (v, k) {
                    if ($scope.categoryNames.indexOf(v.class) < 0) {
                        $scope.categoryNames.push(v.class)
                        $scope.categories.push({name: v.class, value: v.class})
                    }
                })

                LayoutService.addToSave($scope);

                $scope.popupContent = function (item) {
                    if (!item.html) {
                        var html = '<table class="table-condensed table-striped table-bordered table">'
                        for (var i in item) {
                            if (item.hasOwnProperty(i) && i.indexOf('$') < 0) {
                                var tdi = $('<td>').text(i).html()
                                var tditem = $('<td>').text(item[i]).html()
                                html += '<tr><td>' + tdi + '</td><td>' + tditem + '</td></tr>'
                            }
                        }
                        html += '</table>';
                        item.html = $sce.trustAsHtml(html);
                    }
                    return item.html;
                }

                $scope.selectionCount = function () {
                    var sum = 0;
                    for (var i in $scope.data) {
                        if ($scope.data[i].selected) {
                            sum = sum + 1
                        }
                    }
                    return sum
                }

                $scope.selectionChanged = function (facet) {
                    // enforce single selection when facets are not enabled
                    if (!$SH.filtersEnabled) {
                        for (var i in $scope.data) {
                            if (facet.facet !== $scope.data[i].facet) {
                                $scope.data[i].selected = false
                            }
                        }
                    }
                }

                $scope.clearSelection = function () {
                    for (var i in $scope.data) {
                        $scope.data[i].selected = false
                    }
                }

                $scope.close = function () {
                    if ($scope.onChange) {
                        $scope.onChange($scope.data);
                    }
                    $scope.$close();
                }
            }
        ])
}(angular));
