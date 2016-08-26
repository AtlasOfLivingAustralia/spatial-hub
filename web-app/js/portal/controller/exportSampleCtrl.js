(function (angular) {
    'use strict';
    angular.module('export-sample-ctrl', ['map-service']).
    controller('ExportSampleCtrl', ['$scope', 'MapService', '$timeout', '$rootScope', '$uibModalInstance',
        function ($scope, MapService, $timeout, $rootScope, $uibModalInstance) {

            $scope.name = 'ExportSampleCtrl'
            $scope.stepNames = ['select area', 'select species', 'select layers', 'reason for download']
            $scope.step = $rootScope.getValue($scope.name, 'step', 1);
            $scope.selectedQ = $rootScope.getValue($scope.name, 'selectedQ', {q: [], name: '', bs: '', ws: ''})
            $scope.selectedArea = $rootScope.getValue($scope.name, 'selectedArea', {
                area: {
                    q: [],
                    wkt: '',
                    bbox: [],
                    pid: '',
                    name: '',
                    wms: '',
                    legend: ''
                }
            })
            $scope.selectedLayers = $rootScope.getValue($scope.name, 'selectedLayers', {layers: []});

            $scope.reasonTypeId = $rootScope.getValue($scope.name, 'reasonTypeId', 10);
            $scope.email = $rootScope.getValue($scope.name, 'email', '');

            $rootScope.addToSave($scope)

            $scope.hide = function () {
                $uibModalInstance.close({hide: true});
            }

            $scope.cancel = function () {
                $uibModalInstance.close(null);
            };

            $scope.ok = function (data) {
                if ($scope.step == 4) {

                    //if ($scope.selectedArea.area.wkt == 'Current extent') {
                    //    var extents = MapService.getExtents()
                    //    $scope.selectedArea.area.wkt = 'POLYGON((' + extents[0] + ' ' + extents[1] + ',' + extents[0] + ' ' + extents[3] +
                    //        ',' + extents[2] + ' ' + extents[3] + ',' + extents[2] + ' ' + extents[1] +
                    //        ',' + extents[0] + ' ' + extents[1] + '))'
                    //    $scope.selectedArea.area.q = 'longitude:[' + extents[0] + ' TO ' + extents[2] + ']&fq=latitude:[' + extents[1] + ' TO ' + extents[3] + ']'
                    //}


                    var sampleUrl = SpatialPortalConfig.biocacheServiceUrl + '/occurrences/index/download?reasonTypeId=' + $scope.reasonTypeId +
                        '&q=' + $scope.selectedQ.q.join('&fq=')
                    if ($scope.selectedArea.area.q.length > 0) {
                        sampleUrl = sampleUrl + '&fq=' + $scope.selectedArea.area.q
                    }
                    if ($scope.selectedArea.area.wkt.length > 0) {
                        sampleUrl = sampleUrl + '&wkt=' + $scope.selectedArea.area.wkt
                    }
                    if ($scope.selectedLayers.length > 0) {
                        sampleUrl = sampleUrl + '&extra=' & $scope.selectedLayers.join(',')
                    }

                    console.log(sampleUrl)

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
                } else if ($scope.step == 2) {
                    return $scope.selectedQ.q.length == 0
                } else {
                    return false
                }
            }
        }])
}(angular));