(function (angular) {
    'use strict';
    angular.module('export-area-ctrl', ['biocache-service', 'map-service', 'layers-service'])
        .controller('ExportAreaCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance', 'BiocacheService',
            'LayersService', 'data',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, LayersService, config) {

                $scope.name = 'exportAreaCtrl'
                $scope.stepNames = ['area to export', 'export type']

                if(config && config.step){
                    $scope.step = config.step
                } else {
                    $scope.step = 1
                }

                if(config && config.selectedArea){
                    $scope.selectedArea = config.selectedArea
                } else {
                    $scope.selectedArea = {
                        area: {
                            q: [],
                            wkt: '',
                            bbox: [],
                            name: '',
                            wms: '',
                            legend: ''
                        }
                    }
                }

                $scope.type = 'shp'

                LayoutService.addToSave($scope)

                $scope.hide = function () {
                    $uibModalInstance.close({hide: true});
                }

                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };

                $scope.ok = function (data) {
                    if ($scope.step == 2) {

                        var url = LayersService.getAreaDownloadUrl($scope.selectedArea.area.pid, $scope.type, $scope.selectedArea.area.name)

                        var link = document.createElement("a");
                        link.href = url;
                        link.click();

                        $scope.cancel({noOpen: true})
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
                        return $scope.selectedArea.area.length == 0
                    } else {
                        return false
                    }
                }
            }])
}(angular));