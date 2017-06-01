(function (angular) {
    'use strict';
    angular.module('export-sample-ctrl', ['map-service']).controller('ExportSampleCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', 'BiocacheService', '$window', '$uibModalInstance', 'data',
        function ($scope, MapService, $timeout, LayoutService, BiocacheService, $window, $uibModalInstance, config) {

            $scope.stepNames = ['select area', 'select species', 'select layers'];

            if (config && config.step) {
                $scope.step = config.step
            } else {
                $scope.step = 1
            }
            if (config && config.backDisabled) {
                $scope.backDisabled = config.backDisabled
            } else {
                $scope.backDisabled = false
            }

            if (config && config.selectedQ) {
                $scope.preselectedSpeciesOption = config.speciesOption;
                $scope.selectedQ = config.selectedQ
            } else {
                $scope.selectedQ = {q: [], name: '', bs: '', ws: ''}
            }

            if (config && config.selectedArea) {
                $scope.selectedArea = config.selectedArea
            } else {
                $scope.selectedArea = {
                    area: [{
                        q: [],
                        wkt: '',
                        bbox: [],
                        pid: '',
                        name: '',
                        wms: '',
                        legend: ''
                    }]
                }
            }
            $scope.selectedLayers = {layers: []};

            LayoutService.addToSave($scope);

            $scope.ok = function () {
                if ($scope.step === 3) {
                    BiocacheService.newLayer($scope.selectedQ, $scope.selectedArea.area[0], '').then(function (query) {
                        //include redirect to biocache-service/occurrences/search page
                        var sampleUrl = $scope.selectedQ.ws + '/download/options1?searchParams=' + encodeURIComponent('q=' + query.qid) + "&targetUri=/occurrences/search";

                        if ($scope.selectedLayers.layers && ($scope.selectedLayers.layers.length > 0)) {
                            var layers = '';
                            $.map($scope.selectedLayers.layers,
                                function (v, k) {
                                    layers = layers + (layers.length > 0 ? ',' : '') + v.id;
                                });
                            sampleUrl = sampleUrl + '&layers=' + layers;
                        }

                        $scope.downloadUrl = sampleUrl;
                    });
                    $scope.step = $scope.step + 1
                } else if ($scope.step === 4) {
                    $scope.$close();
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
                if ($scope.step === 1) {
                    return $scope.selectedArea.area[0].length === 0 || $scope.selectedArea.area[0] === undefined || !$scope.selectedArea.area[0].name === undefined
                } else if ($scope.step === 2) {
                    return $scope.selectedQ.q.length === 0
                } else {
                    return false
                }
            }
        }])
}(angular));