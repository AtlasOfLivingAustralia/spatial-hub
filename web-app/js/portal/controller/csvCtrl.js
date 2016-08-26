(function (angular) {
    'use strict';
    angular.module('csv-ctrl', ['map-service', 'biocache-service'])
        .controller('CsvCtrl', ['$scope', 'MapService', '$timeout', '$rootScope', '$uibModalInstance', 'BiocacheService', 'data',
            function ($scope, MapService, $timeout, $rootScope, $uibModalInstance, BiocacheService, data) {

                $scope.data = data
                $scope.summary = $.csv.toArrays(data.csv.substring(0, 100000))
                $scope.summary = $scope.summary.splice(0, $scope.summary.length - 2)

                $scope.name = 'csvCtrl'
                $scope.step = $rootScope.getValue($scope.name, 'step', 1);
                $scope.exportUrl = $rootScope.getValue($scope.name, 'exportUrl', null)

                $rootScope.addToSave($scope)

                $scope.hide = function () {
                    $uibModalInstance.close({hide: true});
                }

                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };

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
