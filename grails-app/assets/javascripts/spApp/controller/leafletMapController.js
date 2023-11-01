(function (angular) {
    'use strict';
    angular.module('leaflet-map-controller', ['leaflet-directive', 'map-service', 'popup-service'])
        .controller('LeafletMapController', ["$scope", "LayoutService", "$http", "leafletData", "leafletBoundsHelpers",
            "MapService", '$timeout', 'leafletHelpers', 'PopupService', 'FlickrService', 'ToolsService', '$q', 'PoiService',
            function ($scope, LayoutService, $http, leafletData, leafletBoundsHelpers, MapService, $timeout, leafletHelpers, popupService, FlickrService, ToolsService, $q, poiService) {
                //ToolsService included so it is initiated

                //the default base layer must be defined first
                var defaultBaseLayer = {};
                defaultBaseLayer[$SH.defaultBaseLayer] = $SH.baseLayers[$SH.defaultBaseLayer];

                $scope.getCRS = function () {
                    var crs;
                    if ($SH.projections[$SH.projection].definition.params) {
                        var bounds = $SH.projections[$SH.projection].definition.params.bounds;
                        if (bounds) {
                            $SH.projections[$SH.projection].definition.params.bounds = new L.Bounds(bounds[0], bounds[1])
                        }
                        crs = new L.Proj.CRS($SH.projections[$SH.projection].definition.code, $SH.projections[$SH.projection].definition.proj4js, $SH.projections[$SH.projection].definition.params);
                    } else if ($SH.projections[$SH.projection].definition.code === 'EPSG:3857') {
                        crs = L.CRS.EPSG3857
                    } else if ($SH.projections[$SH.projection].definition.code === 'EPSG:4326') {
                        crs = L.CRS.EPSG4326
                    }
                    return crs;
                };

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
                    defaults: {crs: $scope.getCRS(), zoomControl: false, zoomsliderControl: true}
                });

                MapService.leafletScope = $scope;

                $scope.baseMap = $SH.defaultBaseLayer;
                $scope.getBaseMap = function () {
                    return $scope.baseMap
                };

                $scope.updateCRS = function () {
                    leafletData.getMap().then(function (map) {
                        map.options.crs = $scope.getCRS();
                        var lat, lng, zoom;
                        if ($SH.projections[$SH.projection].origin) {
                            lat = $SH.projections[$SH.projection].origin.latitude;
                            lng = $SH.projections[$SH.projection].origin.longitude;
                            zoom = $SH.projections[$SH.projection].origin.zoom;
                        } else {
                            lat = $SH.defaultLat;
                            lng = $SH.defaultLng;
                            zoom = $SH.defaultZoom;
                        }
                        map.setView(new L.latLng(lat, lng), zoom);

                        for (var i in map._layers) {
                            map._layers[i]._crs = map.options.crs;
                            if (map._layers[i].wmsParams) {
                                map._layers[i].wmsParams.srs = map.options.crs.code;
                            }

                        }

                        map._resetView(map.getCenter(), zoom);
                    });
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

                $scope.zoomPrev = undefined
                $scope.zoom = function (bounds) {
                    var b = bounds;
                    if ((bounds + '').match(/^POLYGON/g) != null) {
                        //convert POLYGON box to bounds
                        var split = bounds.split(',');
                        var p1 = split[1].split(' ');
                        var p2 = split[3].split(' ');
                        b = [[Math.min(p1[1], p2[1]), Math.min(p1[0], p2[0])], [Math.max(p1[1], p2[1]), Math.max(p1[0], p2[0])]]
                    }
                    if (bounds && bounds.length === 4) {
                        b = [[bounds[1], bounds[0]], [bounds[3], bounds[2]]]
                    }

                    $scope.zoomPrev = b
                    leafletData.getMap().then(function (map) {
                        map.fitBounds(b, {padding: new L.Point(20, 20)});
                    });
                };

                $scope.zoomToPoint = function (latlng, level) {
                    leafletData.getMap().then(function (map) {
                        map.invalidateSize();
                        $timeout(function () {
                            map.setView(latlng, level)
                        }, 0)
                    });
                };

                $scope.initialZoom = function () {
                    if ($scope.zoomPrev !== undefined) {
                        $scope.zoom($scope.zoomPrev)
                    } else {
                        $scope.resetZoom()
                    }
                    leafletData.getMap().then(function (map) {
                        map.invalidateSize()
                    });
                }

                $scope.resetZoom = function () {
                    $scope.zoomToPoint(L.latLng($SH.defaultLat, $SH.defaultLng), $SH.defaultZoom);
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
                                // when more than one layer in the group, the first is always visible=false unless layer.parentVisible=true
                                var pos = 0;
                                var len = 0;
                                var i;
                                for (i in ly._layers) {
                                    len = len + 1;
                                }
                                for (i in ly._layers) {
                                    var layer = ly._layers[i];
                                    if (pos === 0 && len > 1 && (layerIn.parentVisible === undefined || !layerIn.parentVisible)) {
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

                $scope.showHighlight = function (show) {
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (leafletLayers) {
                            var ly;
                            for (var k in $scope.layers.overlays) {
                                if ($scope.layers.overlays.hasOwnProperty(k)) {
                                    if (k.match(/highlight.*/) != null) {
                                        ly = leafletLayers.overlays[k];
                                        $scope.layers.overlays[k].visible = show;
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

                                $timeout(function () {
                                }, 0)
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
                    if ($("#right-panel")[0].style.marginLeft == "420px") {
                        $("#left-panel")[0].style.marginLeft = "-420px";
                        $("#right-panel")[0].style.marginLeft = "0px";
                    } else {
                        $("#left-panel")[0].style.marginLeft = "0px";
                        $("#right-panel")[0].style.marginLeft = "420px";
                    }
                    $scope.invalidate();
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

                    // support commonui-bs3-2019
                    var navbar = $("#wrapper-navbar")
                    if (navbar.length > 0) {
                        if (navbar.hasClass('hidden')) {
                            navbar.removeClass('hidden');
                        } else {
                            navbar.addClass('hidden');
                        }
                    }

                    $scope.invalidate();
                };

                $scope.toggleImages = function (context) {
                    if (context.imagesControl._images_state) {
                        $scope.addImagesToMap();
                    }
                    else {
                        $scope.deleteImages();
                    }
                };

                $scope.togglePoi = function (context) {
                    if (context.poiControl._poi_state) {
                        $scope.addPoiToMap();
                    }
                    else {
                        $scope.deletePoiImages();
                    }
                };

                $scope.addImagesToMap = function () {
                    leafletData.getMap().then(function (map) {
                        var promises = [];

                        var newMarkers = {};

                        var bounds = map.getBounds();

                        var multipBounds = MapService.splitBounds(bounds.getSouthWest(), bounds.getNorthEast());

                        //flickr always returns 250 per page regardless the value of per_page passed in,
                        // so we config total number of photos to display at one time ourselves
                        var nbrOfPhotosToDisplay = Math.round($SH.flickrNbrOfPhotosToDisplay / multipBounds.length);
                        for (var i = 0; i < multipBounds.length; i++) {
                            $(".icon-images").addClass("icon-spin-images");
                            promises.push(FlickrService.getPhotos(multipBounds[i]).then(function (data) {
                                if (data.photos) {
                                    for (var i = 0; i < data.photos.photo.length; i++) {
                                        var photoContent = data.photos.photo[i];
                                        photoContent.url_m = "https://www.flickr.com/photos/" + photoContent.owner + "/" + photoContent.id
                                        newMarkers[photoContent.id] = photoContent;
                                    }
                                }
                                $(".icon-images").removeClass("icon-spin-images");
                            }));
                        }

                        $q.all(promises).then(function () {
                            $scope.addPhotosToMap(newMarkers);
                        });
                    })
                };

                $scope.addPoiToMap = function () {
                    leafletData.getMap().then(function (map) {
                        var promises = [];

                        var newMarkers = {};

                        var bounds = map.getBounds();

                        var multipBounds = MapService.splitBounds(bounds.getSouthWest(), bounds.getNorthEast());

                        var nbrOfPhotosToDisplay = Math.round($SH.flickrNbrOfPhotosToDisplay / multipBounds.length);
                        for (var i = 0; i < multipBounds.length; i++) {
                            $(".icon-poi").addClass("icon-spin-poi");
                            promises.push(poiService.getPhotos(multipBounds[i]).then(function (data) {
                                if (data) {
                                    for (var i = 0; i < nbrOfPhotosToDisplay && i < data.length; i++) {
                                        var photoContent = data[i];
                                        photoContent.url_m = $SH.biocollectUrl + "/site/index/" + photoContent.siteId;
                                        photoContent.url_s = photoContent.thumbnailUrl;
                                        photoContent.url_t = photoContent.thumbnailUrl;
                                        photoContent.url = photoContent.thumbnailUrl;
                                        photoContent.title = photoContent.name;
                                        photoContent.datetaken = photoContent.dateTaken;
                                        photoContent.ownername = photoContent.attribution;
                                        photoContent.licence = photoContent.thirdPartyConsentDeclarationMade;

                                        newMarkers[photoContent.id] = photoContent;
                                    }
                                }
                                $(".icon-poi").removeClass("icon-spin-poi");
                            }));
                        }

                        $q.all(promises).then(function () {
                            $scope.addPhotosToMap(newMarkers, true);
                        });
                    })
                };

                $scope.addPhotosToMap = function (newMarkers, isPoi) {
                    if (newMarkers.length == 0) {
                        return
                    }
                    var popupHTML = function (photo, licenseName) {
                        var result = "<div><h3 class='popover-title'>" + photo.title + "</h3>";
                        result += "<div class='panel-body'> ";
                        result += "<div class='row'> <div class='col-sm-12'>";
                        result += "<a href='" + photo.url_m + "' target='_blank'>";
                        result += "<img class='img-thumbnail' src='" + photo.url_s + "' alt='Click to view large image'></a>";
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
                            if (isPoi) {
                                drawnItems = baselayers.overlays.poiImages;
                            }

                            var layers = drawnItems.getLayers();
                            for (var i = layers.length - 1; i >= 0; i--) {
                                if (!newMarkers.hasOwnProperty(layers[i].uniqueId))
                                    drawnItems.removeLayer(layers[i])
                            }

                            // draw new markers
                            Object.keys(newMarkers).forEach(function (key) {
                                var photoContent = newMarkers[key];
                                var photoIcon = L.divIcon({
                                    html: "<img class='map-icon' src='" + photoContent.url_t + "'></img>"
                                });
                                var marker = L.marker([photoContent.latitude, photoContent.longitude], {icon: photoIcon});
                                marker.uniqueId = key;
                                var license = $scope.licenses[photoContent.license];
                                marker.bindPopup(popupHTML(photoContent, license), {minWidth: 280});
                                promises.push(drawnItems.addLayer(marker));
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
                                        g = data[pt].geometry.replace("POINT (", "").replace(")", "").split(" ");
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
                                        if (pos > 0 && p.ENV) {
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
                                var pos = 0
                                var len = 0
                                for (i in ly._layers) {
                                    len = len + 1;
                                }
                                for (var i in ly._layers) {
                                    var layer = ly._layers[i];
                                    if (pos > 0 || len === 1 || layerIn.parentVisible) {
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
                                    pos = pos + 1
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

                $scope.deletePoiImages = function (layerToIgnore) {
                    leafletData.getMap().then(function () {
                        leafletData.getLayers().then(function (baselayers) {
                            var drawnItems = baselayers.overlays.poiImages;
                            var layers = drawnItems.getLayers();
                            for (var i = layers.length - 1; i >= 0; i--) {
                                if (layers[i] !== layerToIgnore)
                                    drawnItems.removeLayer(layers[i])
                            }
                        })
                    })
                };

                $scope.getLicenses = function () {
                    $scope.licenses = FlickrService.getLicenses();
                };

                $scope.setupTriggers = function () {
                    leafletData.getMap().then(function (map) {
                        $SH._map = map
                        leafletData.getLayers().then(function (baselayers) {
                            $SH._layers = baselayers

                            var drawnItems = baselayers.overlays.draw;

                            L.control.zoomslider({position: 'topleft'}).addTo(map);

                            L.control.scale({position: 'bottomright'}).addTo(map);

                            if ($SH.config.cursorCoordinates) {
                                new L.Control.InfoPanel({
                                    data: []
                                }).addTo(map);
                            }

                            new L.Control.FullScreen({
                                data: []
                            }).addTo(map);

                            if ($SH.config.collapseUp || $SH.config.collapseLeft) {
                                new L.Control.Expand({
                                    toggleExpandUp: $scope.toggleExpandUp,
                                    toggleExpandLeft: $scope.toggleExpandLeft
                                }).addTo(map);
                            }

                            if ($SH.flickrUrl) {
                                new L.Control.Images({
                                    toggleImages: $scope.toggleImages
                                }).addTo(map);
                            }

                            if ($SH.biocollectUrl) {
                                new L.Control.Poi({
                                    togglePoi: $scope.togglePoi
                                }).addTo(map);
                            }

                            var measureControl = new L.Control.Measure({
                                position: 'topleft',
                                primaryLengthUnit: 'meters',
                                secondaryLengthUnit: 'kilometers',
                                primaryAreaUnit: 'sqmeters'
                            });
                            measureControl.addTo(map);

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
                                } else if (type === 'polyline') {
                                    $scope.$emit('setWkt', ['polyline', geoJSON.geometry.coordinates]);
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
                                if (e.target.imagesControl && e.target.imagesControl._images_state) {
                                    $scope.addImagesToMap();
                                }
                                if (e.target.poiControl && e.target.poiControl._poi_state) {
                                    $scope.addPoiToMap();
                                }
                            });

                            map.on('zoomend', function (e) {
                                if (e.target.imagesControl && e.target.imagesControl._images_state) {
                                    $scope.addImagesToMap();
                                }
                                if (e.target.poiControl && e.target.poiControl._poi_state) {
                                    $scope.addPoiToMap();
                                }
                            });

                            $scope.bounds.southWest.lng = map.getBounds().getWest();
                            $scope.bounds.northEast.lng = map.getBounds().getEast();
                            $scope.bounds.southWest.lat = map.getBounds().getSouth();
                            $scope.bounds.northEast.lat = map.getBounds().getNorth();

                            //all setup finished
                            if ($spMapLoaded !== undefined) {
                                $spMapLoaded($scope.initialZoom);
                            }
                        })
                    });
                };

                $timeout(function () {

                    // return non-default base layers
                    var otherBaseLayers = {};
                    for (var name in $SH.baseLayers) {
                        if (name !== $SH.defaultBaseLayer) {
                            $scope.layers.baselayers[name] = $SH.baseLayers[name]
                        }
                    }

                    $timeout(function () {
                        $scope.setupTriggers();
                        $scope.getLicenses();
                    }, 0)
                }, 0)

            }])
}(angular));
