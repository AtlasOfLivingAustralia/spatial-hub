(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name AddAreaCtrl
     * @description
     *   Add an area to the map
     */
    angular.module('add-area-ctrl', ['map-service', 'layers-service', 'predefined-areas-service'])
        .controller('AddAreaCtrl', ['LayoutService', '$scope', 'MapService', '$timeout', 'LayersService',
            '$uibModalInstance', 'PredefinedAreasService', 'data',
            function (LayoutService, $scope, MapService, $timeout, LayersService, $uibModalInstance, PredefinedAreasService, inputData) {

                $scope.inputData = inputData;

                $scope.step = 'default';
                $scope.area = 'drawBoundingBox';

                if (inputData !== undefined && inputData.importArea === true) {
                    $scope.area = 'importShapefile';
                }

                $scope.defaultAreas = PredefinedAreasService.getList();
                $scope.selectedArea = {
                    name: $i18n(332, "new area"),
                    wkt: '',
                    q: [],
                    legend: '',
                    metadata: '',
                    wms: ''
                };
                $scope.locationRadius = 10;
                $scope.location = '';
                $scope.areaname = '';
                $scope.intersect = {};

                $scope.uploadingFile = false;
                $scope.uploadProgress = 0;

                $scope.selectionDone = false;

                $scope.circle = {
                    longitude: '',
                    latitude: '',
                    radius: '10'
                };

                $scope.myAreaName = $i18n(332, "new area");

                $scope.$watch('area', function (newValue) {
                    // used by click info popup to check if click came while drawing polygon
                    LayoutService.areaCtrlAreaValue = newValue;
                });

                LayoutService.addToSave($scope);

                $scope.ok = function () {
                    if ($scope.step === 'default') {
                        $scope.step = $scope.area;
                        if ($scope.area === 'drawBoundingBox') {
                            LayoutService.openPanel('area', $scope.area, false)
                        } else if ($scope.area === 'drawPolygon') {
                            LayoutService.openPanel('area', $scope.area, false)
                        } else if ($scope.area === 'drawPointRadius') {
                            LayoutService.openPanel('area', $scope.area, false)
                        } else if ($scope.area === 'pointOnLayer') {
                            LayoutService.openPanel('area', $scope.area, false)
                        } else if ($scope.area === 'addressRadius') {
                        } else if ($scope.area === 'pointRadius') {
                        } else if ($scope.area === 'gazetteer') {
                        } else if ($scope.area.match(/^preset_/g)) {
                            for (var i = 0; i < $scope.defaultAreas.length; i++) {
                                var v = $scope.defaultAreas[i].name.replace(' ', '_');
                                if ($scope.area.indexOf(v) == $scope.area.length - v.length) {
                                    $scope.selectedArea.name = $scope.defaultAreas[i].name;
                                    $scope.selectedArea.wkt = $scope.defaultAreas[i].wkt;
                                    break;
                                }
                            }
                            $scope.addToMapAndClose();
                        } else if ($scope.area === 'importShapefile' || $scope.area === 'importKML') {
                            $scope.uploadProgress = 0;
                        } else if ($scope.area === 'environmentalEnvelope') {
                            LayoutService.openPanel('envelope', $scope.area, false)
                        } else if ($scope.area === 'wkt') {
                        }
                    } else {
                        var mapNow = true;
                        if ($scope.area === 'drawBoundingBox') {
                            //n/a
                        } else if ($scope.area === 'drawPolygon') {
                            //n/a
                        } else if ($scope.area === 'drawPointRadius') {
                            //n/a
                        } else if ($scope.area === 'pointOnLayer') {
                            //n/a
                        } else if ($scope.area === 'addressRadius') {
                            $scope.useAddress()
                        } else if ($scope.area === 'pointRadius') {
                            $scope.createCircle()
                        } else if ($scope.area === 'gazetteer') {
                        } else if ($scope.area.match(/^preset_/g)) {
                            //n/a
                        } else if ($scope.area === 'importShapefile') {
                            var featureIdxs = $scope.areaList.filter(function (area) {
                                return area.selected || false
                            }).map(function (area) {
                                return area.id
                            }).join();

                            LayersService.createArea($scope.myAreaName, $scope.fileName, $scope.shapeId, featureIdxs).then(function (response) {
                                if (response.data.error) {
                                    bootbox.alert("No areas selected. Points cannot be imported from a shapefile. (Error: " + response.data.error + ")");
                                } else
                                    $scope.setPid(response.data.id, true)
                            });

                            mapNow = false
                        } else if ($scope.area === 'importKML') {
                            //n/a
                        } else if ($scope.area === 'environmentalEnvelope') {
                            //n/a
                        } else if ($scope.area === 'wkt') {
                        }
                        if (mapNow) {
                            $scope.addToMapAndClose();
                        }
                    }
                };

                $scope.addToMapAndClose = function () {
                    var closingLater = false;
                    if ($scope.selectedArea.obj !== undefined && !$scope.isPoint()) {
                        $scope.selectedArea.obj.layertype = 'area';
                        MapService.zoomToExtents($scope.selectedArea.obj.bbox);
                        MapService.add($scope.selectedArea.obj);
                    } else {
                        if ($scope.isPoint()) {
                            //create circle
                            var coord = $scope.selectedArea.wkt.match(/\((.*)\)/)[1].split(" ");
                            $scope.selectedArea.name += ' (' + $scope.locationRadius + 'km radius)';
                            $scope.selectedArea.wkt = Util.createCircle(parseFloat(coord[0]), parseFloat(coord[1]), $scope.circle.radius * 1000)
                        }
                        if ($scope.selectedArea.wkt !== undefined && $scope.selectedArea.wkt.length > 0) {
                            if ($scope.selectedArea.area !== undefined && $scope.selectedArea.q !== undefined && $scope.selectedArea.q.length > 0) {
                                $scope.selectedArea.layertype = 'area';
                                MapService.add($scope.selectedArea);
                            } else {
                                closingLater = true;
                                LayersService.createFromWkt($scope.selectedArea.wkt, $scope.selectedArea.name, '').then(function (data) {
                                    LayersService.getObject(data.data.id).then(function (data) {
                                        data.data.layertype = 'area';
                                        data.data.wkt = $scope.selectedArea.wkt;
                                        MapService.zoomToExtents(data.data.bbox);
                                        MapService.add(data.data);
                                        $scope.$close()
                                    })
                                })
                            }
                        }
                    }
                    if (!closingLater)
                        $scope.$close()
                };

                $scope.set = function (wms, legend, metadata, q, wkt, name) {
                    $scope.selectedArea = {
                        wms: wms,
                        legend: legend,
                        metadata: metadata,
                        q: q,
                        wkt: wkt,
                        name: name
                    }
                };

                $scope.createCircle = function () {
                    $scope.setWkt(Util.createCircle($scope.circle.longitude, $scope.circle.latitude, $scope.circle.radius * 1000))
                };

                $scope.useAddress = function () {
                    var coords = $scope.location.split(',');
                    $scope.selectedArea.name += ' (' + $scope.locationRadius + 'km radius)';
                    $scope.setWkt(Util.createCircle(coords[1] * 1, coords[0] * 1, $scope.locationRadius * 1000))
                };

                $scope.selectShpArea = function () {
                    var selected = "";
                    var userSelectedArea = $scope.areaList.filter(function (area) {
                        return area.selected || false
                    });
                    if (userSelectedArea.length === $scope.areaList.length) {
                        selected = "all";
                        $scope.checkAll = true;
                    } else {
                        selected = userSelectedArea.map(function (area) {
                            return area.id
                        }).join();
                        $scope.checkAll = false;
                    }
                    $scope.shpImg = LayersService.getShpImageUrl($scope.shapeId, selected);
                };

                $scope.toggleAllAreaCheckbox = function () {
                    angular.forEach($scope.areaList, function (area) {
                        area.selected = $scope.checkAll;
                    });
                    $scope.shpImg = LayersService.getShpImageUrl($scope.shapeId, "all");
                };

                $scope.uploadFile = function (file) {

                    if ($scope.area === 'importShapefile' && file.type !== 'application/zip') {
                        bootbox.alert($i18n(333, "The uploaded file must be shape zipped file"));
                        return;
                    }

                    $scope.uploadingFile = true;

                    LayersService.uploadAreaFile(file, $scope.area, $scope.myAreaName, file.name).then(function (response) {

                        $scope.fileName = file.name;
                        if ($scope.area === 'importShapefile') {
                            $scope.shapeId = response.data.shapeId;
                            $scope.areaHeader = [];
                            $scope.areaList = response.data.area;

                            if (response.data.area.length > 0) {
                                $scope.areaHeader = Object.keys(response.data.area[0].values);
                                $scope.shpImg = LayersService.getShpImageUrl($scope.shapeId, "all");
                                if (response.data.area.length == 1) {
                                    $scope.areaList[0].selected = true
                                }
                            }
                        } else if ($scope.area === 'importKML') {
                            if (response.data.shapeId) {
                                $scope.setPid(response.data.shapeId, true);
                                $scope.step = 'default';
                            }
                        }
                        $scope.myAreaName = file.name;
                        $scope.selectionDone = true;
                        file.result = response.data;
                        $scope.uploadingFile = false;
                    }, function (response) {
                        $scope.errorMsg = response.status + ': ' + response.data;
                        $scope.uploadingFile = false;
                    }, function (evt) {
                        $scope.uploadProgress = parseInt(100.0 * evt.loaded / evt.total);
                    });
                };

                $scope.showWkt = function () {
                    MapService.leafletScope.addWktToMap([$scope.selectedArea.wkt])
                };

                $scope.showLocationRadius = function () {
                    return $scope.selectedArea !== undefined && $scope.selectedArea.wkt !== undefined && $scope.selectedArea.wkt.match(/^POINT/);
                };

                $scope.setWkt = function (wkt) {
                    $scope.selectedArea.wkt = wkt
                };

                $scope.setPid = function (pid, mapNow) {
                    // TODO: disable UI while fetching object, field and wkt info

                    LayersService.getObject(pid).then(function (obj) {
                        obj = obj.data;
                        $scope.selectedArea.obj = obj;
                        $scope.selectedArea.name = obj.name.length > 0 ? obj.name : $i18n(354, "area");
                        LayersService.getField(obj.fid, 0, 0, '').then(function (data) {
                            // only fetch wkt if it is not indexed in biocache
                            if (data.data === undefined || data.data.id === undefined || !data.data.indb) {
                                LayersService.getWkt(pid).then(function (wkt) {
                                    $scope.selectedArea.wkt = wkt.data
                                })
                            } else {
                                $scope.selectedArea.q = obj.fid + ':"' + obj.name + '"';
                                $scope.selectedArea.obj.q = $scope.selectedArea.q
                            }
                            $scope.selectedArea.pid = obj.pid;
                            $scope.selectedArea.wms = obj.wmsurl;

                            if (mapNow) {
                                $scope.addToMapAndClose();
                            }
                        })
                    })
                };

                $scope.isDisabled = function () {
                    if ($scope.step === 'default') {
                    } else if ($scope.area === 'addressRadius') {
                        return $scope.location.length === 0
                    } else if ($scope.area === 'pointRadius') {
                        return $scope.circle.longitude.length === 0 || $scope.circle.latitude.length === 0
                    } else if ($scope.area === 'gazetteer') {
                        return $scope.selectedArea.pid === undefined
                    } else if ($scope.area.match(/^preset_/g)) {
                    } else if ($scope.area === 'importShapefile' || $scope.area === 'importKML') {
                        if ($scope.areaList) {
                            return $scope.areaList.filter(function (area) {
                                return area.selected || false
                            }).length === 0
                        } else {
                            return true
                        }
                    } else if ($scope.area === 'environmentalEnvelope') {
                    } else if ($scope.area === 'wkt') {
                        return $scope.selectedArea.wkt === undefined || $scope.selectedArea.wkt.length === 0
                    }
                    return false
                };

                $scope.isPoint = function () {
                    return $scope.selectedArea !== undefined && $scope.selectedArea.obj !== undefined && $scope.selectedArea.obj.area_km === 0
                };

                $scope.isLoggedIn = $scope.isLoggedIn = $SH.userId !== undefined && $SH.userId !== null && $SH.userId.length > 0;
                $scope.isNotLoggedIn = !$scope.isLoggedIn;
            }])
}(angular));