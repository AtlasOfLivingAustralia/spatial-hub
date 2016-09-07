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
    angular.module('popup-service', ['leaflet-directive', 'map-service', 'biocache-service'])
        .factory("PopupService", [ '$rootScope', '$compile', '$http', '$window', '$templateRequest', 'leafletData', 'MapService', 'BiocacheService',
            function ( $rootScope, $compile, $http, $window, $templateRequest, leafletData, mapService, biocacheService) {
                var addPopupFlag = true,
                    popup, loc, leafletMap
                var templatePromise = $templateRequest('portal/intersectPopupContent.html')
                var intersects = [],
                    layers = [],
                    speciesLayers = [],
                    occurrences = [],
                    occurrenceList
                function addPopupToMap(latlng, map, templatePromise, intersects, occurrences) {
                    if(addPopupFlag){
                        templatePromise.then(function (content) {
                            var popupScope = $rootScope.$new()
                            popupScope.intersects = intersects
                            popupScope.olist = occurrences
                            var html = $compile( content )(popupScope)
                            popup = L.popup({maxWidth: 500, maxHeight: 400, minWidth: 300})
                                .setLatLng(latlng)
                                .setContent(html[0])
                                .openOn(map);
                            addPopupFlag = false
                        })
                    }
                }

                function OccurrenceList(layers) {
                    var self = this,
                        isFirstOccurrence = true,
                        layersWithResults = []
                    layers = angular.copy(layers)

                    this.occurrences = []
                    this.pageSize = 1;
                    this.total = 0
                    this.index = 0
                    this.layers = undefined
                    this.config = SpatialPortalConfig
                    
                    this.getFirstOccurrence = function (layer) {
                        if(isFirstOccurrence){
                            self.getOccurrence(0, layer)
                            isFirstOccurrence = false
                        }
                    }
                    
                    this.getOccurrence = function (index, layer) {
                        var q = this.getQueryParams(layer)
                        self.layer = layer
                        biocacheService.searchForOccurrences(q.query, q.fqs, 1, index).then(function (data) {
                            if (data.occurrences && data.occurrences.length) {
                                addPopupToMap(loc, leafletMap, templatePromise, intersects, occurrenceList)
                                // empty array
                                data.occurrences[0].layername = layer.name
                                self.occurrences.splice(0, self.occurrences.length)
                                self.occurrences.push.apply(self.occurrences, data.occurrences)
                                // popup && popup.update()
                            }
                        })
                    }

                    this.getNextOccurrence = function () {
                        var nextIndex = self.index + 1
                        if(nextIndex >= self.total){
                            return
                        }

                        self.index += 1
                        var query = this.getSearchLayerAndIndex()
                        this.getOccurrence (query.index, query.layer)
                    }

                    this.getPrevOccurrence = function () {
                        var nextIndex = self.index - 1
                        if(nextIndex >= self.total || nextIndex < 0){
                            return
                        }

                        self.index -= 1
                        var query = this.getSearchLayerAndIndex()
                        this.getOccurrence (query.index, query.layer)
                    }

                    this.getSearchLayerAndIndex = function () {
                        var result = {layer: undefined, index: 0},
                            total = 0
                        layersWithResults.forEach(function (layer) {
                            if(layer){
                                if((self.index < (total + layer.total) && (self.index >= total))){
                                    result.layer = layer
                                    result.index = self.index - total
                                }

                                total += layer.total
                            }
                        })

                        return result
                    }

                    this.getQueryParams = function (layer) {
                        var q = { query:{}, fqs: undefined},
                            fqs
                        q.query.bs = layer.bs
                        q.query.ws = layer.ws
                        q.query.q = layer.q
                        q.fqs = []
                        layer.fq && layer.fq.forEach(function (fq) {
                            if((fq.indexOf(/latitude/) != -1) || (fq.indexOf(/longitude/) != -1)){
                                q.fqs.push(fq)
                            }
                        })

                        fqs = self.getLatLngFq(loc)
                        q.fqs.push.apply(q.fqs, fqs)

                        return q
                    }

                    this.getLatLngFq = function (latlng) {
                        var zoom = leafletMap && leafletMap.getZoom(),
                            fq = []
                        if(zoom > 10){
                            fq.push("latitude:[" + (latlng.lat- 0.01) + " TO " + (latlng.lat+ 0.01) + "]")
                            fq.push("longitude:[" + (latlng.lng- 0.01) + " TO " + (latlng.lng+ 0.01) + "]")
                        } else if(zoom > 5){
                            fq.push("latitude:[" + (latlng.lat- 0.1) + " TO " + (latlng.lat+ 0.1) + "]")
                            fq.push("longitude:[" + (latlng.lng- 0.1) + " TO " + (latlng.lng+ 0.1) + "]")
                        } if(zoom >= 0){
                            fq.push("latitude:[" + (latlng.lat- 0.5) + " TO " + (latlng.lat+ 0.5) + "]")
                            fq.push("longitude:[" + (latlng.lng- 0.5) + " TO " + (latlng.lng+ 0.5) + "]")
                        }

                        return fq
                    }

                    this.listRecords = function () {
                        var q = self.getQueryParams(self.layer)
                        var url = biocacheService.constructSearchResultUrl(q.query, q.fqs, 10, 0, true)
                        $window.open(url, "_blank")
                    }

                    this.viewRecord = function () {
                        var url = self.layer.ws + "/occurrences/" + self.occurrences[0].uuid
                        $window.open(url, "_blank")
                    }

                    this.zoomToRecord = function () {
                        var occ = self.occurrences[0]
                        var lattng = L.latLng(occ.decimalLatitude, occ.decimalLongitude)
                        mapService.leafletScope.zoomToPoint(lattng, 10)
                        leafletMap.closePopup()
                    }
                    
                    layers.forEach(function (layer) {
                        var q = self.getQueryParams(layer)
                        biocacheService.count(q.query, q.fqs).then(function(count){
                            if(count != undefined){
                                layersWithResults.push(layer)
                                layer.total = count
                                self.total += count
                                self.getFirstOccurrence(layer)
                            }
                        })
                    })
                }

                return {
                    click: function (latlng) {
                        if(!latlng){
                            return;
                        }

                        var self = this
                        loc = latlng
                        // reset flag
                        addPopupFlag = true
                        intersects.splice(0, intersects.length)
                        layers.splice(0, layers.length)
                        occurrences.splice(0, occurrences.length)
                        speciesLayers.splice(0, speciesLayers.length)
                        leafletData.getMap().then(function (map) {
                            leafletMap = map
                            mapService.mappedLayers && mapService.mappedLayers.forEach(function (layer) {
                                if (layer.visible) {
                                    switch (layer.layertype){
                                        case "contextual":
                                        case "grid":
                                            layers.push(layer.id)
                                            break;
                                        case "area":
                                            intersects.push({layername: 'Area', value: layer.name})
                                            break;
                                        case "species":
                                            speciesLayers.push(layer)
                                            break;
                                    }
                                }
                            })

                            var promiseIntersect = self.getIntersects(layers, latlng)
                            if (promiseIntersect) {
                                promiseIntersect.then(function (content) {
                                    addPopupToMap(loc, leafletMap, templatePromise, intersects, occurrenceList)
                                    intersects.push.apply(intersects, content.data)
                                })
                            }

                            occurrenceList = new OccurrenceList(speciesLayers)
                            if(layers.length){
                                addPopupToMap(latlng, map, templatePromise, intersects, occurrenceList)
                            }
                        })
                    },
                    getIntersects: function (layers, latlng) {
                        if(layers.length){
                            var url = SpatialPortalConfig.layersServiceUrl + "/intersect/"+ layers.join(',') + "/" + latlng.lat + "/" + latlng.lng;
                            return $http.get(url)
                        }
                    }
                }
            }])
}(angular));