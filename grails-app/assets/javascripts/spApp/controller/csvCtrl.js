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

                if ($scope.summary.length > 0 && $scope.summary[0].length > 0) {
                    $.each($scope.summary[0], function (fieldName) {
                        if (fieldName === 'spcode') {
                            $scope.mappable = true;
                            $scope.distributions = true
                        } else if (fieldName === 'names_and_lsid') {
                            $scope.mappable = true;
                            $scope.species = true
                        }
                    })
                }

                $timeout(function () {
                    if ($scope.data.csv.length > 0) {
                        var blob = new Blob([$scope.data.csv], {type: 'text/plain'});
                        $scope.exportUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                    } else {
                        $scope.exportUrl = null
                    }
                }, 0)
            }])
}(angular));
