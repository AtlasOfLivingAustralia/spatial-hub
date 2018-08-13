(function (angular) {
    'use strict';
    angular.module('leaflet-map-controller', ['leaflet-directive', 'map-service', 'popup-service'])
        .controller('LeafletMapController', ["$scope", "LayoutService", "$http", "leafletData", "leafletBoundsHelpers",
            "MapService", '$timeout', 'leafletHelpers', 'PopupService', 'FlickrService', 'ToolsService', '$q',
            function ($scope, LayoutService, $http, leafletData, leafletBoundsHelpers, MapService, $timeout, leafletHelpers, popupService, FlickrService, ToolsService, $q) {
                //ToolsService included so it is initiated

                //the default base layer must be defined first
                var defaultBaseLayer = {};
                defaultBaseLayer[$SH.defaultBaseLayer] = $SH.baseLayers[$SH.defaultBaseLayer];

                angular.extend($scope, {
                    layercontrol: {
                        icons: {
                            uncheck: "fa fa-toggle-off",
                            check: "fa fa-toggle-on"
                        }
                    },
                    australia: {
                        lat: $SH.defaultLat,
                        lng: $SH.defaultLng,
                        zoom: $SH.defaultZoom
                    },
                    layers: {
                        baselayers: defaultBaseLayer,
                        overlays: MapService.leafletLayers
                    },
                    controls: {
                        draw: {}
                    },
                    bounds: leafletBoundsHelpers.createBoundsFromArray([
                        [51.508742458803326, -0.087890625],
                        [51.508742458803326, -0.087890625]
                    ])

                });

                MapService.leafletScope = $scope;

                $scope.baseMap = $SH.defaultBaseLayer;
                $scope.getBaseMap = function () {
                    return $scope.baseMap
                };

                $scope.setBaseMap = function (key) {
                    leafletHelpers.safeApply($scope, function (scp) {
                        $scope.baseMap = key;
                        scp.baselayer = key;
                        leafletData.getMap().then(function (map) {
                            leafletData.getLayers().then(function (leafletLayers) {
                                if (map.hasLayer(leafletLayers.baselayers[key])) {
                                    return;
                                }

                                for (var i in scp.layers.baselayers) {
                                    if (scp.layers.baselayers.hasOwnProperty(i)) {
                                        if (map.hasLayer(leafletLayers.baselayers[i])) {
                                            map.removeLayer(leafletLayers.baselayers[i]);
                                        }
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
                };

                $scope.invalidate = function () {
                    leafletData.getMap().then(function (map) {
                        $(window).trigger('resize');
                        map.invalidateSize()
                    });
                };

                $scope.zoom = function (bounds) {
                    var b = bounds;
                    if ((bounds + '').match(/^POLYGON/g)) {
                        //convert POLYGON box to bounds
                        var split = bounds.split(',');
                        var p1 = split[1].split(' ');
                        var p2 = split[3].split(' ');
                        b = [[Math.min(p1[1], p2[1]), Math.min(p1[0], p2[0])], [Math.max(p1[1], p2[1]), Math.max(p1[0], p2[0])]]
                    }
                    if (bounds && bounds.length === 4) {
                        b = [[bounds[1], bounds[0]], [bounds[3], bounds[2]]]
                    }
                    leafletData.getMap().then(function (map) {
                        map.fitBounds(b, {padding: new L.Point(20, 20)});
                    });
                };

                $scope.zoomToPoint = function (latlng, level) {
                    leafletData.getMap().then(function (map) {
                        map.setView(latlng, level)
                    });
                };

                $scope.resetZoom = function () {
                    leafletData.getMap().then(function (map) {
                        map.panTo(L.latLng(-25, 132));
                        map.setZoom(4)
                    });
                };

                $scope.showLayer = function (layerIn, show) {
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (leafletLayers) {
                            var ly;
                            for (var k in $scope.layers.overlays) {
                                if ($scope.layers.overlays.hasOwnProperty(k)) {
                                    if ($scope.layers.overlays[k] === layerIn) {
                                        ly = leafletLayers.overlays[k];
                                        break;
                                    }
                                }
                            }
                            if (map.hasLayer(ly)) {
                                // all layers are groups
                                // when more than one layer in the group, the first is always visible=false
                                var pos = 0;
                                var len = 0;
                                var i;
                                for (i in ly._layers) {
                                    len = len + 1;
                                }
                                for (i in ly._layers) {
                                    var layer = ly._layers[i];
                                    if (pos === 0 && len > 1) {
                                        layer.visible = false
                                    } else {
                                        layer.visible = show
                                    }
                                    pos = pos + 1;
                                }
                            }
                        })
                    })
                };

                $scope.moveLayer = function (layerIn, newIndex) {
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (leafletLayers) {
                            var ly;
                            var oldLy;
                            for (var k in $scope.layers.overlays) {
                                if ($scope.layers.overlays.hasOwnProperty(k)) {
                                    if ($scope.layers.overlays[k] === layerIn) {
                                        ly = leafletLayers.overlays[k];
                                    }
                                    if ($scope.layers.overlays[k].index === newIndex) {
                                        oldLy = $scope.layers.overlays[k];
                                    }
                                }
                            }

                            if (map.hasLayer(ly)) {
                                if (oldLy !== undefined) {
                                    oldLy.index = ly.index;
                                    oldLy.setZIndex(oldLy.index)
                                }

                                ly.index = newIndex;
                                ly.setZIndex(newIndex);
                            }
                        })
                    })
                };

                $scope.$watch('layers.overlays', function (newOverlayLayers) {
                    var overlaysArray = [];
                    leafletData.getLayers().then(function (leafletLayers) {
                        var key;
                        for (key in newOverlayLayers) {
                            if (newOverlayLayers.hasOwnProperty(key)) {
                                var ly = newOverlayLayers[key];

                                overlaysArray.push(ly);

                                if (ly.index !== undefined && leafletLayers.overlays[key].setZIndex) {
                                    leafletLayers.overlays[key].setZIndex(newOverlayLayers[key].index);
                                }
                            }
                        }

                        $scope.overlaysArray = overlaysArray;
                    });
                }, true);

                $scope.toggleExpandLeft = function (context) {
                    if ($("#right-panel")[0].style.marginLeft == "0px") {
                        $("#left-panel")[0].style.marginLeft = "0px";
                        $("#right-panel")[0].style.marginLeft = "420px";
                    } else {
                        $("#left-panel")[0].style.marginLeft = "-420px";
                        $("#right-panel")[0].style.marginLeft = "0px";
                    }
                    ;
                    $(window).trigger('resize');
                    context.invalidateSize()
                };

                $scope.toggleExpandUp = function (context) {
                    if (!context) {
                        context = this;
                    }
                    if (getComputedStyle($("body")[0]).paddingTop == "0px") {
                        $(".navbar-default").show();
                        $("body")[0].style.paddingTop = "";
                    } else {
                        $("body")[0].style.paddingTop = "0px";
                        $(".navbar-default").hide();
                    }

                    //
                    $(window).trigger('resize');
                    context.invalidateSize()
                };

                $scope.togglePanoramio = function (context) {
                    if (context.panoramioControl._panoramio_state) {
                        $scope.addPanoramioToMap();
                    }
                    else {
                        $scope.deleteImages();
                    }
                };

                $scope.existingMarkers = {};

                $scope.addPanoramioToMap = function () {
                    leafletData.getMap().then(function (map) {
                        var promises = [];

                        var newMarkers = {};

                        var bounds = map.getBounds();

                        var multipBounds = MapService.splitBounds(bounds.getSouthWest(), bounds.getNorthEast());

                        //flickr always returns 250 per page regardless the value of per_page passed in,
                        // so we config total number of photos to display at one time ourselves
                        var nbrOfPhotosToDisplay = Math.round($SH.flickrNbrOfPhotosToDisplay / multipBounds.length);
                        for (var i = 0; i < multipBounds.length; i++) {
                            $(".icon-panoramio").addClass("icon-spin-panoramio");
                            promises.push(FlickrService.getPhotos(multipBounds[i]).then(function (data) {
                                if (data.photos) {
                                    for (var i = 0; i < nbrOfPhotosToDisplay; i++) {
                                        var photoContent = data.photos.photo[i];
                                        newMarkers[photoContent.id] = photoContent;
                                    }
                                }
                                $(".icon-panoramio").removeClass("icon-spin-panoramio");
                            }));
                        }

                        $q.all(promises).then(function () {
                            $scope.addPhotosToMap(newMarkers, $scope.existingMarkers);
                        });
                    })
                };

                $scope.addPhotosToMap = function (newMarkers, oldMarkers) {
                    var popupHTML = function (photo, licenseName) {
                        var result = "<div><h3 class='popover-title'>" + photo.title + "</h3>";
                        result += "<div class='panel-body'> ";
                        result += "<div class='row'> <div class='col-sm-12'>";
                        result += "<a href='" + photo.url_m + "' target='_blank'>";
                        result += "<img class='img-thumbnail' style='display: block; margin: 0 auto;' src='" + photo.url_s + "' alt='Click to view large image'></a>";
                        result += "</div> </div>";

                        result += "<div class='row'> <div class='col-sm-12'>";
                        result += "<b>Title: </b>" + photo.title;
                        result += "</div> </div>";
                        result += "<div class='row'> <div class='col-sm-12'>";
                        result += "<b>Date : </b>" + photo.datetaken;
                        result += "</div> </div>";
                        result += "<div class='row'> <div class='col-sm-12'>";
                        result += "<b>Owner: </b>" + photo.ownername;
                        result += "</div> </div>";
                        result += "<div class='row'> <div class='col-sm-12'>";
                        result += "<b>License: </b>" + licenseName;
                        result += "</div> </div>";
                        result += "</div> </div>";
                        return result;
                    };

                    var promises = [];

                    leafletData.getMap().then(function () {
                        leafletData.getLayers().then(function (baselayers) {
                            var drawnItems = baselayers.overlays.images;

                            // remove markers that are not in the new feed
                            Object.keys(oldMarkers).forEach(function (key) {
                                if (!newMarkers.hasOwnProperty(key)) {
                                    var photoContent = oldMarkers[key];
                                    var marker = L.marker([photoContent.latitude, photoContent.longitude]);
                                    promises.push(drawnItems.removeLayer(marker));
                                }
                            });

                            // draw new markers
                            Object.keys(newMarkers).forEach(function (key) {
                                // don't redraw
                                if (!oldMarkers.hasOwnProperty(key)) {
                                    var photoContent = newMarkers[key];
                                    var photoIcon = L.icon(
                                        {
                                            iconUrl: photoContent.url_t,
                                            iconSize: [photoContent.width_t * 0.5, photoContent.height_t * 0.5]
                                        }  //reduces thumbnails 50%
                                    );
                                    var marker = L.marker([photoContent.latitude, photoContent.longitude], {icon: photoIcon});
                                    var license = $scope.licenses[photoContent.license];
                                    marker.bindPopup(popupHTML(photoContent, license), {minWidth: 280});
                                    promises.push(drawnItems.addLayer(marker));
                                }
                            });

                            $q.all(promises).then(function () {
                                $scope.existingMarkers = Object.assign(newMarkers);
                            });
                        })
                    })
                };

                $scope.addPointsToMap = function (data) {
                    leafletData.getMap().then(function () {
                        leafletData.getLayers().then(function (baselayers) {
                            var drawnItems = baselayers.overlays.draw;
                            var pt;
                            for (pt in data) {
                                if (data.hasOwnProperty(pt)) {
                                    var g;
                                    if (data[pt] instanceof Array) {
                                        g = [data[pt][1], data[pt][2]];
                                    } else {
                                        g = data[pt].geometry.replace("POINT(", "").replace(")", "").split(" ");
                                    }
                                    var m = L.marker([g[1], g[0]])
                                        .bindLabel(data[pt].name, {noHide: true});
                                    drawnItems.addLayer(m)
                                }
                            }
                        })
                    })
                };

                $scope.addWktToMap = function (data) {
                    $scope.deleteDrawing();
                    leafletData.getMap().then(function () {
                        leafletData.getLayers().then(function (baselayers) {
                            var drawnItems = baselayers.overlays.draw;
                            var geojsonLayer = L.geoJson(wellknown.parse(data[0]));
                            drawnItems.addLayer(geojsonLayer)
                        })
                    })
                };

                $scope.changeParams = function (layerIn, params) {
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (leafletLayers) {
                            var ly;
                            for (var k in $scope.layers.overlays) {
                                if ($scope.layers.overlays.hasOwnProperty(k)) {
                                    if ($scope.layers.overlays[k] === layerIn) {
                                        ly = leafletLayers.overlays[k];
                                        break;
                                    }
                                }
                            }
                            if (map.hasLayer(ly)) {
                                // all layers are groups
                                var pos = 0;
                                for (var i in ly._layers) {
                                    var layer = ly._layers[i];
                                    if (layer.setParams) {
                                        var envs = params.ENV;
                                        var p = layer.wmsParams;
                                        if (pos > 0) {
                                            // only apply colour to the first layer in the group
                                            var currentColour = p.ENV.replace(/.*(color%3A......).*/g, function (a, b) {
                                                return b;
                                            });
                                            envs = envs.replace(/color%3A....../g, currentColour)
                                        }
                                        p.ENV = envs;
                                        p.uppercase = false;
                                        if (params.fq && params.fq.length) {
                                            p.fq = params.fq
                                        } else {
                                            delete p.fq
                                        }

                                        if (p.sld_body !== undefined) {
                                            p.sld_body = params.sld_body
                                        }
                                        layer.setParams(p)
                                    }

                                    pos = pos + 1;
                                }
                            }
                            $timeout(function () {
                            }, 0)
                        });
                    });
                };

                $scope.changeOpacity = function (layerIn, opacity) {
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (leafletLayers) {
                            var ly;
                            for (var k in $scope.layers.overlays) {
                                if ($scope.layers.overlays.hasOwnProperty(k)) {
                                    if ($scope.layers.overlays[k] === layerIn) {
                                        ly = leafletLayers.overlays[k];
                                        break;
                                    }
                                }
                            }

                            if (map.hasLayer(ly)) {
                                // all layers are groups
                                for (var i in ly._layers) {
                                    var layer = ly._layers[i];
                                    if (layer.setOpacity) {
                                        layer.setOpacity(opacity);
                                    }

                                    if (layer.getLayers && layer.eachLayer) {
                                        layer.eachLayer(function (lay) {
                                            if (lay.setOpacity) {
                                                lay.setOpacity(opacity);
                                            }
                                        });
                                    }
                                }
                            }
                            $timeout(function () {
                            }, 0)
                        });
                    });

                };

                $scope.deleteDrawing = function (layerToIgnore) {
                    leafletData.getMap().then(function () {
                        leafletData.getLayers().then(function (baselayers) {
                            var drawnItems = baselayers.overlays.draw;
                            var layers = drawnItems.getLayers();
                            for (var i = layers.length - 1; i >= 0; i--) {
                                if (layers[i] !== layerToIgnore)
                                    drawnItems.removeLayer(layers[i])
                            }
                        })
                    })
                };

                $scope.deleteImages = function (layerToIgnore) {
                    leafletData.getMap().then(function () {
                        leafletData.getLayers().then(function (baselayers) {
                            var drawnItems = baselayers.overlays.images;
                            var layers = drawnItems.getLayers();
                            for (var i = layers.length - 1; i >= 0; i--) {
                                if (layers[i] !== layerToIgnore)
                                    drawnItems.removeLayer(layers[i])
                            }
                        })
                    })
                };

                $scope.getLicenses = function () {
                    FlickrService.getLicenses().then(function (data) {
                        $scope.licenses = data
                    });
                };

                $scope.setupTriggers = function () {
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (baselayers) {

                            var drawnItems = baselayers.overlays.draw;

                            L.control.scale({position: 'bottomright'}).addTo(map);

                            new L.Control.InfoPanel({
                                data: []
                            }).addTo(map);

                            new L.Control.FullScreen({
                                data: []
                            }).addTo(map);

                            new L.Control.Expand({
                                toggleExpandUp: $scope.toggleExpandUp,
                                toggleExpandLeft: $scope.toggleExpandLeft
                            }).addTo(map);

                            new L.Control.Panoramio({
                                togglePanoramio: $scope.togglePanoramio
                            }).addTo(map);

                            map.on('draw:created', function (e) {
                                var layer = e.layer;
                                $scope.deleteDrawing(layer);

                                drawnItems.addLayer(layer);

                                var type = e.layerType;
                                var geoJSON = layer.toGeoJSON();
                                var wkt;
                                if (type === "circle") {
                                    var radius = layer.getRadius();
                                    wkt = Util.createCircle(geoJSON.geometry.coordinates[0], geoJSON.geometry.coordinates[1], radius);
                                    $scope.$emit('setWkt', [wkt]);
                                } else if (type === "marker") {
                                    $scope.$emit('setWkt', ['point', geoJSON.geometry.coordinates[0], geoJSON.geometry.coordinates[1]]);
                                } else {
                                    var wkt = Util.wrappedToWkt(Util.wrap(geoJSON.geometry.coordinates[0]));

                                    $scope.$emit('setWkt', [wkt]);
                                }
                            });

                            map.on('click', function (e) {
                                var latlng = e.latlng;
                                if (LayoutService.areaCtrlAreaValue !== 'drawPolygon') {
                                    popupService.click(latlng)
                                }
                            });

                            map.on('moveend', function (e) {
                                if (e.target.panoramioControl._panoramio_state) {
                                    $scope.addPanoramioToMap();
                                }
                            });

                            map.on('zoomend', function (e) {
                                if (e.target.panoramioControl._panoramio_state) {
                                    $scope.addPanoramioToMap();
                                }
                            });

                            //all setup finished
                            if ($spMapLoaded !== undefined) {
                                $spMapLoaded();
                            }
                        })
                    });
                };

                $timeout(function () {
                    $(window).trigger('resize');

                    // return non-default base layers
                    var otherBaseLayers = {};
                    for (var name in $SH.baseLayers) {
                        if (name !== $SH.defaultBaseLayer) {
                            $scope.layers.baselayers[name] = $SH.baseLayers[name]
                        }
                    }

                    $scope.invalidate();
                    $timeout(function () {
                        $scope.setupTriggers();
                        $scope.getLicenses();
                    }, 0)
                }, 0)

            }])
}(angular));