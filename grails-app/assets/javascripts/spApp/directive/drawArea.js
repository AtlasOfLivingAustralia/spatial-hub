(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name drawArea
     * @description
     *   A panel with controls for drawing a new area on the map
     */
    angular.module('draw-area-directive', ['map-service', 'layers-service', 'layout-service'])
        .directive('drawArea', ['$rootScope', 'LayoutService', 'MapService', '$timeout', 'LayersService', 'LoggerService',
            function ($rootScope, LayoutService, MapService, $timeout, LayersService, LoggerService) {

                return {
                    scope: {
                        _custom: '&onCustom',
                        _config: '=config'
                    },
                    templateUrl: '/spApp/drawAreaContent.htm',
                    link: function (scope, element, attrs) {

                        scope.type = scope._config.data;
                        scope.typeName = '';

                        scope.mappedLayers = [];

                        scope.areaName = MapService.nextLayerName("My Area");

                        scope.layerSelected = {name: 'search'};

                        scope.loading = false;

                        scope.radiusKm = 10;

                        scope.line = []

                        scope.enableDrawing = function () {
                            if (scope.deleteDrawing)
                                scope.deleteDrawing();
                            if (scope.type === 'drawBoundingBox') {
                                scope.typeName = 'rectangle';
                                scope.addBox()
                            } else if (scope.type === 'drawPolygon') {
                                scope.typeName = 'polygon';
                                scope.addPolygon()
                            } else if (scope.type === 'pointOnLayer') {
                                scope.intersect.data = {};
                                scope.addMarker();
                                scope.mappedLayers = MapService.contextualLayers();
                                scope.mappedLayers.push({uid: 'search', name: 'Search for a layer'});
                                if (scope.mappedLayers.length > 0) scope.layerSelected.name = scope.mappedLayers[0].uid
                            } else if (scope.type === 'drawPointRadius') {
                                scope.typeName = 'circle';
                                scope.addCircle()
                            } else if (scope.type === 'drawPolyline') {
                                scope.typeName = 'polyline';
                                scope.addPolyline()
                            }
                            scope.areaName = MapService.nextLayerName("My " + ((!scope.typeName || 0 === scope.typeName.length) ? "Area" : (scope.typeName.charAt(0).toUpperCase() + scope.typeName.slice(1))));
                        };

                        $timeout(function () {
                            scope.enableDrawing()
                        }, 0);

                        scope.selectedArea = MapService.newArea();

                        scope.intersectPoint = '';
                        scope.intersect = {
                            name: '',
                            layer: {},
                            data: {},
                            value: ''
                        };

                        scope.$watch('layerSelected.name', function () {
                            if (scope.layerSelected.name !== 'search') {
                                scope.intersect.layer = MapService.getFullLayer(scope.layerSelected.name);
                                scope.updateIntersect()
                            } else {
                                scope.intersect = {
                                    name: '',
                                    layer: {},
                                    data: {},
                                    value: ''
                                }
                            }
                        }, true);

                        scope.selectLayer = function (layer) {
                            scope.intersect.layer = layer;
                            scope.updateIntersect();

                            MapService.add(layer)
                        };

                        scope.cancel = function () {
                            // used by click info popup to check if click came while drawing polygon
                            LayoutService.areaCtrlAreaValue = undefined;

                            scope.deleteDrawing();

                            LayoutService.closePanel()
                        };

                        scope.isNextEnabled = function(){
                            //Directly call intersect.value.length and selectedArea.wkt.length will throw null exception
                            if( scope.intersect && scope.intersect.value){
                               if (scope.intersect.value.length > 0 ){
                                   return true
                               }
                            }
                            if( scope.selectedArea && scope.selectedArea.wkt){
                               if(scope.selectedArea.wkt.length > 0){
                                   return true;
                               }
                            }
                            return false;
                        }

                        scope.ok = function () {
                            scope.loading = true;

                            if (scope.intersect.value.length > 0 || scope.selectedArea.wkt.length > 0) {
                                // used by click info popup to check if click came while drawing polygon
                                LayoutService.areaCtrlAreaValue = undefined;

                                scope.addToMapAndClose();
                            }
                        };

                        scope.wkt = undefined;
                        scope.q = undefined;

                        scope.addToMapAndClose = function () {
                            if (scope.intersect.value.length > 0) {
                                LayersService.getObject(scope.intersect.data.pid).then(function (data) {
                                    data.data.layertype = 'area';
                                    data.data.q = scope.q;
                                    MapService.add(data.data);

                                    scope.deleteDrawing();
                                    LayoutService.closePanel();

                                    MapService.zoomToExtents(data.data.bbox);
                                })
                            } else {
                                scope.wkt = scope.selectedArea.wkt;
                                scope.q = scope.selectedArea.q;
                                if (scope.selectedArea.wkt !== undefined && scope.selectedArea.wkt.length > 0) {
                                    LayersService.createFromWkt(scope.selectedArea.wkt, scope.areaName, '').then(function (data) {
                                        LoggerService.log("Create", scope.type, {pid: data.data.id, wkt: ''})
                                        LayersService.getObject(data.data.id).then(function (data) {
                                            LayersService.getWkt(data.data.id).then(function (wkt) {
                                                data.data.layertype = 'area';
                                                data.data.wkt = wkt.data;
                                                MapService.add(data.data);

                                                scope.deleteDrawing();
                                                LayoutService.closePanel();
                                                MapService.zoomToExtents(data.data.bbox);
                                            })
                                        })
                                    })
                                }
                            }
                        };

                        scope.set = function (wms, legend, metadata, q, wkt, name) {
                            scope.selectedArea = {
                                wms: wms,
                                legend: legend,
                                metadata: metadata,
                                q: q,
                                wkt: wkt,
                                name: name
                            }
                        };

                        scope.showWkt = function () {
                            //display wkt
                            MapService.leafletScope.addWktToMap([scope.selectedArea.wkt])
                        };

                        scope.setWkt = function (wkt) {
                            scope.selectedArea.wkt = wkt
                        };

                        scope.setPid = function (pid) {
                            LayersService.getObject(pid).then(function (obj) {
                                obj = obj.data;
                                scope.selectedArea.obj = obj;
                                scope.selectedArea.name = obj.name && obj.name.length > 0 ? obj.name : 'area';
                                if (obj.area === undefined || obj.area === 0) {
                                    LayersService.getWkt(pid).then(function (wkt) {
                                        scope.selectedArea.wkt = wkt.data
                                    })
                                } else {
                                    scope.selectedArea.q = [obj.fid + ':"' + obj.name + '"']
                                }
                                scope.selectedArea.pid = pid;
                                if (obj.wmsurl !== undefined) {
                                    scope.selectedArea.wms = obj.wmsurl
                                } else {
                                    scope.selectedArea.wms = obj.data.wmsurl
                                }
                            })
                        };

                        scope.addPolygon = function () {
                            $('.leaflet-draw-draw-polygon')[0].click();
                        };

                        scope.addPolyline = function () {
                            $('.leaflet-draw-draw-polyline')[0].click();
                        };

                        scope.addCircle = function () {
                            $('.leaflet-draw-draw-circle')[0].click();
                        };

                        scope.addBox = function () {
                            $('.leaflet-draw-draw-rectangle')[0].click();
                        };

                        scope.addMarker = function () {
                            $('.leaflet-draw-draw-marker')[0].click();
                        };

                        scope.stopDrawing = function () {
                            var a = $('.leaflet-draw-actions a');
                            for (var i = 0; i < a.length; i++) {
                                if (a[i].title === $i18n(379, "Cancel drawing")) {
                                    a[i].click()
                                }
                            }
                        };

                        scope.deleteDrawing = function () {
                            scope.stopDrawing();
                            scope.setWkt(null);
                            scope.intersectPoint = '';
                            scope.intersect.value = '';
                            MapService.leafletScope.deleteDrawing()
                        };

                        $rootScope.$on('setWkt', function (event, data) {
                            if (data[0] === 'point') {
                                //points must be layer intersected

                                scope.setWkt(null);
                                scope.intersectPoint = data[1].toFixed(4) + ' ' + data[2].toFixed(4);

                                scope.updateIntersect()
                            } else if (data[0] === 'polyline') {
                                scope.line = data[1]
                                scope.lineWithBuffer()
                            } else {
                                scope.setWkt(data[0])
                            }
                        });

                        // generate buffers for each line segment and merge as a MULTIPOLYGON
                        scope.lineWithBuffer = function () {
                            var coords = scope.line
                            var radius = scope.radiusKm * 1000

                            var polygons = [];

                            for (var i = 1;i<coords.length;i++) {
                                var dx = coords[i][0] - coords[i-1][0]
                                var dy = coords[i][1] - coords[i-1][1]
                                var angleDegrees = (Math.atan2(dx, dy) / Math.PI) * 180.0

                                var right1 = Util.computeOffset(coords[i-1][1], coords[i-1][0], radius, angleDegrees + 90)
                                var right2 = Util.computeOffset(coords[i][1], coords[i][0], radius, angleDegrees + 90)

                                var left1 = Util.computeOffset(coords[i-1][1], coords[i-1][0], radius, angleDegrees - 90)
                                var left2 = Util.computeOffset(coords[i][1], coords[i][0], radius, angleDegrees - 90)

                                var pts = [right1]
                                var segments = 10

                                // start of line
                                for (var j=1;j<segments;j++) {
                                    var deg = angleDegrees + 90 + (180 / segments) * j
                                    var pt = Util.computeOffset(coords[i-1][1], coords[i-1][0], radius, deg)
                                    pts.push(pt)
                                }
                                pts.push(left1)
                                pts.push(left2)

                                // end of line
                                for (var j=1;j<segments;j++) {
                                    var deg = angleDegrees - 90 + (180 / segments) * j
                                    var pt = Util.computeOffset(coords[i][1], coords[i][0], radius, deg)
                                    pts.push(pt)
                                }
                                pts.push(right2)
                                pts.push(right1)

                                polygons.push(pts)
                            }

                            var wkt = "MULTIPOLYGON ("
                            for (var i = 0;i<polygons.length;i++) {
                                if (i > 0) wkt = wkt + ","
                                wkt = wkt + "(("
                                for (var j=0;j<polygons[i].length;j++) {
                                    if (j > 0) wkt = wkt + ","
                                    wkt = wkt + polygons[i][j][0] + " " + polygons[i][j][1]
                                }
                                wkt = wkt + "))"
                            }
                            wkt = wkt + ")"

                            scope.setWkt(wkt)
                            scope.showWkt()
                        }

                        scope.updateIntersect = function () {
                            //get selected layer
                            var layers = scope.intersect.layer.id;

                            if (layers !== null && scope.intersectPoint.length > 0) {
                                //intersect with selected layer
                                var point = scope.intersectPoint.split(' ');
                                LayersService.intersectLayers([layers], point[0], point[1]).then(function (data) {
                                    if (data.data.length > 0) {
                                        scope.intersect.data = data.data[0];
                                        scope.intersect.value = data.data[0].field + ':"' + data.data[0].value + '"';
                                        scope.q = scope.intersect.value
                                    }
                                })
                            }
                        }
                    }
                };
            }])
}(angular));
