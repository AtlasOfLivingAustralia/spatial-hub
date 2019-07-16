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
        .factory("PopupService", ['$rootScope', '$compile', '$http', '$q', '$window', '$templateRequest', 'leafletData', 'MapService', 'BiocacheService', 'LayersService',
            function ($rootScope, $compile, $http, $q, $window, $templateRequest, leafletData, mapService, biocacheService, LayersService) {
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
                var occurrenceBBox = []; //bbox of a popup/occurence. Need to scope level, then won't change when zooming
                var processedLayers = [0];

                var _httpDescription = function (method, httpconfig) {
                    if (httpconfig === undefined) {
                        httpconfig = {};
                    }
                    httpconfig.service = 'PopupService';
                    httpconfig.method = method;

                    return httpconfig;
                };


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


                function OccurrenceList(speciesLayers, occurrenceBBox) {
                    var self = this;
                    this.occurrenceBBox = occurrenceBBox
                    this.isFirstOccurrence = true;
                    this.layersWithResults = [];

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
                        if (self.isFirstOccurrence) {
                            self.getOccurrence(0, layer);
                            self.isFirstOccurrence = false
                        }
                    };

                    /**
                     * Get the fq terms for a layer.
                     *
                     * Optionally include fq terms to
                     * - Restrict results to the clicked bounding box.
                     * - Restrict results to occurrences matching the adhoc terms.
                     * - Restrict results to occurrences not in matching the adhoc terms.
                     *
                     * Adhoc terms are constructed from
                     * - layer.adhocGroup that lists occurrence ids that are included or excluded.
                     * - layer.adhocBBoxes that lists bounding boxes of occurrences that are included.
                     *
                     * @param layer
                     * @param includeClickedBox boolean
                     * @param includeAdhoc boolean
                     * @param excludeAdhoc boolean
                     * @returns {Array}
                     */
                    this.getFq = function (layer, includeClickedBox, includeAdhoc, excludeAdhoc) {
                        var facetFq = biocacheService.facetsToFq(layer.facets, true);
                        var fq = [];
                        if (facetFq.fq) {
                            if (layer.isSelectedFacetsOnly) {
                                fq = facetFq.fq;
                            } else if (layer.isWithoutSelectedFacetsOnly) {
                                fq = ["-((" + fqcetFq.fq.join(") AND (") + "))"];
                            }
                        }

                        // include clicked bbox
                        if (includeClickedBox) {
                            fq.push("latitude:[" + this.occurrenceBBox[0][0] + " TO " + this.occurrenceBBox[1][0] + "]")
                            fq.push("longitude:[" + this.occurrenceBBox[0][1] + " TO " + this.occurrenceBBox[1][1] + "]");
                        }

                        var includedFqs = []
                        var excludedFqs = []

                        // include adhoc term
                        if (includeAdhoc || excludeAdhoc) {
                            for (var k in layer.adhocGroup) {
                                if (layer.adhocGroup[k]) {
                                    // include
                                    includedFqs.push("id:" + k)
                                } else {
                                    // exclude
                                    excludedFqs.push("id:" + k)
                                }
                            }

                            for (var i in layer.adhocBBoxes) {
                                var occurrenceBBox = layer.adhocBBoxes[i];
                                includedFqs.push("(latitude:[" + occurrenceBBox[0][0] + " TO " + occurrenceBBox[1][0] + "] AND longitude:[" + occurrenceBBox[0][1] + " TO " + occurrenceBBox[1][1] + "])");
                            }
                        }

                        if (includeAdhoc) {
                            if (includedFqs.length > 0) {
                                fq.push(includedFqs.join(" OR "))
                            }
                            if (excludedFqs.length > 0) {
                                fq.push("(*:* AND -" + excludedFqs.join(" AND -") + ")")
                            }
                        }

                        if (excludeAdhoc) {
                            var term = '';
                            if (includedFqs.length > 0) {
                                term += "(*:* AND -" + includedFqs.join(" AND -") + ")";
                                if (excludedFqs.length > 0) {
                                    term += " OR "
                                }
                            }
                            if (excludedFqs.length > 0) {
                                term += excludedFqs.join(" OR ")
                            }
                            if (term.length > 0) {
                                fq.push(term)
                            }
                        }

                        return fq;
                    }

                    this.getOccurrence = function (index, layer) {
                        var fq = this.getFq(layer, true, false, false)

                        self.layer = layer;
                        biocacheService.searchForOccurrences(layer, fq, 1, index).then(function (data) {
                            if (data.occurrences && data.occurrences.length) {
                                addPopupToMap(loc, leafletMap, templatePromise, intersects, occurrenceList);
                                // empty array
                                data.occurrences[0].layername = layer.name;
                                self.occurrences.splice(0, self.occurrences.length);
                                self.occurrences.push.apply(self.occurrences, data.occurrences);

                                //check if ticked or in bbox
                                self.tickOccurence();

                                self.viewRecord()
                            }
                        })

                    };


                    this.tickOccurence = function () {
                        this.isAdhocOrBBox()
                    }

                    this.isAdhocGroup = function () {
                        var layer = self.layer;
                        var id = self.occurrences[0].uuid;
                        if (layer.adhocGroup === undefined) {
                            layer.adhocGroup = {};
                            layer.adhocGroupSize = 0
                        }
                        return layer.adhocGroup[id] !== undefined && layer.adhocGroup[id]
                    };

                    this.isInBBox = function () {
                        var layer = self.layer;
                        var oc = self.occurrences[0];
                        var id = oc.uuid;

                        if (layer.adhocBBoxes && layer.adhocBBoxes.length > 0) {
                            for (var i in layer.adhocBBoxes) {
                                var occurrenceBBox = layer.adhocBBoxes[i];
                                if (oc.decimalLatitude <= occurrenceBBox[1][0] && oc.decimalLatitude >= occurrenceBBox[0][0] &&
                                    oc.decimalLongitude <= occurrenceBBox[1][1] && oc.decimalLongitude >= occurrenceBBox[0][1]) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }

                    this.isAdhocOrBBox = function () {
                        var oc = self.occurrences[0];
                        var id = oc.uuid;

                        if (self.isAdhocGroup()) {// it is MANUALLY checked
                            oc.adhocGroup = true;
                        } else if (self.layer.adhocGroup[id] == false) { // Manually unchecked,
                            oc.adhocGroup = false;
                        } else {
                            oc.adhocGroup = self.isInBBox();
                        }
                    }

                    this.toggleAdhocGroup = function () {
                        var layer = self.layer;
                        var oc = self.occurrences[0];
                        var id = self.occurrences[0].uuid;
                        if (layer.adhocGroup === undefined) {
                            layer.adhocGroup = {};
                            layer.adhocGroupSize = 0
                        }
                        //this variable is linked with its Checkbox
                        //it may be set by bbox which related to the function 'add all to adhoc'

                        var isChecked = oc.adhocGroup;
                        layer.adhocGroup[id] = isChecked;

                        //Caculate adhocGroupSize
                        this.countAdhocOccurences();

                        this.buildAdhocQuery();
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

                    this.listRecords = function () {
                        if (self.layer !== undefined) {
                            var fq = self.getFq(self.layer, true, false, false)
                            var url = biocacheService.constructSearchResultUrl(self.layer, fq, 10, 0, true).then(function (url) {
                                self.listRecordsUrl = url
                            })
                        }
                    };

                    this.getSearchLayerAndIndex = function () {
                        var result = {layer: undefined, index: 0},
                            total = 0;
                        _.filter(self.layersWithResults, function (layer) {
                            return layer.isDisplayed
                        })
                            .forEach(function (layer) {
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

                    this.showThisLayerOnly = function (targetlayer) {
                        _.each(self.layersWithResults, function (layer) {
                            if (layer.name == targetlayer.name)
                                layer.isDisplayed = true;
                            else
                                layer.isDisplayed = false;
                        })

                        //Reset to show oc over the layer, not selected facets
                        targetlayer.isSelectedFacetsOnly = false;
                        targetlayer.isWithoutSelectedFacetsOnly = false;

                        this.toggleDisplayLayer(targetlayer)
                    }

                    this.showSelOfLayer = function (targetlayer, isSel) {
                        _.each(self.layersWithResults, function (layer) {
                            if (layer.name == targetlayer.name)
                                layer.isDisplayed = true;
                            else
                                layer.isDisplayed = false;
                        })

                        if (isSel) {
                            if (targetlayer.isSelectedFacetsOnly) {
                                self.index = 0;
                                self.total = targetlayer.selCount
                            } else if (targetlayer.isWithoutSelectedFacetsOnly) {
                                self.index = 0;
                                self.total = targetlayer.withoutSelCount;
                            }
                            this.getOccurrence(0, targetlayer);

                        } else {
                            targetlayer.isSelectedFacetsOnly = false;
                            targetlayer.isWithoutSelectedFacetsOnly = false;
                            this.toggleDisplayLayer(targetlayer)
                        }
                    }

                    this.toggleDisplayLayer = function (targetedlayer) {
                        var result = {layer: undefined, index: 0}
                        var futureLayerIdx = 0;

                        var selectedLayerIdx = _.findIndex(self.layersWithResults, function (layer) {
                            return layer.name == targetedlayer.name;
                        })
                        //if check in a layer
                        if (targetedlayer.isDisplayed) {
                            futureLayerIdx = selectedLayerIdx;
                        } else { //check out the layer
                            // index jumps to the first oc of next layer. Move to first layer if the selected is the last layer
                            var c = self.layersWithResults.length;
                            if (selectedLayerIdx == c - 1) { // last one - then move to the first item of first layer
                                futureLayerIdx = 0;
                            } else {
                                futureLayerIdx = selectedLayerIdx + 1;
                            }
                        }
                        result.layer = self.layersWithResults[futureLayerIdx];

                        //recalculate the GLOBAL idx and total count of selected layer for display
                        self.total = 0;
                        var displayedLayers = _.filter(self.layersWithResults, function (layer) {
                            return layer.isDisplayed
                        })

                        for (var i = 0; i < displayedLayers.length; i++) {
                            // find the current layer and caculate GLOBAL idx
                            if (result.layer.name == displayedLayers[i].name)
                                self.index = self.total + result.index;
                            self.total += displayedLayers[i].total
                        }

                        this.getOccurrence(result.index, result.layer);
                    }

                    this.toggleSelFacadeOnLayer = function (targetedLayer) {
                        targetedLayer.isWithoutSelectedFacetsOnly = false;
                        targetedLayer.isSelectedFacetsOnly = true;
                        this.showSelOfLayer(targetedLayer, true);
                    }
                    this.toggleUnSelFacadeOnLayer = function (targetedLayer) {
                        targetedLayer.isWithoutSelectedFacetsOnly = true;
                        targetedLayer.isSelectedFacetsOnly = false;
                        this.showSelOfLayer(targetedLayer, true);
                    }


                    this.toggleBBox = function () {
                        //New feautre: bind with Sel facade

                        var layer = self.layer;
                        if (layer.adhocBBoxes == undefined) layer.adhocBBoxes = [];
                        if (layer.adhocGroup == undefined) layer.adhocGroup = {};

                        // Toggle occurrenceBBox globally for the layer, regardless of the facet or layer selection
                        var jsonBBox = JSON.stringify(this.occurrenceBBox);
                        var idx = layer.adhocBBoxes.findIndex(function (box) {
                            return JSON.stringify(box) == jsonBBox
                        })

                        if (idx == -1) {
                            layer.adhocBBoxes.push(this.occurrenceBBox);

                            self.countAdhocOccurences();

                            //check if current oc is in the bbox
                            self.tickOccurence();
                        } else {
                            adhocBBoxes.splice(idx, 1)
                        }

                        this.buildAdhocQuery();
                    }

                    this.countAdhocOccurences = function () {
                        var layer = self.layer;
                        var fq = this.getFq(layer, false, true, false)
                        if (layer.adhocBBoxes.length > 0 || layer.adhocGroup.length > 0) {
                            biocacheService.count(layer, fq).then(function (count) {
                                layer.adhocGroupSize = count;
                            });
                        } else {
                            layer.adhocGroupSize = 0;
                        }
                    }

                    this.buildAdhocQuery = function () {
                        // //sync q to layer, which is used by spLegend or other place
                        self.layer.inAdhocQ = this.getFq(self.layer, false, true, false);
                        self.layer.outAdhocQ = this.getFq(self.layer, false, false, true);
                    }

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

                    this.devMode = function () {
                        if ($SH.enviroment === 'DEVELOPMENT')
                            return true;
                        else
                            return false;
                    }

                    this.showAdhocBBoxList = function () {
                        this.hideAhhocBBoxList = !this.hideAhhocBBoxList
                    }

                    this.removeAdhocBBox = function (idx) {
                        this.layer.adhocBBoxes.splice(idx, 1);
                    }

                    speciesLayers.forEach(function (layer) {
                        var fq = self.getFq(layer, true, false, false)
                        biocacheService.count(layer, fq).then(function (count) {
                            if (count !== undefined && count > 0) {
                                self.layersWithResults.push(layer);
                                layer.total = count;
                                layer.isDisplayed = true;
                                self.total += count;
                                self.getFirstOccurrence(layer)
                            }
                            processedLayers[0] += 1;

                            self.listRecords();
                            self.viewRecord();
                        }).then(function () {
                            //Count occurences with facet selection
                            if (layer.sel) {
                                //layer.sel has been encoded in spLengend.js
                                var inFq = fq.slice();
                                inFq.push(decodeURIComponent(layer.sel));
                                biocacheService.count(layer, inFq).then(function (count) {
                                    layer.selCount = count;
                                })
                                // sel ends
                                var outFq = fq.slice()
                                outFq.push('-(' + decodeURIComponent(layer.sel) + ')')
                                biocacheService.count(layer, outFq).then(function (count) {
                                    layer.withoutSelCount = count;
                                })
                            }
                        })
                    });

                    var self = this;
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
                                            if (layer.type === "envelope") {
                                                var layerid = '' + layer.id;
                                                var f = LayersService.getLayer(layerid);
                                                if (!$SH.wmsIntersect || (f && f.type === 'a')) {
                                                    ssLayers.push(layerid)
                                                } else {
                                                    layers.push(layer)
                                                }
                                            } else {
                                                areaLayers.push(layer);
                                            }
                                            break;
                                        case "species":
                                            speciesLayers.push(layer);
                                            break;
                                    }
                                }
                            });

                            if (ssLayers.length) {
                                var promiseIntersect = LayersService.getIntersects(ssLayers, latlng.lat, latlng.lng);
                                if (promiseIntersect) {
                                    promiseIntersect.then(function (content) {
                                        intersects.push.apply(intersects, content.data);
                                        addPopupToMap(loc, leafletMap, templatePromise, intersects, occurrenceList);
                                        processedLayers[0] += intersects.length;
                                    })
                                }
                            }

                            if (layers.length) {
                                var promiseIntersect = LayersService.getFeatureInfo(layers, leafletMap, latlng);
                                if (promiseIntersect) {
                                    promiseIntersect.then(function (content) {
                                        var result = content;

                                        intersects.push.apply(intersects, result);
                                        addPopupToMap(loc, leafletMap, templatePromise, intersects, occurrenceList);
                                        processedLayers[0] += intersects.length;
                                    })
                                }
                            }

                            if (areaLayers.length) {
                                areaLayers.forEach(function (layer) {
                                    LayersService.getAreaIntersects(layer.pid, latlng).then(function (resp) {
                                        if (resp.data.name) {
                                            intersects.push({layername: $i18n(402, "Area"), value: resp.data.name});
                                            addPopupToMap(loc, leafletMap, templatePromise, intersects, occurrenceList);
                                        }
                                        processedLayers[0] += 1
                                    })
                                })
                            }
                            //Caculate bbox of the clicked occurence - scope level
                            if (speciesLayers[0]) {
                                var layer = speciesLayers[0]
                                var dotradius = layer.size * 1 + 3;
                                var px = leafletMap.latLngToContainerPoint(loc);
                                var ll = leafletMap.containerPointToLatLng(L.point(px.x + dotradius, px.y + dotradius));
                                var lonSize = Math.abs(loc.lng - ll.lng);
                                var latSize = Math.abs(loc.lat - ll.lat);
                                occurrenceBBox = [[loc.lat - latSize, loc.lng - lonSize], [loc.lat + latSize, loc.lng + lonSize]]
                            }

                            occurrenceList = new OccurrenceList(speciesLayers, occurrenceBBox);

                        });
                    }
                }
            }])
}(angular));