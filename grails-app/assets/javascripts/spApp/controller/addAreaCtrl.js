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
                $scope.gazField = $SH.gazField; // used by addAreaContent.tpl.htm
                $scope.config = $SH.config; // used by addAreaContent.tpl.htm

                $scope.step = 'default';
                $scope.area = 'drawBoundingBox';

                $scope.maxFileSize = $SH.maxUploadSize;
                $scope.selectedAreaSize = 0;

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
                $scope.radius = 10;
                $scope.location = '';
                $scope.areaname = '';
                $scope.intersect = {};

                $scope.uploadingFile = false;
                $scope.uploadProgress = 0;

                $scope.selectionDone = false;

                $scope.circle = {
                    longitude: '',
                    latitude: ''
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
                        } else if ($scope.area === 'drawPolyline') {
                            LayoutService.openPanel('area', $scope.area, false)
                        } else if ($scope.area === 'addressRadius') {
                        } else if ($scope.area === 'pointRadius') {
                        } else if ($scope.area === 'gazetteer') {
                        } else if ($scope.area.match(/^preset_/g) != null) {
                            for (var i = 0; i < $scope.defaultAreas.length; i++) {
                                var v = $scope.defaultAreas[i].name;
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
                        } else if ($scope.area === 'mergeArea') {
                            LayoutService.openModal('tool', {processName: 'MergeAreas'}, false);
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
                        } else if ($scope.area.match(/^preset_/g) != null) {
                            //n/a
                        } else if ($scope.area === 'importShapefile') {
                            var featureIdxs = $scope.areaList.filter(function (area) {
                                return area.selected || false
                            }).map(function (area) {
                                return area.id
                            }).join();

                            LayersService.createArea($scope.myAreaName, $scope.fileName, $scope.shapeId, featureIdxs)
                            .then(
                                //Success
                                function (response) {
                                        if (response.data.error) {
                                            bootbox.alert(
                                                "(Error: "  + response.data.error + ")");
                                        } else {
                                            $scope.setPid(response.data.id, true)
                                        }
                                },
                                //Error
                                function(error) {
                                    if (!error.handled) {
                                        if (error.data.error) {
                                            bootbox.alert("Error:" + error.data.error);
                                        } else {
                                            bootbox.alert($i18n(540, "An error occurred. Please try again and if the same error occurs, send an email to support@ala.org.au and include the URL to this page, the error message and what steps you performed that triggered this error."));
                                        }
                                    }
                                }
                            );

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
                            $scope.selectedArea.name += ' (' + $scope.radius + 'km radius)';
                            $scope.selectedArea.wkt = Util.createCircle(parseFloat(coord[0]), parseFloat(coord[1]), $scope.radius * 1000)
                        }
                        if ($scope.selectedArea.wkt !== undefined && $scope.selectedArea.wkt.length > 0) {
                            if ($scope.selectedArea.area !== undefined && $scope.selectedArea.q !== undefined && $scope.selectedArea.q.length > 0) {
                                $scope.selectedArea.layertype = 'area';
                                MapService.add($scope.selectedArea);
                            } else {
                                closingLater = true;
                                LayersService.createFromWkt($scope.selectedArea.wkt, $scope.selectedArea.name, '').then(
                                    function (data) {
                                        if (!data.data.id) {
                                            if (data.data.error) {
                                                bootbox.alert(data.data.error)
                                            } else {
                                                bootbox.alert($i18n(540,"An error occurred. Please try again and if the same error occurs, send an email to support@ala.org.au and include the URL to this page, the error message and what steps you performed that triggered this error."));
                                            }

                                        } else {
                                            LayersService.getObject(data.data.id).then(function (data) {
                                                LayersService.getWkt(data.data.id).then(function (wkt) {
                                                    data.data.layertype = 'area';
                                                    data.data.wkt = wkt.data;
                                                    MapService.zoomToExtents(data.data.bbox);
                                                    MapService.add(data.data);
                                                    $scope.$close()
                                                })
                                            })
                                        }
                                    }, function(error) {
                                        if (!error.handled){
                                            if (error.data.error) {
                                                bootbox.alert("Error:" + error.data.error);
                                            } else {
                                                bootbox.alert($i18n(540,"An error occurred. Please try again and if the same error occurs, send an email to support@ala.org.au and include the URL to this page, the error message and what steps you performed that triggered this error."));
                                            }
                                        }
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
                    $scope.setWkt(Util.createCircle($scope.circle.longitude, $scope.circle.latitude, $scope.radius * 1000))
                };

                $scope.useAddress = function () {
                    var coords = $scope.location.split(',');
                    $scope.selectedArea.name += ' (' + $scope.radius + 'km radius)';
                    $scope.setWkt(Util.createCircle(coords[1] * 1, coords[0] * 1, $scope.radius * 1000))
                };

                $scope.selectShpArea = function () {
                    var selected = "";

                    var userSelectedArea = $scope.areaList.filter(function (area) {
                        return area.selected || false
                    });

                    $scope.selectedAreaSize = 0;
                    userSelectedArea.forEach(function(area){
                        $scope.selectedAreaSize += area.values['AREA'] //Sum areas
                    })


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
                    $scope.selectedAreaSize = 0;
                    if($scope.checkAll){
                        $scope.areaList.forEach(function(area){
                            $scope.selectedAreaSize += area.values['AREA'] //Sum areas
                        })
                    }

                    $scope.shpImg = LayersService.getShpImageUrl($scope.shapeId, "all");
                };

                $scope.uploadFile = function (newFiles) {

                    if (newFiles == null || newFiles.length == 0) {
                        return
                    }

                    var file = newFiles[0]

                    if (file.$error) {
                        if (file.$errorMessages.maxSize) {
                            bootbox.alert($i18n(476, "The uploaded file is too large. Max file size:") + " " + Math.floor($scope.maxFileSize / 1024 / 1024) + "MB");
                            return
                        }
                    }

                    if ($scope.area === 'importShapefile' && file.type.indexOf('zip') < 0) {
                        bootbox.alert($i18n(333, "The uploaded file must be shape zipped file"));
                        return;
                    }

                    $scope.uploadingFile = true;

                    LayersService.uploadAreaFile(file, $scope.area, $scope.myAreaName, file.name).then(function (response) {
                        if (response.data.error) {
                            $scope.errorMsg = response.data.error
                            $scope.uploadingFile = false;
                            bootbox.alert($scope.errorMsg);
                            $scope.uploadingFile = false;
                            return
                        }

                        if (!response.data.shapeId) {
                            $scope.errorMsg = $i18n(477, "Upload failed.")
                            $scope.uploadingFile = false;
                            bootbox.alert($scope.errorMsg);
                            $scope.uploadingFile = false;
                            return
                        }

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
                    }, function (error) {
                        if (!error.handled) {
                            if (error.status == 500) {
                                $scope.errorMsg = "Unexpected error: the uploaded file may be broken or unrecognised.";
                            } else {
                                if (error.data.error) {
                                    $scope.errorMsg = error.data.error;
                                } else {
                                    $scope.errorMsg = $i18n(540,"An error occurred. Please try again and if the same error occurs, send an email to support@ala.org.au and include the URL to this page, the error message and what steps you performed that triggered this error.");
                                }
                            }
                            bootbox.alert($scope.errorMsg);
                        }
                        $scope.uploadingFile = false;

                    }, function (evt) {
                        $scope.uploadProgress = parseInt(100.0 * evt.loaded / evt.total);
                    });
                };

                $scope.showWkt = function () {
                    MapService.leafletScope.addWktToMap([$scope.selectedArea.wkt])
                };

                $scope.showLocationRadius = function () {
                    return $scope.selectedArea !== undefined && $scope.selectedArea.wkt !== undefined && $scope.selectedArea.wkt.match(/^POINT/) != null;
                };

                $scope.setWkt = function (wkt) {
                    $scope.selectedArea.wkt = wkt
                };

                $scope.selectArea = function (area) {
                    $scope.area = area;
                };

                $scope.setPid = function (pid, mapNow) {
                    // TODO: disable UI while fetching object, field and wkt info

                    LayersService.getObject(pid).then(function (obj) {
                        obj = obj.data;
                        $scope.selectedArea.obj = obj;
                        $scope.selectedArea.name = obj.name.length > 0 ? obj.name : $i18n(354, "area");
                        LayersService.getField(obj.fid, 0, 0, '').then(function (data) {
                            // only fetch wkt if it is not indexed in biocache
                            $scope.selectedArea.pid = obj.pid;
                            $scope.selectedArea.wms = obj.wmsurl;

                            if (data.data === undefined || data.data.id === undefined || !data.data.indb) {
                                LayersService.getWkt(pid).then(function (wkt) {
                                    $scope.selectedArea.wkt = wkt.data
                                    $scope.selectedArea.obj.wkt = wkt.data
                                    if (mapNow) {
                                        $scope.addToMapAndClose();
                                    }
                                })
                            } else {
                                $scope.selectedArea.q = obj.fid + ':"' + obj.name + '"';
                                $scope.selectedArea.obj.q = $scope.selectedArea.q

                                if (mapNow) {
                                    $scope.addToMapAndClose();
                                }
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
                    } else if ($scope.area.match(/^preset_/g) != null) {
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
