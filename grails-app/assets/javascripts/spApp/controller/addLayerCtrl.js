(function (angular) {
    'use strict';
    angular.module('add-layer-ctrl', ['map-service'])
        .controller('AddLayerCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance) {

                $scope.step = 1;

                $scope.selectedLayers = {layers: []};
                $scope.min = 1;
                $scope.max = 20;
                LayoutService.addToSave($scope);

                $scope.ok = function (data) {
                    if ($scope.step === 1) {

                        for (var i = 0; i < $scope.selectedLayers.layers.length; i++) {
                            MapService.add($scope.selectedLayers.layers[i])
                        }

                        $scope.$close();
                    }
                };

                $scope.isDisabled = function () {
                    if ($scope.step === 1) {
                        return $scope.selectedLayers.layers.length < 1 || $scope.selectedLayers.layers.length > 1000
                    }
                }
            }])
}(angular));