(function (angular) {
    'use strict';
    angular.module('export-sample-ctrl', ['map-service']).controller('ExportSampleCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance', 'data',
        function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, dialogConfig) {

            $scope.name = 'ExportSampleCtrl'
            $scope.stepNames = ['select area', 'select species', 'select layers', 'reason for download']

            if(dialogConfig && dialogConfig.step) {
                $scope.step = dialogConfig.step
            } else {
                $scope.step = 1
            }

            if(dialogConfig && dialogConfig.selectedQ){
                $scope.preselectedSpeciesOption = dialogConfig.speciesOption
                $scope.selectedQ = dialogConfig.selectedQ
            } else {
                $scope.selectedQ = {q: [], name: '', bs: '', ws: ''}
            }


            if(dialogConfig && dialogConfig.selectedArea){
                $scope.selectedArea = dialogConfig.selectedArea
            } else {
                $scope.selectedArea = {
                    area: {
                    q: [],
                    wkt: '',
                    bbox: [],
                    pid: '',
                    name: '',
                    wms: '',
                    legend: ''
                    }
                }

                $scope.selectedArea = $scope.selectedArea || { area: {
                        q: [],
                        wkt: '',
                        bbox: [],
                        pid: '',
                        name: '',
                        wms: '',
                        legend: ''
                    }
                }
            }
            $scope.selectedLayers = {layers: []}

            $scope.reasonTypeId = 10
            $scope.email = ''

            LayoutService.addToSave($scope)

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
                    if ($scope.selectedArea.area.q && ($scope.selectedArea.area.q.length > 0)) {
                        sampleUrl = sampleUrl + '&fq=' + $scope.selectedArea.area.q
                    }
                    if ( $scope.selectedArea.area.wkt && ($scope.selectedArea.area.wkt.length > 0)) {
                        sampleUrl = sampleUrl + '&wkt=' + $scope.selectedArea.area.wkt
                    }
                    if ($scope.selectedLayers && ($scope.selectedLayers.length > 0)) {
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