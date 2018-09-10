/*
 * Copyright (C) 2016 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * Created by Temi on 6/09/2016.
 */
(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name PopupService
     * @description
     *   Map popup generation
     */
    angular.module('popup-service', ['leaflet-directive', 'map-service', 'biocache-service'])
        .factory("PopupService", ['$rootScope', '$compile', '$http', '$window', '$templateRequest', 'leafletData', 'MapService', 'BiocacheService', 'LayersService',
            function ($rootScope, $compile, $http, $window, $templateRequest, leafletData, mapService, biocacheService, LayersService) {
                var addPopupFlag = true,
                    popup, loc, leafletMap;
                var templatePromise = $templateRequest('/spApp/intersectPopupContent.htm');
                var intersects = [],
                    layers = [],
                    ssLayers = [],
                    speciesLayers = [],
                    occurrences = [],
                    areaLayers = [],
                    occurrenceList;
                var processedLayers = [0];

                function addPopupToMap(latlng, map, templatePromise, intersects, occurrences) {
                    var leafletmap = $('.angular-leaflet-map');
                    var layerCount = layers.length + speciesLayers.length + areaLayers.length;

                    if (addPopupFlag) {
                        templatePromise.then(function (content) {
                            var popupScope = $rootScope.$new();

                            popupScope.processedLayers = processedLayers;

                            // TODO: build a better progress indicator

                            popupScope.intersects = intersects;
                            popupScope.olist = occurrences;

                            var html = $compile(content)(popupScope);
                            popup = L.popup({maxWidth: 500, maxHeight: 600, minWidth: 410, autoPanPadding: 10})
                                .setLatLng(latlng)
                                .setContent(html[0])
                                .openOn(map);
                            addPopupFlag = false
                        })
                    }
                }

                function OccurrenceList(speciesLayers) {
                    var self = this,
                        isFirstOccurrence = true,
                        layersWithResults = [];

                    this.occurrences = [];
                    this.pageSize = 1;
                    this.total = 0;
                    this.index = 0;
                    this.speciesLayers = undefined;
                    this.config = $SH;
                    this.zoomedToRecord = false;
                    this.viewRecordUrl = '';
                    this.listRecordsUrl = '';

                    this.getFirstOccurrence = function (layer) {
                        if (isFirstOccurrence) {
                            self.getOccurrence(0, layer);
                            isFirstOccurrence = false
                        }
                    };

                    this.getOccurrence = function (index, layer) {
                        var q = this.getQueryParams(layer);
                        self.layer = layer;
                        biocacheService.searchForOccurrences(q.query, q.fqs, 1, index).then(function (data) {
                            if (data.occurrences && data.occurrences.length) {
                                addPopupToMap(loc, leafletMap, templatePromise, intersects, occurrenceList);
                                // empty array
                                data.occurrences[0].layername = layer.name;
                                self.occurrences.splice(0, self.occurrences.length);
                                self.occurrences.push.apply(self.occurrences, data.occurrences);

                                data.occurrences[0].adhocGroup = self.isAdhocGroup();

                                self.viewRecord()
                            }
                        })
                    };

                    this.isAdhocGroup = function () {
                        var layer = self.layer;
                        var id = self.occurrences[0].uuid;
                        if (layer.adhocGroup === undefined) {
                            layer.adhocGroup = {};
                            layer.adhocGroupSize = 0
                        }
                        return layer.adhocGroup[id] !== undefined && layer.adhocGroup[id]
                    };

                    this.toggleAdhocGroup = function () {
                        var layer = self.layer;
                        var id = self.occurrences[0].uuid;
                        if (layer.adhocGroup === undefined) {
                            layer.adhocGroup = {};
                            layer.adhocGroupSize = 0
                        }
                        if (layer.adhocGroup[id] !== undefined) layer.adhocGroup[id] = !layer.adhocGroup[id];
                        else layer.adhocGroup[id] = true;

                        if (layer.adhocGroup[id]) layer.adhocGroupSize++;
                        else layer.adhocGroupSize--
                    };

                    this.getNextOccurrence = function () {
                        var nextIndex = self.index + 1;
                        if (nextIndex >= self.total) {
                            return
                        }

                        self.index += 1;
                        var query = this.getSearchLayerAndIndex();
                        this.getOccurrence(query.index, query.layer)
                    };

                    this.getPrevOccurrence = function () {
                        var nextIndex = self.index - 1;
                        if (nextIndex >= self.total || nextIndex < 0) {
                            return
                        }

                        self.index -= 1;
                        var query = this.getSearchLayerAndIndex();
                        this.getOccurrence(query.index, query.layer)
                    };

                    this.getSearchLayerAndIndex = function () {
                        var result = {layer: undefined, index: 0},
                            total = 0;
                        layersWithResults.forEach(function (layer) {
                            if (layer) {
                                if ((self.index < (total + layer.total) && (self.index >= total))) {
                                    result.layer = layer;
                                    result.index = self.index - total
                                }

                                total += layer.total
                            }
                        });

                        return result
                    };

                    this.getQueryParams = function (layer) {
                        var q = {query: {}, fqs: undefined},
                            fqs;
                        q.query.bs = layer.bs;
                        q.query.ws = layer.ws;
                        q.query.q = layer.q;
                        q.fqs = [];
                        layer.fq && layer.fq.forEach(function (fq) {
                            if ((fq.indexOf(/latitude/) !== -1) || (fq.indexOf(/longitude/) !== -1)) {
                                q.fqs.push(fq)
                            }
                        });

                        fqs = self.getLatLngFq(loc, layer.size);
                        q.fqs.push.apply(q.fqs, fqs);

                        return q
                    };

                    this.getLatLngFq = function (latlng, dotradius) {
                        var fq = [];
                        dotradius = dotradius * 1 + 3;
                        var px = leafletMap.latLngToContainerPoint(latlng);
                        var ll1 = leafletMap.containerPointToLatLng(L.point(px.x + dotradius, px.y + dotradius));
                        var ll2 = leafletMap.containerPointToLatLng(L.point(px.x + dotradius, px.y - dotradius));
                        var ll3 = leafletMap.containerPointToLatLng(L.point(px.x - dotradius, px.y - dotradius));
                        var ll4 = leafletMap.containerPointToLatLng(L.point(px.x - dotradius, px.y + dotradius));
                        var maxLng = Math.max(ll1.lng, ll2.lng, ll3.lng, ll4.lng);
                        var maxLat = Math.max(ll1.lat, ll2.lat, ll3.lat, ll4.lat);
                        var lonSize = Math.abs(latlng.lng - maxLng);
                        var latSize = Math.abs(latlng.lat - maxLat);
                        fq.push("latitude:[" + (latlng.lat - latSize) + " TO " + (latlng.lat + latSize) + "]");
                        fq.push("longitude:[" + (latlng.lng - lonSize) + " TO " + (latlng.lng + lonSize) + "]");

                        return fq
                    };

                    this.listRecords = function () {
                        if (self.layer !== undefined) {
                            var q = self.getQueryParams(self.layer);
                            var url = biocacheService.constructSearchResultUrl(q.query, q.fqs, 10, 0, true).then(function (url) {
                                self.listRecordsUrl = url
                            })
                        }
                    };

                    this.viewRecord = function () {
                        if (self.occurrences && self.occurrences.length > 0) {
                            var url = self.layer.ws + "/occurrences/" + self.occurrences[0].uuid;
                            self.viewRecordUrl = url
                        }
                    };

                    this.zoomToRecord = function () {
                        self.zoomedToRecord = true;
                        var occ = self.occurrences[0];
                        var lattng = L.latLng(occ.decimalLatitude, occ.decimalLongitude);
                        mapService.leafletScope.zoomToPoint(lattng, 10);
                        $('.leaflet-popup-close-button')[0].click()
                    };

                    speciesLayers.forEach(function (layer) {
                        var q = self.getQueryParams(layer);
                        biocacheService.count(q.query, q.fqs).then(function (count) {
                            if (count !== undefined && count > 0) {
                                layersWithResults.push(layer);
                                layer.total = count;
                                self.total += count;
                                self.getFirstOccurrence(layer)
                            }
                            processedLayers[0] += 1;

                            self.listRecords();
                            self.viewRecord();
                        })
                    })
                }

                return {
                    /**
                     * Coordinate
                     * @typedef {Object} latlng
                     * @property {number} lat - latitude
                     * @property {number} lng - longitude
                     */

                    /**
                     * Open a popup on the map with information about a coordinate.
                     *
                     * @memberof PopupService
                     * @param (latlng) latlng coordinate input coordinate as lat,lng
                     *
                     * @example:
                     * Input:
                     * - latlng
                     *  {lat:latitude, lng:longitude}
                     * Output:
                     *  [{
                        "studyId": 92,
                        "focalClade": "Acacia",
                        "treeFormat": "newick",
                        "studyName": "Miller, J. T., Murphy, D. J., Brown, G. K., Richardson, D. M. and González-Orozco, C. E. (2011), The evolution and phylogenetic placement of invasive Australian Acacia species. Diversity and Distributions, 17: 848–860. doi: 10.1111/j.1472-4642.2011.00780.x",
                        "year": 2011,
                        "authors": "Acacia – Miller et al 2012",
                        "doi": "http://onlinelibrary.wiley.com/doi/10.1111/j.1472-4642.2011.00780.x/full",
                        "numberOfLeaves": 510,
                        "numberOfInternalNodes": 509,
                        "treeId": null,
                        "notes": null,
                        "treeViewUrl": "http://phylolink.ala.org.au/phylo/getTree?studyId=92&treeId=null"
                        }]
                     */
                    click: function (latlng) {
                        if (!latlng) {
                            return;
                        }

                        var self = this;
                        loc = latlng;
                        // reset flag
                        addPopupFlag = true;
                        processedLayers[0] = 0;
                        intersects.splice(0, intersects.length);
                        layers.splice(0, layers.length);
                        occurrences.splice(0, occurrences.length);
                        speciesLayers.splice(0, speciesLayers.length);
                        areaLayers.splice(0, areaLayers.length);
                        ssLayers.splice(0, ssLayers.length);
                        leafletData.getMap().then(function (map) {
                            leafletMap = map;
                            mapService.mappedLayers && mapService.mappedLayers.forEach(function (layer) {
                                if (layer.visible) {
                                    switch (layer.layertype) {
                                        case "contextual":
                                            var f = LayersService.getLayer(layer.id);
                                            if (!$SH.wmsIntersect || (f && f.type === 'a')) {
                                                ssLayers.push(layer.id)
                                            } else {
                                                layers.push(layer)
                                            }
                                            break;
                                        case "grid":
                                            if ($SH.wmsIntersect) {
                                                layers.push(layer);
                                            } else {
                                                ssLayers.push(layer.id);
                                            }
                                            break;
                                        case "area":
                                            areaLayers.push(layer);
                                            break;
                                        case "species":
                                            speciesLayers.push(layer);
                                            break;
                                    }
                                }
                            });

                            if (ssLayers.length) {
                                var promiseIntersect = self.getIntersects(ssLayers, latlng);
                                if (promiseIntersect) {
                                    promiseIntersect.then(function (content) {
                                        intersects.push.apply(intersects, content.data);
                                        addPopupToMap(loc, leafletMap, templatePromise, intersects, occurrenceList);
                                        processedLayers[0] += intersects.length;
                                    })
                                }
                            }

                            if (layers.length) {
                                var promiseIntersect = self.getFeatureInfo(layers, latlng);
                                if (promiseIntersect) {
                                    promiseIntersect.then(function (content) {
                                        //parse plain text content
                                        var result = self.parseGetFeatureInfo(content.data, layers);

                                        intersects.push.apply(intersects, result);
                                        addPopupToMap(loc, leafletMap, templatePromise, intersects, occurrenceList);
                                        processedLayers[0] += intersects.length;
                                    })
                                }
                            }

                            if (areaLayers.length) {
                                areaLayers.forEach(function (layer) {
                                    self.getAreaIntersects(layer.pid, latlng).then(function (resp) {
                                        if (resp.data.name) {
                                            intersects.push({layername: $i18n(402, "Area"), value: resp.data.name});
                                            addPopupToMap(loc, leafletMap, templatePromise, intersects, occurrenceList);
                                        }
                                        processedLayers[0] += 1
                                    })
                                })
                            }

                            occurrenceList = new OccurrenceList(speciesLayers)
                        })
                    },
                    /**
                     * Get layer values for a coordinate.
                     *
                     * TODO: Move to LayersService
                     *
                     * @memberOf PopupService
                     * @param {list} layers list of layer names or fieldIds
                     * @param {latlng} latlng coordinate to inspect as {lat:latitude, lng:longitude}
                     * @returns {HttpPromise}
                     *
                     * @example:
                     * Input:
                     * - layers
                     *  ["cl22", "el899"]
                     * - latlng
                     *  {lat:-22, lng:131}
                     * Output:
                     *  [{
                         "field": "cl22",
                         "layername": "Australian States and Territories",
                         "pid": "67620",
                         "value": "Northern Territory"
                         },
                     {
                     "field": "el899",
                     "layername": "Species Richness",
                     "units": "frequency",
                     "value": 0.037037037
                     }]
                     */
                    getIntersects: function (layers, latlng) {
                        if (typeof layers === "string") {
                            layers = [layers]
                        }

                        var url = $SH.layersServiceUrl + "/intersect/" + layers.join(',') + "/" + latlng.lat + "/" + latlng.lng;
                        return $http.get(url)
                    },
                    getFeatureInfo: function (layers, latlng) {
                        // TODO: support >1 WMS sources
                        var url = layers[0].leaflet.layerOptions.layers[0].url;

                        var layerNames = '';
                        for (var ly in layers) {
                            if (layerNames.length > 0) layerNames += ',';
                            layerNames += layers[ly].leaflet.layerOptions.layers[0].layerOptions.layers
                        }

                        var point = leafletMap.latLngToContainerPoint(latlng, leafletMap.getZoom());
                        var size = leafletMap.getSize();

                        var crs = leafletMap.options.crs;

                        var sw = crs.project(leafletMap.getBounds().getSouthWest());
                        var ne = crs.project(leafletMap.getBounds().getNorthEast());

                        var params = {
                            request: 'GetFeatureInfo',
                            srs: crs.code,
                            bbox: sw.x + ',' + sw.y + ',' + ne.x + ',' + ne.y,
                            height: size.y,
                            width: size.x,
                            layers: layerNames,
                            query_layers: layerNames,
                            feature_count: layers.length * 10,
                            info_format: 'text/plain',
                            x: point.x,
                            i: point.x,
                            y: point.y,
                            j: point.y
                        };

                        var urlBase = url.split('?')[0] + "?";
                        var existingParams = url.split('?')[1].split('&');
                        for (var i in existingParams) {
                            if (!existingParams[i].match(/^layers=.*/)) {
                                urlBase += '&' + existingParams[i];
                            }
                        }

                        url = urlBase.replace("/gwc/service", "") + L.Util.getParamString(params, urlBase, true);

                        return $http.get(url)
                    },
                    /**
                     * Test if an area intersects with a coordinate
                     *
                     * TODO: Move to LayersService
                     *
                     * @memberOf PopupService
                     * @param {list} pid area id
                     * @param {latlng} latlng coordinate to inspect as {lat:latitude, lng:longitude}
                     * @returns {HttpPromise}
                     *
                     * @example
                     * Input:
                     * - pid
                     *  67620
                     * - latlng
                     *  {lat:-22, lng:131}
                     * Output:
                     * {
                            "name_id": 0,
                            "pid": "67620",
                            "id": "Northern Territory",
                            "fieldname": "Australian States and Territories",
                            "featureType": "MULTIPOLYGON",
                            "area_km": 1395847.4575625565,
                            "description": "null",
                            "bbox": "POLYGON((128.999222 -26.002015,128.999222 -10.902499,137.996094 -10.902499,137.996094 -26.002015,128.999222 -26.002015))",
                            "fid": "cl22",
                            "wmsurl": "https://spatial.ala.org.au/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=ALA:Objects&format=image/png&viewparams=s:67620",
                            "name": "Northern Territory"
                        }
                     */
                    getAreaIntersects: function (pid, latlng) {
                        var url = $SH.layersServiceUrl + "/object/intersect/" + pid + "/" + latlng.lat + "/" + latlng.lng;
                        return $http.get(url)
                    },

                    parseGetFeatureInfo: function (plainText, layers) {
                        var result = [];
                        var blockString = "--------------------------------------------";
                        for (var ly in layers) {
                            var layerName = layers[ly].leaflet.layerOptions.layers[0].layerOptions.layers;
                            var field = LayersService.getLayer(layers[ly].id);
                            var sname;
                            if (field) {
                                sname = field.sname;
                            }
                            var units = undefined;

                            //start of layer intersect values in response from geoserver is 'http://{{layerName}}':
                            var start = plainText.indexOf("'http://" + layerName + "':");
                            var value = '';
                            if (start > 0) {
                                var blockStart = plainText.indexOf(blockString, start);
                                var blockEnd = plainText.indexOf(blockString, blockStart + blockString.length);

                                var properties = plainText.substring(blockStart + blockString.length, blockEnd - 1).trim().split("\n")

                                if (sname) {
                                    for (var i in properties) {
                                        if (properties[i].toUpperCase().match('^' + sname.toUpperCase() + ' = .*')) {
                                            value = properties[i].substring(properties[i].indexOf('=') + 2, properties[i].length).trim();
                                        }
                                    }
                                } else {
                                    value = properties[0].substring(properties[0].indexOf('=') + 2, properties[0].length).trim();
                                    if (isNaN(value)) {
                                        // use value as-is
                                    } else if (field) {
                                        // filter out nodatavalues
                                        units = field.layer.environmentalvalueunits;
                                        if (Number(value) < Number(field.layer.environmentalvaluemin)) {
                                            value = '';
                                        }
                                    } else {
                                        // analysis layers have nodatavalue < 0
                                        if (Number(value) < 0) {
                                            value = ''
                                        }
                                    }
                                }
                            }
                            // no intersect with this layer
                            if (units) {
                                result.push({
                                    layername: layers[ly].name,
                                    value: value,
                                    units: units
                                })
                            } else {
                                result.push({
                                    layername: layers[ly].name,
                                    value: value
                                })
                            }
                        }
                        return result;
                    }
                }
            }])
}(angular));