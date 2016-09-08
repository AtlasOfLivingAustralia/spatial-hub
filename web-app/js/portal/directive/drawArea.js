(function (angular) {
    'use strict';
    angular.module('draw-area-directive', ['map-service', 'layers-service'])
        .directive('drawArea', ['$rootScope', 'MapService', '$timeout', 'LayersService',

            function ($rootScope, MapService, $timeout, LayersService) {

                return {
                    scope: {
                        custom: '&onCustom',
                        config: '='
                    },
                    templateUrl: 'portal/' + 'drawAreaContent.html',
                    link: function (scope, element, attrs) {
                        scope.name = 'DrawAreaCtrl'

                        scope.type = scope.config.data

                        scope.enableDrawing = function () {
                            if (scope.deleteDrawing)
                                scope.deleteDrawing()

                            if (scope.type == 'drawBoundingBox') {
                                scope.addBox()
                            } else if (scope.type == 'drawPolygon') {
                                scope.addPolygon()
                            } else if (scope.type == 'pointOnLayer') {
                                scope.addMarker()
                            } else if (scope.type == 'drawPointRadius') {
                                scope.addCircle()
                            }
                        }

                        $timeout(function () {
                            scope.enableDrawing()
                        }, 0)

                        scope.selectedArea = MapService.newArea()

                        scope.intersectPoint = ''
                        scope.intersect = {
                            name: '',
                            layer: {},
                            data: {},
                            value: ''
                        }

                        scope.selectLayer = function (layer) {
                            scope.intersect.layer = layer
                            scope.updateIntersect()
                        }

                        scope.cancel = function () {
                            // used by click info popup to check if click came while drawing polygon
                            $rootScope.areaCtrlAreaValue = undefined;
                            
                            scope.deleteDrawing()

                            $rootScope.closePanel()
                        }

                        scope.ok = function (data) {
                            // used by click info popup to check if click came while drawing polygon
                            $rootScope.areaCtrlAreaValue = undefined;

                            scope.addToMap()

                            scope.deleteDrawing()

                            $rootScope.closePanel()
                        }

                        scope.wkt
                        scope.q

                        scope.addToMap = function () {
                            if (scope.intersect.value.length > 0) {
                                LayersService.getObject(scope.intersect.data.pid).then(function (data) {
                                    data.data.layertype = 'area'
                                    data.data.q = scope.q
                                    MapService.add(data.data)
                                })
                            } else {
                                scope.wkt = scope.selectedArea.wkt
                                scope.q = scope.selectedArea.q
                                if (scope.selectedArea.wkt !== undefined && scope.selectedArea.wkt.length > 0) {
                                    LayersService.createFromWkt(scope.selectedArea.wkt, 'test', 'description').then(function (data) {
                                        LayersService.getObject(data.data.id).then(function (data) {
                                            data.data.layertype = 'area'
                                            data.data.wkt = scope.wkt
                                            MapService.add(data.data)
                                        })
                                    })
                                }
                            }
                        }

                        scope.set = function (wms, legend, metadata, q, wkt, name) {
                            scope.selectedArea = {
                                wms: wms,
                                legend: legend,
                                metadata: metadata,
                                q: q,
                                wkt: wkt,
                                name: name
                            }
                        }

                        scope.showWkt = function () {
                            //TODO: validate wkt

                            //display wkt
                            MapService.leafletScope.addWktToMap([scope.selectedArea.wkt])
                        }

                        scope.setWkt = function (wkt) {
                            scope.selectedArea.wkt = wkt
                        }

                        scope.setPid = function (pid) {
                            LayersService.getObject(pid).then(function (obj) {
                                obj = obj.data
                                scope.selectedArea.obj = obj
                                scope.selectedArea.name = obj.name && obj.name.length > 0 ? obj.name : 'area'
                                if (obj.area === undefined || obj.area == 0) {
                                    LayersService.getWkt(pid).then(function (wkt) {
                                        scope.selectedArea.wkt = wkt.data
                                    })
                                } else {
                                    scope.selectedArea.q = [obj.fid + ':"' + obj.name + '"']
                                }
                                scope.selectedArea.pid = pid
                                if (obj.wmsurl !== undefined) {
                                    scope.selectedArea.wms = obj.wmsurl
                                } else {
                                    scope.selectedArea.wms = obj.data.wmsurl
                                }
                            })
                        }

                        scope.addPolygon = function () {
                            $('.leaflet-draw-draw-polygon')[0].click();
                        }

                        scope.addCircle = function () {
                            $('.leaflet-draw-draw-circle')[0].click();
                        }

                        scope.addBox = function () {
                            $('.leaflet-draw-draw-rectangle')[0].click();
                        }

                        scope.addMarker = function () {
                            $('.leaflet-draw-draw-marker')[0].click();
                        }

                        scope.stopDrawing = function () {
                            var a = $('.leaflet-draw-actions a')
                            for (var i = 0; i < a.length; i++) {
                                if (a[i].title === 'Cancel drawing') {
                                    a[i].click()
                                }
                            }
                        }

                        scope.deleteDrawing = function () {
                            scope.stopDrawing()
                            scope.setWkt(null)
                            scope.intersectPoint = ''
                            scope.intersect.value = ''
                            MapService.leafletScope.deleteDrawing()
                        }

                        $rootScope.$on('setWkt', function (event, data) {
                            if (data[0] === 'point') {
                                //points must be layer intersected

                                scope.setWkt(null)
                                scope.intersectPoint = data[1] + ' ' + data[2]

                                scope.updateIntersect()
                            } else {
                                scope.setWkt(data[0])
                            }
                        })

                        scope.updateIntersect = function () {
                            //get selected layer
                            var layers = scope.intersect.layer.id

                            if (layers != null && scope.intersectPoint.length > 0) {
                                //intersect with selected layer
                                var point = scope.intersectPoint.split(' ')
                                LayersService.intersectLayers([layers], point[0], point[1]).then(function (data) {
                                    console.log(data)
                                    if (data.data.length > 0) {
                                        console.log(scope.intersect)

                                        scope.intersect.data = data.data[0]
                                        scope.intersect.value = data.data[0].field + ':"' + data.data[0].value + '"'
                                        scope.q = scope.intersect.value
                                    }
                                })
                            }
                        }
                    }
                };
            }])
}(angular));