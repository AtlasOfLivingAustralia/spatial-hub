(function (angular) {
    'use strict';
    angular.module('tool-area-report-ctrl', ['map-service', 'biocache-service', 'layers-service'])
        .controller('ToolAreaReportCtrl', ['$scope', 'MapService', '$timeout', '$rootScope', '$uibModalInstance',
            'BiocacheService', 'LayersService',
            function ($scope, MapService, $timeout, $rootScope, $uibModalInstance, BiocacheService, LayersService) {

                $scope.name = 'toolAreaReportCtrl'
                $scope.step = 1
                $scope.selectedArea = $rootScope.getValue($scope.name, 'selectedArea', {
                    area: {
                        q: [],
                        wkt: '',
                        bbox: [],
                        name: '',
                        wms: '',
                        legend: ''
                    }
                })
                $rootScope.addToSave($scope)

                $scope.hide = function () {
                    $uibModalInstance.close({hide: true});
                }

                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };

                $scope.ok = function (data) {
                    if ($scope.step == 1) {
                        $scope.cancel({noOpen: true})
                        $rootScope.openModal('areaReport', $scope.selectedArea.area)
                    }
                };

                $scope.isDisabled = function () {
                    if ($scope.step == 1) {
                        return $scope.selectedArea.area.length == 0
                    }
                }
            }])
}(angular));