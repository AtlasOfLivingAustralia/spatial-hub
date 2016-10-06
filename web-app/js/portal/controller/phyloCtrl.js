(function (angular) {
    'use strict';
    angular.module('phylo-ctrl', ['map-service']).controller('PhyloCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance', 'data',
        function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, inputData) {

            var param = inputData

            $scope.name = 'PhyloCtrl'
            $scope.stepNames = ['select area', 'select tree', 'select species']
            $scope.step = 1
            $scope.selectedQ = {q: [], name: '', bs: '', ws: ''}

            // TODO: set the selectedArea from param
          /*  if (param && param.selectedAreas && param.selectedAreas != undefined) {
               
            } else {
                $scope.selectedArea = {area: [{}]}
            } */
            $scope.selectedArea = {area: [{}]}

            $scope.selectedPhylo = {id: ''}

            LayoutService.addToSave($scope)

            $scope.hide = function () {
                $uibModalInstance.close({hide: true});
            }

            $scope.cancel = function () {
                $uibModalInstance.close(null);
            };

            $scope.ok = function (data) {
                if ($scope.step == 4) {

                    //$scope.cancel({noOpen: true})
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
                } else if ($scope.step == 2) {
                    return $scope.selectedPhylo.length == 0
                } else if ($scope.step == 3) {
                    return $scope.selectedQ.q.length == 0
                } else {
                    return false
                }
            }
        }])
}(angular));