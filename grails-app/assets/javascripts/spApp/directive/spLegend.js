(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name spLegend
     * @description
     *    Panel displaying selected map layer information and controls
     */
    angular.module('sp-legend-directive', ['map-service', 'biocache-service', 'layers-service', 'popup-service'])
        .directive('spLegend', ['$timeout', '$q', 'MapService', 'BiocacheService', 'LayersService', 'ColourService', '$http', 'LayoutService', 'PopupService', 'EventService',
            function ($timeout, $q, MapService, BiocacheService, LayersService, ColourService, $http, LayoutService, PopupService, EventService) {

                var _httpDescription = function (method, httpconfig) {
                    if (httpconfig === undefined) {
                        httpconfig = {};
                    }
                    httpconfig.service = 'spLegend';
                    httpconfig.method = method;

                    return httpconfig;
                };

                return {
                    scope: {},
                    templateUrl: '/spApp/legendContent.htm',
                    link: function (scope, element, attrs) {
                        scope.baseUrl = $SH.baseUrl; // for image icons

                        scope.facetFilter = '';
                        scope.fq = [];
                        scope.yearMin = 1800;
                        scope.yearMax = new Date().getFullYear();

                        scope.selected = MapService.selected;
                        scope.selectedWatch = [MapService.selected];

                        scope.workflowFilters = $SH.workflowFilters;

                        scope.sortType = 'count';
                        scope.sortReverse = true;

                        scope.getSelected = function () {
                            if (scope.selected && scope.selected.layer) {
                                return scope.selected.layer.id
                            } else {
                                return 0
                            }
                        };

                        scope.$watch('selected.layer.uid', function (oldValue, newValue) {
                            LayoutService.closeModeless('FacetEditorModalCtrl')
                            scope.setAreaLayers();
                            scope.updateFacet();
                        });

                        scope.showLegend = function () {
                            scope.selected.hidelegend = false
                        };

                        scope.areaLayers = [];

                        scope.setAreaLayers = function () {
                            scope.areaLayers = [{pid: null, name: ''}].concat(MapService.areaLayers());
                        };

                        scope.updateContextualList = function (_layer) {
                            var selectedLayer = _layer || scope.selected.layer;
                            if (selectedLayer !== undefined && selectedLayer !== null && selectedLayer.contextualPage !== undefined) {
                                LayersService.getField(selectedLayer.id,
                                    (selectedLayer.contextualPage - 1) * selectedLayer.contextualPageSize,
                                    selectedLayer.contextualPageSize, selectedLayer.contextualFilter).then(function (data) {
                                    selectedLayer.contextualList = data.data.objects;
                                    for (var i in selectedLayer.contextualList) {
                                        if (selectedLayer.contextualList.hasOwnProperty(i)) {
                                            selectedLayer.contextualList[i].selected = (selectedLayer.contextualSelection[selectedLayer.contextualList[i].name] !== undefined)
                                        }
                                    }
                                })
                            }
                        };

                        scope.info = function (item) {
                            bootbox.alert($i18n(397, "Metadata url") + ': <a href="' + item.url + '">' + item.url + '</a>')
                        };

                        scope.contextualClearSelection = function () {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined) {
                                var key;
                                for (key in selectedLayer.contextualSelection) {
                                    if (selectedLayer.contextualSelection.hasOwnProperty(key)) {
                                        delete selectedLayer.contextualSelection[key]
                                    }
                                }
                                for (var i in selectedLayer.contextualList) {
                                    if (selectedLayer.contextualList.hasOwnProperty(i)) {
                                        selectedLayer.contextualList[i].selected = false
                                    }
                                }
                            }
                        };

                        scope.contextualClearHighlight = function () {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined) {
                                //remove highlight layer
                                selectedLayer.contextualHighlight = "";
                                MapService.setHighlightVisible(false);
                            }
                        };

                        scope.scatterplotCreateInOut = function () {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined) {
                                var inFq = selectedLayer.scatterplotFq;
                                var outFq = '-(' + selectedLayer.scatterplotFq + ')';

                                EventService.scatterplotCreateInOut(selectedLayer, inFq, outFq)
                            }
                        };

                        scope.adhocCreateInOut = function () {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined) {
                                EventService.adhocCreateInOut(selectedLayer, selectedLayer.inAdhocQ, selectedLayer.outAdhocQ)
                            }
                        };

                        scope.isCreateAreaDisabled = function () {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined) {
                                for (var key in selectedLayer.contextualSelection) {
                                    if (selectedLayer.contextualSelection.hasOwnProperty(key)) {
                                        var item = selectedLayer.contextualSelection[key];
                                        if (item.selected) {
                                            return false;
                                        }
                                    }
                                }
                            }
                            return true;
                        };

                        scope.contextualCreateArea = function () {
                            if (selectedLayer !== undefined) {
                                var ids = [];
                                var fqs = [];
                                var objects = [];

                                for (var key in selectedLayer.contextualSelection) {
                                    if (selectedLayer.contextualSelection.hasOwnProperty(key)) {
                                        var item = selectedLayer.contextualSelection[key];
                                        if (item.selected) {
                                            fqs.push(selectedLayer.id + ':"' + item.name + '"');
                                            ids.push(item.pid);
                                        }
                                    }
                                }

                                scope.mapObjectsList(ids, fqs, objects, 0, selectedLayer.name);
                            }
                        };

                        scope.mapObjectsList = function (ids, fqs, objects, pos, name) {
                            if (pos === ids.length) {
                                //merge
                                var metadata = $i18n(398, "Collection of areas from layer") + ': ' + name + ';';
                                var mappingId = '';
                                var areaKm = 0;
                                var bbox;

                                for (var i = 0; i < objects.length; i++) {
                                    metadata += ', ' + objects[i].name;
                                    areaKm += objects[i].area_km;

                                    var bTemp = undefined;
                                    if (i > 0) bTemp = bbox;
                                    bbox = objects[i].bbox;
                                    if ((objects[i].bbox + '').match(/^POLYGON/g) != null) {
                                        //convert POLYGON box to bounds
                                        var split = objects[i].bbox.split(',');
                                        var p1 = split[1].split(' ');
                                        var p2 = split[3].split(' ');

                                        if (bTemp == undefined) {
                                            bbox = [[Math.min(p1[1], p2[1]), Math.min(p1[0], p2[0])], [Math.max(p1[1], p2[1]), Math.max(p1[0], p2[0])]]
                                        } else {
                                            bbox = [[Math.min(p1[1], p2[1], bTemp[0][0]), Math.min(p1[0], p2[0], bTemp[0][1])], [Math.max(p1[1], p2[1], bTemp[1][0]), Math.max(p1[0], p2[0], bTemp[1][1])]]
                                        }
                                    }
                                    if (objects[i].bbox && objects[i].bbox.length === 4) {
                                        if (bTemp == undefined) {
                                            bbox = [[objects[i].bbox[1], objects[i].bbox[0]], [objects[i].bbox[3], objects[i].bbox[2]]]
                                        } else {
                                            bbox = [[Math.min(objects[i].bbox[1], bTemp[0][0]), Math.min(objects[i].bbox[0], bTemp[0][1])], [Math.max(objects[i].bbox[3], bTemp[1][0]), Math.max(objects[i].bbox[2], bTemp[1][1])]]
                                        }
                                    }

                                    if (i > 0) mappingId += '~';
                                    mappingId += ids[i]
                                }

                                var layer = {
                                    name: pos + ' ' + $i18n(399, "areas from") + ' ' + name,
                                    description: '',
                                    wkt: '',
                                    q: [fqs.join(" OR ")],
                                    legend: '',
                                    area_km: areaKm,
                                    bbox: bbox,
                                    metadata: metadata,
                                    pid: mappingId,
                                    layertype: 'area'
                                };

                                MapService.add(layer)
                            } else {
                                LayersService.getObject(ids[pos]).then(function (data) {
                                    objects[pos] = data.data;
                                    scope.mapObjectsList(ids, fqs, objects, pos + 1, name)
                                })
                            }
                        };

                        scope.zoom = function (item) {
                            MapService.leafletScope.zoom(item.bbox)
                        };

                        scope.contextualHighlight = function (name, pid) {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined) {
                                selectedLayer.contextualHighlight = name;
                                LayersService.getObject(pid).then(function (data) {
                                    MapService.removeHighlight();

                                    data.data.layertype = 'area';
                                    data.data.color = 'ff0000';
                                    data.data.opacity = 100.0;
                                    MapService.addHighlight(data.data);
                                });
                            }
                        };

                        scope.contextualSelectionChange = function (item) {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined) {
                                selectedLayer.contextualSelection[item.name] = item
                            }
                        };

                        scope.contextualPageBack = function () {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined && selectedLayer.contextualPage > 1) {
                                selectedLayer.contextualPage--;
                                scope.updateContextualList(selectedLayer)
                            }
                        };

                        scope.contextualPageForward = function () {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer.contextualPage < selectedLayer.contextualMaxPage) {
                                selectedLayer.contextualPage++;
                                scope.updateContextualList(selectedLayer)
                            }
                        };

                        scope.clearContextualFilter = function () {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined) {
                                selectedLayer.contextualFilter = ''
                            }
                        };

                        scope.externalWmsLegendVisible = function () {
                            var selected = scope.selected;
                            return selected.layer !== undefined &&
                                selected.layertype === 'wms' &&
                                (selected.hidelegend === undefined || !selected.hidelegend)
                        };

                        scope.wmsLegendVisible = function () {
                            var selected = scope.selected;
                            return selected.layer !== undefined &&
                                (selected.layertype === 'grid' || selected.layertype === 'contextual') &&
                                (selected.hidelegend === undefined || !selected.hidelegend)
                        };

                        scope.hideLegend = function () {
                            scope.selected.layer.hidelegend = true
                        };

                        scope.popupLegend = function () {
                            var selected = scope.selected;
                            L.control.window(map, {
                                modal: false,
                                title: selected.displayname,
                                content: '<img src="' + selected.layer.leaflet.layerOptions.layers[0].legendurl + '"/>'
                            }).show()
                        };

                        scope.setColor = function (color) {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined) {
                                selectedLayer.color = color;
                                scope.updateWMS();
                                scope.scatterplotUpdate()
                            }
                        };

                        scope.setColorType = function (colorType) {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined) {
                                selectedLayer.colorType = colorType;
                                scope.updateWMS();
                                scope.scatterplotUpdate()
                            }
                        };

                        scope.facetNewLayer = function () {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined) {
                                EventService.facetNewLayer(selectedLayer, scope.getFacetFqs(true, selectedLayer))
                            }
                        };

                        scope.getFacetFqs = function (includeActiveFacet, layer) {
                            var selectedLayer = layer || scope.selected.layer;
                            var newFqs = BiocacheService.facetsToFq(selectedLayer.facets, false)
                            var fq = BiocacheService.facetToFq(selectedLayer.activeFacet, true);
                            if (fq.fq) {
                                var idx = newFqs.indexOf(fq.fq)
                                if (includeActiveFacet && selectedLayer.activeFacet) {
                                    if (idx < 0) {
                                        newFqs.push(fq.fq)
                                    }
                                } else {
                                    // remove active facet
                                    if (idx >= 0) {
                                        newFqs.splice(idx, 1)
                                    }
                                }
                            }
                            return newFqs;
                        }

                        scope.facetNewLayerOut = function () {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined) {
                                EventService.facetNewLayerOut(selectedLayer, scope.getFacetFqs(true, selectedLayer))
                            }
                        };

                        scope.facetsSelected = function () {
                            var selectedLayer = scope.selected.layer;
                            return selectedLayer !== undefined &&
                                selectedLayer.facetSelectionCount !== undefined &&
                                selectedLayer.facetSelectionCount > 0;
                        };

                        scope.updateSelection = function () {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined) {
                                var sum = 0;
                                for (var i = 0; selectedLayer.activeFacet &&
                                selectedLayer.activeFacet.data &&
                                i < selectedLayer.activeFacet.data.length; i++) {
                                    sum += selectedLayer.activeFacet.data[i].count
                                }
                                selectedLayer.facetSelectionCount = sum

                                scope.updateWMS();
                            }
                        };

                        scope.getFacetItemCount = function (item, layer, fq) {
                            return BiocacheService.count(layer, fq).then(function (count) {
                                item.count = count;
                                return item;
                            });
                        };

                        scope.asyncFacetCounts = function (queue, results, selectedLayer) {
                            selectedLayer.facetProgress = (results.length + 1) + " of " + (queue.length + results.length);
                            var facetCount = queue.pop();
                            return scope.getFacetItemCount(facetCount[0], facetCount[1], facetCount[2]).then(
                                function (data) {
                                    results.push(data);
                                    if (queue.length > 0) {
                                        return scope.asyncFacetCounts(queue, results, selectedLayer);
                                    } else {
                                        return $q.when();
                                    }
                                }
                            );
                        };

                        scope.speciesListToFacetList = function (data, newLayer) {
                            var def = $q.defer();

                            var list = [];

                            var promises = [];

                            var queue = [];

                            var ci = 0;
                            for (var key in data) {
                                var item = data[key];
                                item.count = 0; // TODO: check if this needs to be an object
                                var c = ColourService.getColour(ci);
                                var listItem = {
                                    name: key, displayname: key, count: item.count,
                                    fq: item.fq, red: c.red, green: c.green, blue: c.blue
                                };
                                //populate count
                                queue.push([listItem, newLayer, item.fq]);
                                ci = ci + 1;
                            }

                            // async for queue
                            var results = [];
                            var selectedLayer = scope.selected.layer;
                            selectedLayer.facetProgress = results.length + " of " + queue.length;
                            promises.push(scope.asyncFacetCounts(queue, results, selectedLayer));

                            $q.all(promises).then(function (result) {
                                result = results;
                                result.sort(function (a, b) {
                                    return b.count - a.count
                                });
                                def.resolve(result);
                                //sort and aggregate the rest of layers after the top 5
                                var maxMappedFacets = 5;
                                if (result.length < maxMappedFacets) {
                                    for (var i in result) {
                                        var c = ColourService.getColour(i);
                                        scope.createSubLayer(c, selectedLayer, result[i].fq)
                                        result[i].red = c.red;
                                        result[i].green = c.green;
                                        result[i].blue = c.blue;
                                    }
                                } else {
                                    for (var i = 0; i < maxMappedFacets; i++) {
                                        var c = ColourService.getColour(i);
                                        scope.createSubLayer(c, selectedLayer, result[i].fq)
                                        result[i].red = c.red;
                                        result[i].green = c.green;
                                        result[i].blue = c.blue;
                                    }
                                    //agregate the rest
                                    var aggreatedfq = [];
                                    var c = ColourService.getColour(maxMappedFacets);
                                    for (var i = maxMappedFacets; i < result.length; i++) {
                                        aggreatedfq.push(result[i].fq);
                                        result[i].red = c.red;
                                        result[i].green = c.green;
                                        result[i].blue = c.blue;
                                    }
                                    scope.createSubLayer(c, selectedLayer, "(" + aggreatedfq.join(' OR ') + ")")
                                }
                                selectedLayer.facetProgress = undefined;

                            });
                            return def.promise;
                        };


                        scope.createSubLayer = function (colour, layer, fq) {
                            return BiocacheService.newLayerAddFq(layer, fq, layer.name).then(function (subLayer) {
                                subLayer.red = colour.red;
                                subLayer.green = colour.green;
                                subLayer.blue = colour.blue;
                                MapService.add(subLayer, layer);
                            });
                        };

                        scope.isSpeciesListFacet = function (facet) {
                            return facet.indexOf('species_list') === 0;
                        };

                        /**
                         * Update scope.selected.layer.activeFacet.data
                         *
                         * Redraws WMS of scope.selected.layer
                         *
                         * @returns promise with scope.selected.layer.activeFacet.data
                         */
                        scope.refreshFacetData = function (ignoreFilters) {
                            // When refreshing take a copy of the last selection
                            // so it can be reapplied to the new data.
                            var selectedLayer = scope.selected.layer;
                            var fq = BiocacheService.facetToFq(selectedLayer.activeFacet, false)
                            if (fq.fq) {
                                selectedLayer.activeFacet._fq = fq.fq
                            }

                            if (ignoreFilters) {
                                return scope.fetchFacetData(selectedLayer.activeFacet, selectedLayer).then(function (data) {
                                    scope.updateWMS();
                                    return $q.when(data)
                                })
                            } else {
                                // do not include the active facet when updating facet data counts
                                var newFqs = scope.getFacetFqs(false);

                                return BiocacheService.newLayerAddFq(selectedLayer, newFqs).then(function (newLayer) {
                                    return scope.fetchFacetData(selectedLayer.activeFacet, newLayer).then(function (data) {
                                        scope.updateWMS();
                                        return $q.when(data)
                                    })
                                })
                            }
                        }

                        /**
                         * Set facet.data using newLayer query
                         *
                         * @param facet facet object
                         * @param newLayer query
                         * @returns promise with facet.data
                         */
                        scope.fetchFacetData = function (facet, newLayer) {
                            var selectedLayer = scope.selected.layer;
                            if (scope.isSpeciesListFacet(selectedLayer.facet)) {
                                return scope.speciesListToFacetList(selectedLayer.activeFacet.species_list_facet, newLayer).then(function (data) {
                                    scope.setFacetData(facet, data)

                                    return data
                                })
                            } else {
                                return BiocacheService.facet(facet.name, newLayer).then(function (data) {
                                    scope.setFacetData(facet, data)

                                    return data
                                })
                            }
                        }

                        scope.setFacetData = function (facet, data) {
                            // Existing facets that do not have facet.data may have a copy of the selection as facet._fq
                            // Delete _fq after updating the facet.data with the active selection.
                            if (facet._fq) {
                                for (var i in data) {
                                    var fq = data[i].fq;
                                    var isInverted = facet._fq.indexOf("-(") === 0;
                                    if (fq.match(/^-/g) != null && (fq.match(/:\*$/g) != null || fq.match(/\[\* TO \*\]$/g) != null)) {
                                        fq = fq.substring(1)
                                    }
                                    if (facet._fq.indexOf(fq) >= 0 || facet._fq.indexOf(' ' + fq) >= 0
                                        || facet._fq.indexOf('(' + fq) >= 0) {
                                        // found the fq at a boundary (start of _fq, after a space, after a bracket)
                                        data[i].selected = true;
                                    } else if (facet._fq.indexOf('-' + fq) >= 0) {
                                        // found inverse fq
                                        data[i].selected = isInverted;
                                    }
                                }

                                delete facet._fq;
                            }
                            facet.data = data;
                            return data
                        }

                        scope.filtersEnabled = function () {
                            return $SH.filtersEnabled
                        }

                        scope.showActiveFilter = function () {
                            if ($SH.filtersEnabled) {
                                return true
                            }

                            // do not show grouped facets twice in the drop down list
                            var selectedLayer = scope.selected.layer;
                            for (var i in selectedLayer.groupedFacets) {
                                if (selectedLayer.groupedFacets[i].facet === selectedLayer.facet) {
                                    return false
                                }
                            }

                            return true
                        }

                        scope.addToFacets = function (facetName, layer) {
                            // add new facet
                            var selectedLayer = layer || scope.selected.layer;
                            var nextId = 0
                            if (selectedLayer.facets.length > 0) {
                                nextId = selectedLayer.facets[selectedLayer.facets.length - 1].id + 1
                            }

                            for (var i = 0; i < selectedLayer.indexFields.length; i++) {
                                if (selectedLayer.indexFields[i].facet === facetName) {
                                    var facet = {
                                        id: nextId,
                                        name: selectedLayer.indexFields[i].facet,
                                        dataType: selectedLayer.indexFields[i].dataType,
                                        displayName: selectedLayer.indexFields[i].displayName,
                                        info: selectedLayer.indexFields[i].info,
                                        description: selectedLayer.indexFields[i].description,
                                        data: undefined,
                                        enabled: true,
                                        species_list_facet: selectedLayer.indexFields[i].species_list_facet
                                    }

                                    if (selectedLayer.facets.length > 0 && !$SH.filtersEnabled) {
                                        selectedLayer.facets.splice(0, selectedLayer.facets.length)
                                    }
                                    selectedLayer.facets.push(facet)

                                    return facet
                                }
                            }
                        }

                        scope.updateFacet = function () {
                            var selectedLayer = scope.selected.layer;
                            if (selectedLayer !== undefined && selectedLayer.facets) {
                                if (selectedLayer.facet === 'search') {
                                    scope.searchFacets()
                                    return;
                                }

                                // is a workflow filter selected?
                                for (var i = 0; i < scope.workflowFilters.length; i++) {
                                    if (scope.workflowFilters[i].workflowId == selectedLayer.facet) {
                                        selectedLayer.facet = '-1'
                                        LayoutService.openModal('workflow', {
                                            speciesLayerId: selectedLayer.uid,
                                            workflowId: scope.workflowFilters[i].workflowId
                                        });
                                        return;
                                    }
                                }

                                var facet
                                if (selectedLayer.scatterplotUrl === undefined) {
                                    // does it already exist?
                                    for (var i = 0; i < selectedLayer.facets.length; i++) {
                                        if (selectedLayer.facets[i].name === selectedLayer.facet) {
                                            facet = selectedLayer.facets[i]
                                        }
                                    }
                                } else if (selectedLayer.facets.length > 0) {
                                    selectedLayer.facets = []
                                }

                                if (facet === undefined && selectedLayer.facet !== "-1") {
                                    facet = scope.addToFacets(selectedLayer.facet, selectedLayer)
                                }

                                if (facet !== undefined) {
                                    selectedLayer.activeFacet = facet

                                    // always update facet data
                                    scope.refreshFacetData(false).then(function (data) {
                                        if (selectedLayer.scatterplotUrl !== undefined) {
                                            scope.scatterplotUpdate(selectedLayer);
                                        }
                                    })
                                } else {
                                    scope.updateWMS();
                                    if (scope.selected.layer.scatterplotUrl !== undefined) {
                                        scope.scatterplotUpdate();
                                    }
                                }
                            }
                        };

                        scope.searchFacets = function () {
                            var data = scope.selected.layer.indexFields
                            for (var i = 0; i < data.length; i++) {
                                data[i].selected = scope.isFacetSelected(data[i].facet)
                            }
                            LayoutService.openModal('facet', {
                                data: data,
                                onChange: scope.updateFacets
                            }, false)
                        }

                        scope.isFacetSelected = function (facet, layer) {
                            var selectedLayer = layer || scope.selected.layer;
                            for (var i = 0; i < selectedLayer.facets.length; i++) {
                                if (selectedLayer.facets[i].name === facet) {
                                    return selectedLayer.facets[i].enabled;
                                }
                            }
                            return false;
                        }

                        scope.updateFacets = function (data, layer) {
                            var selectedLayer = layer || scope.selected.layer;
                            // identify and add new facets
                            var newFacet
                            for (var j = 0; j < data.length; j++) {
                                if (data[j].selected && !scope.isFacetSelected(data[j].facet)) {
                                    scope.addToFacets(data[j].facet)
                                    newFacet = data[j].facet
                                }
                            }

                            // remove facets that are not selected
                            for (var i = 0; i < scope.selected.layer.facets.length; i++) {
                                var found = false;
                                for (var j = 0; j < data.length; j++) {
                                    if (data[j].facet === scope.selected.layer.facets[i].name) {
                                        if (newFacet !== undefined) {
                                            newFacet = data[j].facet
                                        }
                                        found = true;
                                    }
                                }
                                if (!found) {
                                    scope.selected.layer.facets.splice(i, 1);
                                    i--;
                                }
                            }

                            // select a facet
                            if (newFacet) {
                                scope.selected.layer.facet = newFacet
                                scope.updateFacet()
                            } else {
                                // select user defined colour
                                scope.selected.layer.facet = '-1'
                                scope.updateFacet()
                            }
                        }

                        scope.moveUp = function () {
                            if (scope.selected.layer !== undefined) {
                                scope.selected.layer.index++;

                                MapService.leafletScope.moveLayer(MapService.getLayer(scope.selected.layer.uid), scope.selected.layer.index)
                            }
                        };

                        scope.moveDown = function () {
                            if (scope.selected.layer !== undefined) {
                                scope.selected.layer.index--;

                                MapService.leafletScope.moveLayer(MapService.getLayer(scope.selected.layer.uid), scope.selected.layer.index)
                            }
                        };

                        scope.setVisible = function (show) {
                            if (scope.selected.layer !== undefined) {
                                scope.selected.layer.visible = show;
                                scope.selected.layer.leaflet.layerOptions.layers[0].visible = show;
                                MapService.leafletScope.showLayer(MapService.getLayer(scope.selected.layer.uid), scope.selected.layer.visible);
                                if (show) MapService.leafletScope.moveLayer(MapService.getLayer(scope.selected.layer.uid), scope.selected.layer.index)
                            }
                        };

                        scope.getOpacity = function () {
                            if (scope.selected !== undefined && scope.selected.layer !== undefined && scope.selected.layer !== null) {
                                return scope.selected.layer.opacity
                            } else {
                                return 0
                            }
                        };

                        scope.$watch('getOpacity()', function (newValue, oldValue) {
                            if (scope.selected !== undefined && scope.selected.layer !== undefined && scope.selected.layer !== null) {
                                scope.setOpacity(scope.selected.layer.opacity)
                            }
                        });

                        scope.getSize = function () {
                            if (scope.selected !== undefined && scope.selected.layer !== undefined && scope.selected.layer !== null) {
                                return scope.selected.layer.size
                            } else {
                                return 0
                            }
                        };

                        scope.$watch('getSize()', function (newValue, oldValue) {
                            if (scope.selected !== undefined && scope.selected.layer !== undefined && scope.selected.layer !== null) {
                                scope.setSize(scope.selected.layer.size)
                            }
                        });

                        scope.setOpacity = function (opacity) {
                            if (scope.selected.layer !== undefined) {
                                scope.selected.layer.opacity = opacity;
                                scope.selected.layer.leaflet.layerOptions.layers[0].opacity = opacity;
                                MapService.leafletScope.changeOpacity(MapService.getLayer(scope.selected.layer.uid), scope.selected.layer.opacity / 100)
                            }
                        };

                        scope.setUncertainty = function (uncertainty) {
                            if (scope.selected.layer !== undefined) {
                                scope.selected.layer.uncertainty = uncertainty;
                                scope.updateWMS()
                            }
                        };

                        scope.setSize = function (size) {
                            if (scope.selected.layer !== undefined) {
                                scope.selected.layer.size = size;
                                scope.updateWMS();
                                scope.scatterplotUpdate()
                            }
                        };

                        scope.updateWMS = function (layer) {
                            var selectedLayer = layer || scope.selected.layer;
                            if (selectedLayer !== undefined) {
                                selectedLayer.wms = selectedLayer.name + ', ' + selectedLayer.color + ', '
                                    + selectedLayer.colorType + ', ' + selectedLayer.opacity + ', '
                                    + selectedLayer.uncertainty + ', ' + selectedLayer.size;

                                if (selectedLayer.leaflet) {
                                    var firstLayer = selectedLayer.leaflet.layerOptions.layers[0];

                                    // using the layer.facets selection will override the colour to -1 and red
                                    var facetSelectionOverride = false
                                    if (selectedLayer.facets && selectedLayer.facets.length > 0) {
                                        firstLayer.layerParams.fq = scope.getFacetFqs(true, selectedLayer);
                                        var activeFacet = BiocacheService.facetToFq(selectedLayer.activeFacet, true);

                                        // override colour for this active facet selection
                                        if (activeFacet.fq) {
                                            var colour = "FF0000"
                                            firstLayer.layerParams.ENV = 'color%3A' + colour + '%3Bname%3Acircle%3Bsize%3A' +
                                                selectedLayer.size + '%3Bopacity%3A1' +
                                                (selectedLayer.uncertainty ? "%3Buncertainty%3A1" : "")
                                            facetSelectionOverride = true
                                        }
                                    } else {
                                        delete firstLayer.layerParams["fq"]
                                    }

                                    if (facetSelectionOverride) {
                                        // ENV already set
                                    } else if (selectedLayer.colorType === 'grid') {
                                        firstLayer.layerParams.ENV = 'colormode%3Agrid%3Bname%3Acircle%3Bsize%3A' +
                                            selectedLayer.size + '%3Bopacity%3A1'
                                    } else if (selectedLayer.colorType === '-1') {
                                        // do not use layer.facet as colour mode if it is a species_list
                                        if (selectedLayer.facet === '-1' || selectedLayer.facet.indexOf('species_list') == 0) {
                                            firstLayer.layerParams.ENV = 'color%3A' + selectedLayer.color + '%3Bname%3Acircle%3Bsize%3A' +
                                                selectedLayer.size + '%3Bopacity%3A1' +
                                                (selectedLayer.uncertainty ? "%3Buncertainty%3A1" : "")
                                        } else {
                                            firstLayer.layerParams.ENV = 'colormode%3A' + selectedLayer.facet + '%3Bname%3Acircle%3Bsize%3A' +
                                                selectedLayer.size + '%3Bopacity%3A1' +
                                                (selectedLayer.uncertainty ? "%3Buncertainty%3A1" : "")
                                        }
                                        if (selectedLayer.scatterplotFq !== undefined && selectedLayer.scatterplotFq.length > 0) {
                                            firstLayer.layerParams.ENV += '%3Bsel%3A' + encodeURIComponent(selectedLayer.scatterplotFq)
                                        }
                                    }

                                    MapService.reMap(scope.selected);
                                }

                                $timeout(function () {
                                }, 0)
                            }
                        };

                        scope.startx = 0;
                        scope.starty = 0;
                        scope.endx = 0;
                        scope.endy = 0;
                        scope.resizing = false;

                        scope.doMouseDown = function (event) {
                            document.getElementById('chartDiv').UNSELECTABLE = "on";
                            document.getElementById('rband').UNSELECTABLE = "on";
                            document.getElementById('chartDivBack').UNSELECTABLE = "on";

                            var rband = $('#rband');
                            rband.offset($('#chartDivBack').offset());
                            scope.setPageXY(event);
                            scope.startx = event.pageX;
                            scope.starty = event.pageY;
                            scope.resizing = true;

                            rband.offset({top: scope.starty, left: scope.startx}).show();

                            // prevent default behavior of text selection
                            return false;
                        };

                        scope.setPageXY = function (event) {
                            if (event.pageX || event.pageY) {
                            } else if (event.clientX || event.clientY) {
                                event.pageX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                                event.pageY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                            }
                        };

                        scope.doMouseDrag = function (event) {
                            if (scope.resizing) {
                                var left, top, width, height;

                                scope.setPageXY(event);

                                scope.endx = event.pageX;
                                scope.endy = event.pageY;

                                if (event.pageX > scope.startx) {
                                    left = scope.startx;
                                    width = event.pageX - scope.startx;
                                }
                                else {
                                    left = event.pageX;
                                    width = scope.startx - event.pageX;
                                }
                                if (event.pageY > scope.starty) {
                                    top = scope.starty;
                                    height = event.pageY - scope.starty;
                                }
                                else {
                                    top = event.pageY;
                                    height = scope.starty - event.pageY;
                                }

                                var rband = $('#rband');
                                rband.offset({top: top, left: left});
                                rband.css({
                                    'width': width,
                                    'height': height
                                });
                            }
                        };

                        scope.doMouseUp = function (event) {
                            if (scope.resizing) {
                                scope.resizing = false;
                                scope.chartSelection(scope.startx, scope.starty, scope.endx, scope.endy);
                            }
                        };

                        scope.clearSelection = function () {

                        };

                        scope.chartSelection = function (x1, y1, x2, y2) {
                            x1 = x1 + "";
                            x2 = x2 + "";
                            y1 = y1 + "";
                            y2 = y2 + "";
                            var back = jQuery('#chartDivBack');
                            var value = (x1.replace("px", "") - $(back[0]).offset().left)
                                + "," + (y1.replace("px", "") - $(back[0]).offset().top)
                                + "," + (x2.replace("px", "") - $(back[0]).offset().left)
                                + "," + (y2.replace("px", "") - $(back[0]).offset().top);
                            var cd = document.getElementById('chartDiv');
                            var ci = document.getElementById('chartDivBack');
                            ci.style.backgroundImage = cd.style.backgroundImage;

                            scope.scatterplotUpdate(value);
                        };

                        scope.scatterplotDownloadData = function () {
                            Util.download(scope.selected.layer.scatterplotDataUrl);
                        };

                        scope.scatterplotDownloadImage = function () {
                            Util.download(scope.selected.layer.scatterplotUrl);
                        };

                        scope.scatterplotUpdate = function (value, layer) {
                            var selectedLayer = layer || scope.selected.layer;
                            if (selectedLayer && selectedLayer.scatterplotUrl) {

                                selectedLayer.scatterplotUpdating = true;
                                var task = {
                                    name: 'ScatterplotDraw',
                                    input: $.extend({}, scope.selected.layer)
                                };
                                if (task.input.facet !== -1) task.input.colorType = task.input.facet;

                                task.input.opacity = task.input.opacity / 100;
                                if (value || value == null) {
                                    selectedLayer.scatterplotSelection = value;
                                    task.input.selection = value;
                                } else {
                                    task.input.selection = selectedLayer.scatterplotSelection;
                                }
                                task.input.wkt = [{pid: selectedLayer.highlightWkt}];
                                $http.post($SH.baseUrl + '/portal/postTask?sessionId=' + $SH.sessionId, task, _httpDescription('updateScatterplot', {ignoreErrors: true})).then(function (response) {
                                    scope.checkScatterplotStatus(LayersService.url() + '/tasks/status/' + response.data.id, selectedLayer)
                                })
                            }
                        };

                        scope.checkScatterplotStatus = function (url, layer) {
                            $http.get(url, _httpDescription('checkScatterplotStatus', {ignoreErrors: true})).then(function (response) {
                                scope.status = response.data.message;

                                if (response.data.status < 2) {
                                    $timeout(function () {
                                        scope.checkScatterplotStatus(url, layer)
                                    }, 500)
                                } else if (response.data.status === 2) {
                                    scope.status = 'cancelled';
                                    layer.scatterplotUpdating = false;
                                } else if (response.data.status === 3) {
                                    scope.status = 'error';
                                    layer.scatterplotUpdating = false;
                                } else if (response.data.status === 4) {

                                    $("#rband").css({
                                        'width': 0,
                                        'height': 0
                                    }).hide();

                                    scope.status = $i18n(400, "successful");

                                    scope.finishedData = response.data;

                                    var updateNow = true;

                                    for (var k in scope.finishedData.output) {
                                        if (scope.finishedData.output.hasOwnProperty(k)) {
                                            var d = scope.finishedData.output[k];
                                            if (d.name === 'species') {
                                                var species = jQuery.parseJSON(d.file);
                                                layer.scatterplotUrl = species.scatterplotUrl;

                                                if (species.scatterplotSelectionExtents && species.scatterplotLayers) {
                                                    layer.scatterplotSelectionExtents = species.scatterplotSelectionExtents;
                                                    var fq = species.scatterplotLayers[0] + ":[" + species.scatterplotSelectionExtents[1] + " TO " + species.scatterplotSelectionExtents[3] + "] AND " +
                                                        species.scatterplotLayers[1] + ":[" + species.scatterplotSelectionExtents[0] + " TO " + species.scatterplotSelectionExtents[2] + "]";
                                                    var fqs = [fq];
                                                    layer.scatterplotFq = fq;
                                                    if (species.scatterplotSelectionExtents.length === 0) {
                                                        fqs = [];
                                                        layer.scatterplotSelectionCount = 0;

                                                        scope.updateWMS(layer);
                                                    } else {
                                                        scope.updateWMS(layer);
                                                        updateNow = false;
                                                        layer.scatterplotSelectionCount = $i18n(377, "counting...");
                                                        BiocacheService.count(layer, fqs).then(function (count) {
                                                            layer.scatterplotSelectionCount = count;
                                                            layer.scatterplotUpdating = false;
                                                        });

                                                        layer.scatterplotLabel1 = Messages.get('facet.' + species.scatterplotLayers[0]) + " : " +
                                                            species.scatterplotSelectionExtents[1].toFixed(4) + " - " + species.scatterplotSelectionExtents[3].toFixed(4);
                                                        layer.scatterplotLabel2 = Messages.get('facet.' + species.scatterplotLayers[1]) + " : " +
                                                            species.scatterplotSelectionExtents[0].toFixed(4) + " - " + species.scatterplotSelectionExtents[2].toFixed(4);
                                                    }
                                                } else {
                                                    layer.scatterplotSelectionExtents = null;
                                                    layer.scatterplotLabel1 = '';
                                                    layer.scatterplotLabel2 = '';
                                                    layer.scatterplotFq = [];
                                                    layer.scatterplotSelectionCount = 0;
                                                    scope.updateWMS(layer);
                                                }
                                            }
                                        }
                                    }
                                    if (updateNow) layer.scatterplotUpdating = false;
                                }
                            }, function (error) {
                                // retry
                                $timeout(function () {
                                    scope.checkScatterplotStatus(url, layer)
                                }, 500)
                            })
                        };

                        scope.updateScatterplot = function (width, height, background) {
                            var cd = document.getElementById('chartDiv');
                            var ci = document.getElementById('chartDivBack');
                            ci.style.backgroundImage = cd.style.backgroundImage;
                            cd.style.backgroundImage = background;
                            cd.style.width = width + 'px';
                            cd.style.height = height + 'px';
                            ci.style.width = cd.style.width;
                            ci.style.height = cd.style.height;

                            $("#rband").css({
                                'width': 0,
                                'height': 0
                            }).hide();
                        };

                        scope.colourTimeout = null;

                        scope.updateColour = function (layer) {
                            var selectedLayer = layer || scope.selected.layer;
                            var r = selectedLayer.red.toString(16);
                            if (r.length === 1) r = '0' + r;
                            var g = selectedLayer.green.toString(16);
                            if (g.length === 1) g = '0' + g;
                            var b = selectedLayer.blue.toString(16);
                            if (b.length === 1) b = '0' + b;
                            selectedLayer.color = r + g + b;

                            if (scope.colourTimeout !== null) clearTimeout(scope.colourTimeout);
                            scope.colourTimeout = setTimeout(function () {
                                scope.applyColour()
                            }, 500)
                        };

                        scope.applyColour = function () {
                            scope.updateWMS();
                            scope.scatterplotUpdate()
                        }

                        scope.isFilterSelected = function (layer) {
                            var selectedLayer = layer || scope.selected.layer;
                            if (selectedLayer && selectedLayer.facets) {
                                for (var i = 0; i < selectedLayer.facets.length; i++) {
                                    if (selectedLayer.facets[i].name === selectedLayer.facet) {
                                        return true;
                                    }
                                }
                            }
                            return false;
                        }

                        scope.removeFacet = function (layer) {
                            var selectedLayer = layer || scope.selected.layer;
                            for (var i = 0; i < selectedLayer.facets.length; i++) {
                                if (selectedLayer.facets[i].name === selectedLayer.facet) {
                                    selectedLayer.facets.splice(i, 1)
                                    if (selectedLayer.facets.length > 0) {
                                        selectedLayer.facet = selectedLayer.facets[0].name
                                    } else {
                                        selectedLayer.facet = "-1"
                                    }
                                    scope.updateFacet()
                                }
                            }
                        }
                    }

                }

            }])
}(angular));