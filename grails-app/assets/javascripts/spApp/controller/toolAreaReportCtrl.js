(function (angular) {
    'use strict';
    angular.module('tool-area-report-ctrl', ['map-service', 'biocache-service', 'layers-service'])
        .controller('ToolAreaReportCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance',
            'BiocacheService', 'LayersService', 'data',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, LayersService, config) {

                $scope.step = 1;

                if (config && config.selectedArea) {
                    $scope.selectedArea = {area: config.selectedArea.area}
                } else {
                    $scope.selectedArea = {area: [{}]}
                }

                LayoutService.addToSave($scope);

                $scope.ok = function () {
                    if ($scope.step === 1) {
                        LayoutService.openModal('areaReport', $scope.selectedArea.area[0], false)
                    }
                };

                $scope.isDisabled = function () {
                    if ($scope.step === 1) {
                        return $scope.selectedArea.area.length === 0 || !$scope.selectedArea.area[0]
                    }
                }
            }])
}(angular));