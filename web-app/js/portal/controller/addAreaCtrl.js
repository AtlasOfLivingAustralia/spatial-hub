(function (angular) {
    'use strict';
    angular.module('add-area-ctrl', ['map-service', 'layers-service', 'predefined-areas-service'])
        .controller('AddAreaCtrl', ['$rootScope', '$scope', 'MapService', '$timeout', 'LayersService',
            '$uibModalInstance', 'PredefinedAreasService',
            function ($rootScope, $scope, MapService, $timeout, LayersService, $uibModalInstance, PredefinedAreasService) {
                $scope.name = 'AddAreaCtrl'

                $scope.hide = function () {
                    $uibModalInstance.close({hide: true});
                }

                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };

                $scope.step = $rootScope.getValue($scope.name, 'step', 'default')
                $scope.area = $rootScope.getValue($scope.name, 'area', 'drawBoundingBox')
                $scope.defaultAreas = PredefinedAreasService.getList()
                $scope.selectedArea = $rootScope.getValue($scope.name, 'selectedArea', {
                    name: 'new area',
                    wkt: '',
                    q: [],
                    legend: '',
                    metadata: '',
                    wms: ''
                })
                $scope.locationRadius = $rootScope.getValue($scope.name, 'locationRadius', 10)
                $scope.location = $rootScope.getValue($scope.name, 'location', '')
                $scope.areaname = $rootScope.getValue($scope.name, 'areaname', '')
                $scope.intersect = $rootScope.getValue($scope.name, 'intersect', {})

                $scope.testv = $rootScope.getValue($scope.name, 'testv', {
                    a: '',
                    minx: ''
                })

                $scope.circle = $rootScope.getValue($scope.name, 'circle', {
                    longitude: '',
                    latitude: '',
                    radius: '10'
                })

                $rootScope.addToSave($scope)

                $scope.ok = function (data) {
                    if ($scope.step == 'default') {
                        $scope.step = $scope.area
                        if ($scope.area == 'drawBoundingBox') {
                            $scope.cancel({noOpen: true})
                            $rootScope.openPanel('area', $scope.area, {type: 'drawBox'})
                        } else if ($scope.area == 'drawPolygon') {
                            $scope.cancel({noOpen: true})
                            $rootScope.openPanel('area', $scope.area, {type: 'drawPolygon'})
                        } else if ($scope.area == 'drawPointRadius') {
                            $scope.cancel({noOpen: true})
                            $rootScope.openPanel('area', $scope.area, {type: 'drawCircle'})
                        } else if ($scope.area == 'pointOnLayer') {
                            $scope.cancel({noOpen: true})
                            $rootScope.openPanel('area', $scope.area, {type: 'layerIntersect'})
                        } else if ($scope.area == 'addressRadius') {
                        } else if ($scope.area == 'pointRadius') {
                        } else if ($scope.area == 'gazetteer') {
                        } else if ($scope.area.startsWith('preset_')) {
                            for (var i = 0; i < $scope.defaultAreas.length; i++) {
                                if ($scope.area.endsWith($scope.defaultAreas[i].name.replace(' ', '_'))) {
                                    $scope.selectedArea.name = $scope.defaultAreas[i].name
                                    $scope.selectedArea.wkt = $scope.defaultAreas[i].wkt
                                    break;
                                }
                            }
                            $scope.addToMap()
                            $scope.cancel()
                        } else if ($scope.area == 'importShapefile') {
                        } else if ($scope.area == 'importKML') {
                        } else if ($scope.area == 'environmentalEnvelope') {
                            $scope.cancel({noOpen: true})
                            $rootScope.openPanel('envelope', $scope.area)
                        } else if ($scope.area == 'wkt') {
                        }
                    } else {
                        if ($scope.area == 'drawBoundingBox') {
                            //n/a
                        } else if ($scope.area == 'drawPolygon') {
                            //n/a
                        } else if ($scope.area == 'drawPointRadius') {
                            //n/a
                        } else if ($scope.area == 'pointOnLayer') {
                            //n/a
                        } else if ($scope.area == 'addressRadius') {
                            $scope.useAddress()
                        } else if ($scope.area == 'pointRadius') {
                            $scope.createCircle()
                        } else if ($scope.area == 'gazetteer') {
                        } else if ($scope.area.startsWith('preset_')) {
                            //n/a
                        } else if ($scope.area == 'importShapefile') {
                        } else if ($scope.area == 'importKML') {
                        } else if ($scope.area == 'environmentalEnvelope') {
                            //n/a
                        } else if ($scope.area == 'wkt') {
                        }
                        $scope.addToMap()
                        $scope.cancel()
                    }
                };


                $scope.addToMap = function () {
                    if ($scope.selectedArea.obj !== undefined) {
                        $scope.selectedArea.obj.layertype = 'area'
                        MapService.add($scope.selectedArea.obj)
                    } else {
                        if ($scope.selectedArea.wkt !== undefined && $scope.selectedArea.wkt.length > 0) {
                            if ($scope.selectedArea.area !== undefined && $scope.selectedArea.q !== undefined) {
                                $scope.selectedArea.layertype = 'area'
                                MapService.add($scope.selectedArea)
                            } else {
                                LayersService.createFromWkt($scope.selectedArea.wkt, 'test', 'description').then(function (data) {
                                    LayersService.getObject(data.data.id).then(function (data) {
                                        data.data.layertype = 'area'
                                        data.data.wkt = $scope.selectedArea.wkt
                                        MapService.add(data.data)
                                    })
                                })
                            }
                        }
                    }
                }

                $scope.set = function (wms, legend, metadata, q, wkt, name) {
                    $scope.selectedArea = {
                        wms: wms,
                        legend: legend,
                        metadata: metadata,
                        q: q,
                        wkt: wkt,
                        name: name
                    }
                }

                $scope.createCircle = function () {
                    $scope.setWkt(Util.createCircle($scope.circle.longitude, $scope.circle.latitude, $scope.circle.radius * 1000))
                }

                $scope.useAddress = function () {
                    var coords = $scope.location.split(',')
                    $scope.selectedArea.name = $scope.areaname
                    $scope.setWkt(Util.createCircle(coords[1] * 1, coords[0] * 1, $scope.locationRadius * 1000))
                    //$scope.showWkt()
                }

                $scope.showWkt = function () {
                    //validate wkt

                    //display wkt
                    //$rootScope.$emit('addWktToMap', [$scope.area.wkt])
                    MapService.leafletScope.addWktToMap([$scope.selectedArea.wkt])
                }

                $scope.setWkt = function (wkt) {
                    //if (wkt === 'Current extent') {
                    //    var extents = MapService.getExtents()
                    //    wkt = 'POLYGON((' + extents[0] + ' ' + extents[1] + ',' + extents[0] + ' ' + extents[3] +
                    //        ',' + extents[2] + ' ' + extents[3] + ',' + extents[2] + ' ' + extents[1] +
                    //        ',' + extents[0] + ' ' + extents[1] + '))'
                    //}
                    $scope.selectedArea.wkt = wkt
                }

                $scope.setPid = function (pid) {
                    LayersService.getObject(pid).then(function (obj) {
                        obj = obj.data
                        $scope.selectedArea.obj = obj
                        $scope.selectedArea.name = obj.name.length > 0 ? obj.name : 'area'
                        LayersService.getField(obj.fid, 0, 0, '').then(function (data) {
                            if (data.data === undefined || data.data.id === undefined) {
                                LayersService.getWkt(pid).then(function (wkt) {
                                    $scope.selectedArea.wkt = wkt
                                })
                            } else {
                                $scope.selectedArea.q = obj.fid + ':"' + obj.name + '"'
                                $scope.selectedArea.obj.q = $scope.selectedArea.q
                            }
                            $scope.selectedArea.pid = obj.pid
                            $scope.selectedArea.wms = obj.wmsurl
                        })
                    })
                }
            }])
}(angular));