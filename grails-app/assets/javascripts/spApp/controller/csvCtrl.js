(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name CsvCtrl
     * @description
     *   Display a CSV
     */
    angular.module('csv-ctrl', ['map-service', 'biocache-service'])
        .controller('CsvCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance', 'BiocacheService', 'data',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, data) {

                $scope.data = data;
                $scope.truncated = data.csv.length > 100000;

                $scope.summary = $.csv.toArrays(data.csv.substring(0, 100000));

                if ($scope.truncated) {
                    // cleanup last row that was truncated
                    $scope.summary = $scope.summary.splice(0, $scope.summary.length - 2);
                }

                $scope.step = 1;
                $scope.exportUrl = null;
                $scope.mappable = false;
                $scope.distributions = false;
                $scope.species = false;

                LayoutService.addToSave($scope);

                //TODO: implement addToMap for csvCtrl
                $scope.addToMap = function (item) {
                    if ($scope.distributions) {

                    } else if ($scope.species) {

                    }
                };

                //adjust sequence of header
                $scope.sortColumn = function(src){
                    if (data.columnOrder) {
                        var columnOrder = data.columnOrder;

                        var csv_data = new Map();
                        for (i in columnOrder) {
                            csv_data.set(columnOrder[i], []);
                        }

                        var transpose = _.zip.apply(null, src);

                        for (var i = 0; i < transpose.length; i++) {
                            csv_data.set(transpose[i][0], transpose[i].slice(1))
                        }

                        //Map to Array
                        var da = Array.from(csv_data);

                        //flat array
                        for (i in da) {
                            da[i] = da[i].flat();
                        }
                        // reverse x/y
                        return _.zip.apply(null, da)
                    }
                };

                if ($scope.summary.length > 0 && $scope.summary[0].length > 0) {
                    $.each($scope.summary[0], function (fieldName) {
                        if (fieldName === 'spcode') {
                            $scope.mappable = true;
                            $scope.distributions = true
                        } else if (fieldName === 'names_and_lsid') {
                            $scope.mappable = true;
                            $scope.species = true
                        }
                    });

                    $scope.summary = $scope.sortColumn($scope.summary);
                }

                $timeout(function () {
                    if ($scope.data.csv.length > 0) {
                        var blob = new Blob([$scope.data.csv], {type: 'text/plain'});
                        $scope.exportUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                    } else {
                        $scope.exportUrl = null
                    }
                }, 0)
            }




            ])
}(angular));
