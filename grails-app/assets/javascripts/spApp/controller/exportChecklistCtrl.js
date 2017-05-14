(function (angular) {
    'use strict';
    angular.module('export-checklist-ctrl', ['biocache-service', 'map-service'])
        .controller('ExportChecklistCtrl', ['$q', '$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance', 'BiocacheService', 'data',
            function ($q, $scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, config) {

                $scope.stepNames = ['select area'];
                if (config && config.step) {
                    $scope.step = config.step
                } else {
                    $scope.step = 1
                }

                if (config && config.selectedArea) {
                    $scope.selectedArea = config.selectedArea
                } else {
                    $scope.selectedArea = {
                        area: [{
                            q: [],
                            wkt: '',
                            bbox: [],
                            name: '',
                            wms: '',
                            legend: ''
                        }]
                    }
                }

                $scope.endemic = false;
                $scope.geospatialkosherfalse = false;
                $scope.geospatialkoshertrue = true;

                $scope.downloading = false;
                $scope.downloadSize = 0;

                LayoutService.addToSave($scope);

                $scope.cancel = function (data) {
                    if ($scope.cancelDownload) $scope.cancelDownload.resolve();
                    $scope.$close();
                };

                $scope.ok = function (showPreview) {
                    if ($scope.step === 1) {

                        var q = [];
                        var wkt = undefined;
                        if ($scope.selectedArea.area[0].q && ($scope.selectedArea.area[0].q.length > 0)) {
                            q = $scope.selectedArea.area[0].q
                        } else if ($scope.selectedArea.area[0].wkt.length > 0) {
                            q = ['*:*'];
                            wkt = $scope.selectedArea.area[0].wkt;
                        }

                        if ($scope.geospatialkoshertrue && $scope.geospatialkosherfalse) q = q.concat(["geospatial_kosher:*"]);
                        else if ($scope.geospatialkoshertrue) q = q.concat(["geospatial_kosher:true"]);
                        else if ($scope.geospatialkosherfalse) q = q.concat(["geospatial_kosher:false"]);
                        else q = q.concat(["-geospatial_kosher:*"]);

                        var query = BiocacheService.newQuery(q, '', wkt);

                        var future;
                        if (showPreview) {
                            $scope.downloading = true;
                            $scope.cancelDownload = $q.defer();

                            var config = {
                                eventHandlers: {
                                    progress: function (c) {
                                        $scope.downloadSize = c.loaded
                                    }
                                },
                                timeout: $scope.cancelDownload.promise
                            };

                            future = $scope.endemic ? BiocacheService.speciesListEndemic(query, undefined, config) :
                                BiocacheService.speciesList(query, undefined, config);

                            future.then(function (data) {
                                $scope.cancelDownload.resolve();
                                $scope.openCsv(data);
                            })
                        } else {
                            if ($scope.cancelDownload) $scope.cancelDownload.resolve();
                            future = $scope.endemic ? BiocacheService.speciesListEndemicUrl(query) :
                                BiocacheService.speciesListUrl(query);

                            future.then(function (url) {
                                Util.download(url);
                                $scope.close();
                            })
                        }
                    } else {
                        $scope.step = $scope.step + 1
                    }
                };

                $scope.openCsv = function (csv) {
                    LayoutService.openModal('csv', {
                        title: ($scope.endemic ? 'Endemic ' : '') + 'Species List',
                        csv: csv,
                        info: '',
                        filename: ($scope.endemic ? 'endemicS' : 's') + 'peciesList.csv',
                        display: {size: 'full'}
                    }, false)
                };

                $scope.back = function () {
                    if ($scope.step > 1) {
                        $scope.step = $scope.step - 1
                    }
                };

                $scope.isDisabled = function () {
                    if ($scope.step === 1) {
                        return $scope.selectedArea.area.length === 0 || $scope.selectedArea.area[0] === undefined ||
                            $scope.selectedArea.area[0].name === undefined
                    }
                }
            }])
}(angular));