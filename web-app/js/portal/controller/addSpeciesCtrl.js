(function (angular) {
    'use strict';
    angular.module('add-species-ctrl', ['map-service', 'biocache-service'])
        .controller('AddSpeciesCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance', 'BiocacheService', 'data',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, inputData) {

                $scope.name = 'addSpeciesCtrl'

                $scope.step = 1
                $scope.selectedQ = {q: [], name: '', bs: '', ws: ''}
                $scope.selectedArea = {
                    area: {
                        q: [],
                        wkt: '',
                        pid: '',
                        bbox: [],
                        name: '',
                        wms: '',
                        legend: ''
                    }
                }
                LayoutService.addToSave($scope)

                $scope.inputData = inputData

                $scope.hide = function () {
                    $uibModalInstance.close({hide: true});
                }

                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };

                $scope.ok = function (data) {
                    if ($scope.step == 2) {
                        var newName = $scope.selectedQ.name
                        if ($scope.selectedArea.name !== undefined) newName += ' (' + $scope.selectedArea.name + ')'
                        BiocacheService.newLayer($scope.selectedQ, $scope.selectedArea.area, newName).then(function (data) {
                            MapService.add(data)
                        })

                        $uibModalInstance.close(data);
                    } else {
                        $scope.step = $scope.step + 1
                    }
                };

                $scope.back = function () {
                    if ($scope.step > 1) {
                        $scope.step = $scope.step - 1
                    }
                };

                $scope.isDisabled = function () {
                    if ($scope.step == 1) {
                        return $scope.selectedQ.q.length == 0
                    } else if ($scope.step == 2) {
                        return $scope.selectedArea.area.length == 0
                    }
                }
            }])
}(angular));