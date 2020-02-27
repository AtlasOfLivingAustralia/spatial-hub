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
                var occurenceBBox = []; //bbox of a popup/occurence. Need to scope level, then won't change when zooming
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


                function OccurrenceList(speciesLayers) {
                    var self = this;
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

                    this.getOccurrence = function (index, layer) {
                        //var q = this.getQueryParams(layer)
                        //Can not use 'getQueryParams' because bbox which decides 'layer' will be overwritten

                        var fq = ["(latitude:[" + occurenceBBox[0][0] + " TO " + occurenceBBox[1][0] + "] AND longitude:[" + occurenceBBox[0][1] + " TO " + occurenceBBox[1][1] + "])"];

                        if (layer.isSelectedFacetsOnly) {// add extra fq, e.g. search selected facade occurence in the layer
                            //q.fqs.push(decodeURIComponent(layer.sel))
                            fq.push(decodeURIComponent(layer.sel))
                        } else if (layer.isWithoutSelectedFacetsOnly) {
                            //q.fqs.push('-('+decodeURIComponent(layer.sel)+')');
                            fq.push('-(' + decodeURIComponent(layer.sel) + ')')

                        }

                        self.layer = layer;
                        biocacheService.searchForOccurrences(layer, fq, 1, index).then(function (data) {
                            if (data.occurrences && data.occurrences.length) {
                                addPopupToMap(loc, leafletMap, templatePromise, intersects, occurrenceList);
                                // empty array
                                data.occurrences[0].layername = layer.name;
                                self.occurrences.splice(0, self.occurrences.length);
                                self.occurrences.push.apply(self.occurrences, data.occurrences);

                                //data.occurrences[0].adhocGroup = self.isAdhocGroup();
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

                        //check if current oc is in the bboxes
                        //var lat = self.occurrences[0].decimalLatitude;
                        //var lng = self.occurrences[0].decimalLongitude;
                        // var isIn = false;
                        /* for(var i in layer.adhocBBoxes){
                             var bbox = layer.adhocBBoxes[i];
                             if (lat >= bbox[0][0] && lat<=bbox[1][0] && lng >= bbox[0][1] && lng <= bbox[1][1]){
                                 isIn = true;
                             }
                         }*/

                        if (layer.adhocBBoxes && layer.adhocBBoxes.length > 0) {
                            var orFqs = []
                            var iFq = '(id:' + id + ")";
                            for (var i in layer.adhocBBoxes) {
                                var occurenceBBox = layer.adhocBBoxes[i];
                                var bFq = "(latitude:[" + occurenceBBox[0][0] + " TO " + occurenceBBox[1][0] + "] AND longitude:[" + occurenceBBox[0][1] + " TO " + occurenceBBox[1][1] + "])";
                                // Append SEL in
                                if (occurenceBBox[2]) {
                                    bFq = "(" + bFq + ' AND ' + occurenceBBox[2] + ")"
                                }
                                orFqs.push(bFq)
                            }

                            var bbq = "(" + orFqs.join(' OR ') + ")";

                            var fqs = [iFq, bbq];


                            return biocacheService.count(layer, fqs).then(function (count) {
                                if (count == 1) {
                                    return $q.when(true);
                                } else {
                                    return $q.when(false);
                                }
                            });
                        } else
                            return $q.when(false);


                    }

                    this.isAdhocOrBBox = function () {
                        var oc = self.occurrences[0];
                        var id = oc.uuid;

                        if (self.isAdhocGroup()) // it is MANUALLY checked
                            oc.adhocGroup = true;
                        else if (self.layer.adhocGroup[id] == false) // Manually unchecked,
                            oc.adhocGroup = false;
                        else {
                            self.isInBBox().then(function (result) {
                                oc.adhocGroup = result;
                                // if ( self.layer.adhocGroup[id] == undefined && result)
                                //     return true;
                                // else if ( self.layer.adhocGroup[id] == undefined && !result)
                                //     return false;
                                // else
                                //     return false;
                            })
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
                        //Todo It will causes inaccurate layer.adhocGroupSize

                        var isChecked = oc.adhocGroup;
                        layer.adhocGroup[id] = isChecked;

                        //Caculate adhocGroupSize
                        this.countAdhocOccurences();


                        // if (layer.adhocGroup[id] !== undefined) layer.adhocGroup[id] = !layer.adhocGroup[id];
                        // else layer.adhocGroup[id] = true;
                        //
                        // if (layer.adhocGroup[id]) layer.adhocGroupSize++;
                        // else layer.adhocGroupSize--
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
                        // this.toggleDisplayLayer(targetlayer)
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
                        //this.showThisLayerOnly(targetedLayer)
                        this.showSelOfLayer(targetedLayer, true);
                    }
                    this.toggleUnSelFacadeOnLayer = function (targetedLayer) {
                        targetedLayer.isWithoutSelectedFacetsOnly = true;
                        targetedLayer.isSelectedFacetsOnly = false;
                        //this.showThisLayerOnly(targetedLayer)
                        this.showSelOfLayer(targetedLayer, true);
                    }


                    this.toggleBBox = function () {
                        //Match the algorithm in getQueryParams and getLatLngFq
                        //New feautre: bind with Sel facade

                        var layer = self.layer;
                        if (layer.adhocBBoxes == undefined) layer.adhocBBoxes = [];
                        if (layer.adhocGroup == undefined) layer.adhocGroup = {};

                        var currentOB = occurenceBBox.slice();
                        if (layer.isSelectedFacetsOnly)
                            currentOB.push('(' + decodeURIComponent(layer.sel) + ')');
                        else if (layer.isWithoutSelectedFacetsOnly)
                            currentOB.push(decodeURIComponent("-(" + layer.sel + ")"))
                        else
                            currentOB.push('')

                        var idx = layer.adhocBBoxes.findIndex(function (box) {
                            return JSON.stringify(box) == JSON.stringify(currentOB)
                        })


                        if (idx == -1) {
                            layer.adhocBBoxes.push(currentOB);
                            this.adjustAdhoc().then(function () {
                                self.countAdhocOccurences();
                                //check if current oc is in the bbox
                                self.tickOccurence();
                            });
                        }


                    }
                    // get ids in adhoc group and occurencebbox
                    //occurenceBBox MUST EXIST
                    this.adjustAdhoc = function () {
                        var layer = self.layer;
                        var oids = Object.keys(layer.adhocGroup);
                        if (occurenceBBox && oids.length > 0) {
                            var fqs = []
                            var oFq = '(id:' + oids.join(' OR id:') + ")";
                            var bFq = "(latitude:[" + occurenceBBox[0][0] + " TO " + occurenceBBox[1][0] + "] AND longitude:[" + occurenceBBox[0][1] + " TO " + occurenceBBox[1][1] + "])";
                            fqs.push(oFq)
                            fqs.push(bFq);

                            //Be AWARE OF BLACKETS, MAY NOT WORK
                            if (layer.isSelectedFacetsOnly)
                                fqs.push("(" + decodeURIComponent(layer.sel) + ")");
                            else if (layer.isWithoutSelectedFacetsOnly)
                                fqs.push(decodeURIComponent("-(" + layer.sel + ")"))

                            var newq = {
                                q: fqs,
                                bs: layer.bs,
                                ws: layer.ws
                            }

                            return biocacheService.facetGeneral('id', newq, -1, 0).then(function (data) {
                                if (data !== undefined) {
                                    var id_frs = _.find(data, function (d) {
                                        return data.fieldName = 'id'
                                    })
                                    if (id_frs && id_frs.count > 0) {
                                        var frs = id_frs.fieldResult;
                                        if (frs) {
                                            _.each(frs, function (idfacet) {
                                                delete layer.adhocGroup[idfacet.label];
                                            })
                                        }
                                    }
                                }

                            });

                        }
                        //returned finished promise
                        return $q.when('Done');
                    }

                    this.countAdhocOccurences = function () {
                        var layer = self.layer;
                        var fq = this.buildAdhocQuery()
                        if (fq.length > 0)
                            biocacheService.count(layer, fq).then(function (count) {
                                layer.adhocGroupSize = count;
                            });
                        else
                            layer.adhocGroupSize = 0;
                    }

                    //Todo can fq generation in one place?

                    this.buildAdhocQuery = function () {
                        var layer = self.layer;
                        if (layer.adhocBBoxes)
                            var bboxes = layer.adhocBBoxes.slice();
                        else {
                            var bboxes = layer.adhocBBoxes = [];
                        }
                        var fqs = []

                        // bbox and in adhoc should use OR
                        var bbox_inadhoc = []
                        bboxes.forEach(function (bbox) {
                            var bbq = "(latitude:[" + bbox[0][0] + " TO " + bbox[1][0] + "] AND longitude:[" + bbox[0][1] + " TO " + bbox[1][1] + "])";
                            // Append SEL in
                            if (bbox[2]) {
                                bbq = "(" + bbq + ' AND ' + bbox[2] + ")"
                            }

                            bbox_inadhoc.push(bbq);

                        })

                        //Selected adhoc group items
                        //Caculate adhocGroup 'True' as in; 'False' as out
                        var inAdhocs = _.filter(_.keys(layer.adhocGroup), function (key) {
                            return layer.adhocGroup[key]
                        });
                        var inFq = ''
                        if (inAdhocs.length > 0)
                            var inFq = 'id:' + inAdhocs.join(' OR id:');
                        if (inFq !== '')
                            bbox_inadhoc.push(inFq);

                        var bboxQ = ''
                        if (bbox_inadhoc.length > 1)
                            bboxQ = '(' + bbox_inadhoc.join(' OR ') + ")";
                        else if (bbox_inadhoc.length == 1)
                            bboxQ = bbox_inadhoc[0];

                        // //sync q to layer, which is used by spLegend or other place
                        layer.inAdhocQ = bboxQ;
                        //all bboxes with extra included id are concated into one query, which is bboxQ
                        if (bboxQ !== '') {
                            fqs.push(bboxQ);
                            //Out adhoc ONLY have meaning when query has some adhocs
                            //Otherwise it return all records - out adhoc number
                            //Out adhoc should be AND
                            var outAdhocs = _.reject(_.keys(layer.adhocGroup), function (key) {
                                return layer.adhocGroup[key]
                            });
                            if (outAdhocs.length > 0) {
                                var outFq = '-(id:' + outAdhocs.join(' OR id:') + ')';
                                fqs.push(outFq);
                                layer.inAdhocQ = bboxQ + ' AND ' + outFq;
                            }

                        }


                        layer.outAdhocQ = '-(' + layer.inAdhocQ + ')';

                        return fqs;

                    }


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
                            //var q = self.getQueryParams(self.layer);
                            var fq = self.getLatLngFq(loc, self.layer.size)
                            var url = biocacheService.constructSearchResultUrl(self.layer, fq, 10, 0, true).then(function (url) {
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
                        //var q = self.getQueryParams(layer);
                        var fq = self.getLatLngFq(loc, layer.size).slice()
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
                                    //layer.withoutSelCount = layer.total - count;
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

                    //Watch if sel on a layer is changed
                    $rootScope.$watch(function () {
                        if (self.layer)
                            return self.layer.sel;
                        else
                            return ''
                    }, function (newValues, oldValues) {
                        var layer = self.layer;
                        //var q = self.getQueryParams(layer);
                        //Count occurences with facet selection
                        if (layer && layer.sel) {
                            //layer.sel has been encoded in spLengend.js

                            var fq = ["(latitude:[" + occurenceBBox[0][0] + " TO " + occurenceBBox[1][0] + "] AND longitude:[" + occurenceBBox[0][1] + " TO " + occurenceBBox[1][1] + "])"];
                            //layer.sel has been encoded in spLengend.js
                            var inFq = fq.slice();
                            inFq.push(decodeURIComponent(layer.sel));
                            biocacheService.count(layer, inFq).then(function (count) {
                                layer.selCount = count;
                                //layer.withoutSelCount = layer.total - count;
                            })
                            // sel ends
                            var outFq = fq.slice()
                            outFq.push('-(' + decodeURIComponent(layer.sel) + ')')
                            biocacheService.count(layer, outFq).then(function (count) {
                                layer.withoutSelCount = count
                            })

                        }// sel ends


                    });


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
                            //Caculate bbox of the clicked occurence - scope level
                            if (speciesLayers[0]) {
                                var layer = speciesLayers[0]
                                var dotradius = layer.size * 1 + 3;
                                var px = leafletMap.latLngToContainerPoint(loc);
                                var ll = leafletMap.containerPointToLatLng(L.point(px.x + dotradius, px.y + dotradius));
                                var lonSize = Math.abs(loc.lng - ll.lng);
                                var latSize = Math.abs(loc.lat - ll.lat);
                                occurenceBBox = [[loc.lat - latSize, loc.lng - lonSize], [loc.lat + latSize, loc.lng + lonSize]]
                            }

                            occurrenceList = new OccurrenceList(speciesLayers);

                        });

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

                        return LayersService.intersectLayers(layers, latlng.lng, latlng.lat)
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

                        var split = url.split('?');
                        var urlBase = split[0] + "?";
                        var existingParams = '';
                        if (split.length > 1) {
                            existingParams = split[1].split('&');
                        }
                        for (var i in existingParams) {
                            if (existingParams[i].match(/^layers=.*/) == null) {
                                urlBase += '&' + existingParams[i];
                            }
                        }

                        url = urlBase.replace("/gwc/service", "") + L.Util.getParamString(params, urlBase, true);

                        return $http.get(url, _httpDescription('getFeatureInfo'))
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
                        return $http.get(url, _httpDescription('getAreaIntersects'))
                    },

                    parseGetFeatureInfo: function (plainText, layers) {
                        var result = [];
                        var blockString = "--------------------------------------------";
                        for (var ly in layers) {
                            var layerName = layers[ly].leaflet.layerOptions.layers[0].layerOptions.layers;
                            layerName = layerName.replace("ALA:", "");
                            var field = LayersService.getLayer(layers[ly].id + '');
                            var sname;
                            if (field) {
                                sname = field.sname;
                            }
                            var units = undefined;

                            //start of layer intersect values in response from geoserver is "http.*{{layerName}}':"
                            var start = plainText.indexOf(layerName + "':");
                            var value = '';
                            if (start > 0) {
                                var blockStart = plainText.indexOf(blockString, start);
                                var blockEnd = plainText.indexOf(blockString, blockStart + blockString.length);

                                var properties = plainText.substring(blockStart + blockString.length, blockEnd - 1).trim().split("\n")

                                if (sname) {
                                    for (var i in properties) {
                                        if (properties[i].toUpperCase().match('^' + sname.toUpperCase() + ' = .*') != null) {
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