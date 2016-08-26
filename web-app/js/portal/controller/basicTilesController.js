(function (angular) {
    'use strict';
    angular.module('basic-tiles-controller', ['leaflet-directive', 'map-service'])
        .controller('BasicTilesController', ["$scope", "$rootScope", "leafletData", "leafletBoundsHelpers",
            "MapService", '$timeout', 'leafletHelpers',
            function ($scope, $rootScope, leafletData, leafletBoundsHelpers, MapService, $timeout, leafletHelpers) {

                angular.extend($scope, {
                    layercontrol: {
                        icons: {
                            uncheck: "fa fa-toggle-off",
                            check: "fa fa-toggle-on"
                        }
                    },
                    australia: {
                        lat: -25,
                        lng: 132,
                        zoom: 4
                    },
                    layers: {
                        baselayers: {
                            outline: {
                                name: 'Outline',
                                type: 'wms',
                                url: 'http://spatial.ala.org.au/geoserver/gwc/service/wms/reflect?',
                                layerParams: {
                                    layers: 'ALA:world',
                                    format: 'image/png'
                                }
                            },
                            osm: {
                                name: 'OpenStreetMap',
                                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                type: 'xyz'
                            },
                            google_satellite: {
                                name: 'Satellite',
                                layerType: 'SATELLITE',
                                type: 'google'
                            },
                            google_hybrid: {
                                name: 'Hybrid',
                                layerType: 'HYBRID',
                                type: 'google'
                            },
                            google_roadmaps: {
                                name: 'Streets',
                                layerType: 'ROADMAP',
                                type: 'google'
                            }
                        },
                        overlays: MapService.leafletLayers
                    }
                    , controls: {
                        draw: {}
                    },
                    bounds: leafletBoundsHelpers.createBoundsFromArray([
                        [51.508742458803326, -0.087890625],
                        [51.508742458803326, -0.087890625]
                    ])

                });

                MapService.leafletScope = $scope

                $scope.setBaseMap = function (key) {
                    leafletHelpers.safeApply($scope, function (scp) {
                        scp.baselayer = key;
                        leafletData.getMap().then(function (map) {
                            leafletData.getLayers().then(function (leafletLayers) {
                                if (map.hasLayer(leafletLayers.baselayers[key])) {
                                    return;
                                }

                                for (var i in scp.layers.baselayers) {
                                    if (map.hasLayer(leafletLayers.baselayers[i])) {
                                        map.removeLayer(leafletLayers.baselayers[i]);
                                    }
                                }

                                map.addLayer(leafletLayers.baselayers[key]);
                            });
                        });
                    });


                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (leafletLayers) {

                            map.fire('baselayerchange', leafletLayers.baselayers[key]);
                        })
                    })
                }

                $scope.invalidate = function () {
                    leafletData.getMap().then(function (map) {
                        map.invalidateSize()
                    });
                }

                $scope.zoom = function (bounds) {
                    var b = bounds
                    if ((bounds + '').startsWith('POLYGON')) {
                        //convert POLYGON box to bounds
                        var split = bounds.split(',')
                        var p1 = split[1].split(' ')
                        var p2 = split[3].split(' ')
                        b = [[Math.min(p1[1], p2[1]), Math.min(p1[0], p2[0])], [Math.max(p1[1], p2[1]), Math.max(p1[0], p2[0])]]
                    }
                    leafletData.getMap().then(function (map) {
                        map.fitBounds(b);
                    });
                }

                $scope.resetZoom = function () {
                    leafletData.getMap().then(function (map) {
                        map.center(b);
                    });
                }

                $scope.showLayer = function (layer, show) {
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (leafletLayers) {
                            var ly;
                            for (var k in $scope.layers.overlays) {
                                if ($scope.layers.overlays[k] === layer) {
                                    ly = leafletLayers.overlays[k];
                                    break;
                                }
                            }

                            if (map.hasLayer(ly)) {
                                ly.visible = show
                            }
                        })
                    })
                }

                $scope.moveLayer = function (layer, newIndex) {
                    var delta = Object.keys($scope.layers.baselayers).length;
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (leafletLayers) {
                            var ly;
                            for (var k in $scope.layers.overlays) {
                                if ($scope.layers.overlays[k] === layer) {
                                    ly = leafletLayers.overlays[k];
                                    break;
                                }
                            }

                            var oldLy
                            for (var k in $scope.layers.overlays) {
                                if ($scope.layers.overlays[k].index == newIndex) {
                                    oldLy = $scope.layers.overlays[k]
                                    break;
                                }
                            }

                            if (map.hasLayer(ly)) {
                                if (oldLy !== undefined) {
                                    oldLy.index = ly.index
                                    oldLy.setZIndex(oldLy.index)
                                }

                                ly.index = newIndex
                                ly.setZIndex(newIndex);
                            }
                        })
                    })
                }

                $scope.$watch('layers.overlays', function (newOverlayLayers) {
                    var overlaysArray = [];
                    leafletData.getLayers().then(function (leafletLayers) {
                        var key;
                        for (key in newOverlayLayers) {
                            var layer = newOverlayLayers[key];

                            overlaysArray.push(layer);

                            if (layer.index !== undefined && leafletLayers.overlays[key].setZIndex) {
                                leafletLayers.overlays[key].setZIndex(newOverlayLayers[key].index);
                            }
                        }

                        $scope.overlaysArray = overlaysArray;
                    });
                }, true);


                $scope.addPointsToMap = function (data) {
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (baselayers) {
                            var drawnItems = baselayers.overlays.draw;
                            var pt
                            for (pt in data) {
                                var g = data[pt].geometry.replace("POINT(", "").replace(")", "").split(" ")
                                var m = L.marker([g[1], g[0]])
                                    .bindLabel(data[pt].name, {noHide: true})
                                drawnItems.addLayer(m)
                            }
                        })
                    })
                }
                $scope.addWktToMap = function (data) {
                    $scope.deleteDrawing()
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (baselayers) {
                            var drawnItems = baselayers.overlays.draw;
                            var geojsonLayer = L.geoJson(Wellknown.parse(data[0]));
                            drawnItems.addLayer(geojsonLayer)
                        })
                    })
                };

                $scope.changeParams = function (layer, params) {
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (leafletLayers) {
                            var ly;
                            for (var k in $scope.layers.overlays) {
                                if ($scope.layers.overlays[k] === layer) {
                                    ly = leafletLayers.overlays[k];
                                    break;
                                }
                            }

                            if (map.hasLayer(ly)) {
                                if (ly.setParams) {
                                    var p = ly.wmsParams
                                    p.ENV = params.ENV
                                    if (p.sld_body !== undefined) {
                                        p.sld_body = params.sld_body
                                    }
                                    ly.setParams(p)
                                }
                            }
                            $timeout(function () {
                            }, 0)
                        });
                    });
                }


                $scope.changeOpacity = function (layer, opacity) {
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (leafletLayers) {
                            var ly;
                            for (var k in $scope.layers.overlays) {
                                if ($scope.layers.overlays[k] === layer) {
                                    ly = leafletLayers.overlays[k];
                                    break;
                                }
                            }

                            if (map.hasLayer(ly)) {
                                if (ly.setOpacity) {
                                    ly.setOpacity(opacity);
                                }

                                if (ly.getLayers && ly.eachLayer) {
                                    ly.eachLayer(function (lay) {
                                        if (lay.setOpacity) {
                                            lay.setOpacity(opacity);
                                        }
                                    });
                                }
                            }
                            $timeout(function () {
                            }, 0)
                        });
                    });

                }

                $scope.deleteDrawing = function (layerToIgnore) {
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (baselayers) {
                            var drawnItems = baselayers.overlays.draw;
                            var layers = drawnItems.getLayers()
                            for (var i = layers.length - 1; i >= 0; i--) {
                                if (layers[i] !== layerToIgnore)
                                    drawnItems.removeLayer(layers[i])
                            }
                        })
                    })
                }

                $scope.setupTriggers = function () {
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (baselayers) {

                            var drawnItems = baselayers.overlays.draw;

                            L.control.scale({}).addTo(map)


                            new L.Control.InfoPanel({
                                data: []
                            }).addTo(map);


                            map.on('baselayerchange', function (e) {
                                var i
                            })

                            map.on('draw:created', function (e) {
                                var layer = e.layer;
                                $scope.deleteDrawing(layer);

                                drawnItems.addLayer(layer);

                                var type = e.layerType;
                                var geoJSON = layer.toGeoJSON();
                                var wkt
                                if (type === "circle") {
                                    var radius = layer.getRadius();
                                    wkt = Util.createCircle(geoJSON.geometry.coordinates[0], geoJSON.geometry.coordinates[1], radius)
                                    $scope.$emit('setWkt', [wkt]);
                                } else if (type === "marker") {
                                    $scope.$emit('setWkt', ['point', geoJSON.geometry.coordinates[0], geoJSON.geometry.coordinates[1]]);
                                } else {
                                    wkt = 'POLYGON (('
                                    for (var i = 0; i < geoJSON.geometry.coordinates[0].length; i++) {
                                        if (i > 0) wkt += ', '
                                        wkt += geoJSON.geometry.coordinates[0][i][0] + ' ' + geoJSON.geometry.coordinates[0][i][1]
                                    }
                                    wkt += '))'
                                    $scope.$emit('setWkt', [wkt]);
                                }

                            });
                        })
                    });
                }

                $timeout(function () {
                    $scope.invalidate()
                    $timeout(function () {
                        $scope.setupTriggers()
                    }, 5000)
                }, 0)

            }])
}(angular))