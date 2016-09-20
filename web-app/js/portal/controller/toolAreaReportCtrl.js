(function (angular) {
    'use strict';
    angular.module('tool-area-report-ctrl', ['map-service', 'biocache-service', 'layers-service'])
        .controller('ToolAreaReportCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance',
            'BiocacheService', 'LayersService', 'data',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, LayersService, config) {

                $scope.name = 'toolAreaReportCtrl'
                $scope.step = 1

                if(config && config.selectedArea){
                    $scope.selectedArea = {area: [config.selectedArea.area]}
                } else {
                    $scope.selectedArea = {area: [{}]}
                }

                LayoutService.addToSave($scope)

                $scope.hide = function () {
                    $uibModalInstance.close({hide: true});
                }

                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };

                $scope.ok = function (data) {
                    if ($scope.step == 1) {
                        $scope.cancel({noOpen: true})
                        LayoutService.openModal('areaReport', $scope.selectedArea.area[0])
                    }
                };

                $scope.isDisabled = function () {
                    if ($scope.step == 1) {
                        return $scope.selectedArea.area[0].length == 0
                    }
                }
            }])
}(angular));