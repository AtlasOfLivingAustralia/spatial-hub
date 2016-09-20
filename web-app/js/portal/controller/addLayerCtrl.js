(function (angular) {
    'use strict';
    angular.module('add-layer-ctrl', ['map-service'])
        .controller('AddLayerCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance) {

                $scope.name = 'addLayerCtrl'

                $scope.step = 1;

                $scope.selectedLayers = {layers: []}
                $scope.min = 1
                $scope.max = 20
                LayoutService.addToSave($scope)

                $scope.hide = function () {
                    $uibModalInstance.close({hide: true});
                }

                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };

                $scope.ok = function (data) {
                    if ($scope.step == 1) {

                        for (var i = 0; i < $scope.selectedLayers.layers.length; i++) {
                            MapService.add($scope.selectedLayers.layers[i])
                        }

                        $uibModalInstance.close(data);
                    }
                };

                $scope.isDisabled = function () {
                    if ($scope.step == 1) {
                        return $scope.selectedLayers.layers.length < 1 || $scope.selectedLayers.layers.length > 1000
                    }
                }
            }])
}(angular));