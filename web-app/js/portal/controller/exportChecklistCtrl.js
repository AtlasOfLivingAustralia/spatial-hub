(function (angular) {
    'use strict';
    angular.module('export-checklist-ctrl', ['biocache-service', 'map-service'])
        .controller('ExportChecklistCtrl', ['$scope', 'MapService', '$timeout', '$rootScope', '$uibModalInstance', 'BiocacheService',
            function ($scope, MapService, $timeout, $rootScope, $uibModalInstance, BiocacheService) {

                $scope.name = 'exportChecklistCtrl'
                $scope.stepNames = ['select area']
                $scope.step = $rootScope.getValue($scope.name, 'step', 1);
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

                        //if ($scope.selectedArea.area.wkt == 'Current extent') {
                        //    var extents = MapService.getExtents()
                        //    $scope.selectedArea.area.wkt = 'POLYGON((' + extents[0] + ' ' + extents[1] + ',' + extents[0] + ' ' + extents[3] +
                        //        ',' + extents[2] + ' ' + extents[3] + ',' + extents[2] + ' ' + extents[1] +
                        //        ',' + extents[0] + ' ' + extents[1] + '))'
                        //    $scope.selectedArea.area.q = 'longitude:[' + extents[0] + ' TO ' + extents[2] + ']&fq=latitude:[' + extents[1] + ' TO ' + extents[3] + ']'
                        //}

                        var q = ''
                        if ($scope.selectedArea.area.q.length > 0) {
                            q = $scope.selectedArea.area.q
                        }
                        if ($scope.selectedArea.area.wkt.length > 0) {
                            q = '*:*&wkt=' + $scope.selectedArea.area.wkt
                        }

                        console.log(q)

                        BiocacheService.speciesList(q).then(function (data) {

                            console.log(data)

                            $scope.cancel({noOpen: true})
                            $rootScope.openModal('csv', {
                                title: 'Species List',
                                csv: data,
                                info: 'species list csv',
                                filename: 'speciesList.csv'
                            })
                        })
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
                    }
                }
            }])
}(angular));