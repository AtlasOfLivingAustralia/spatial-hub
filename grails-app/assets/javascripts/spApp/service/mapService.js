(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name MapService
     * @description
     *   Access to map functions
     */
    angular.module('map-service', ['layers-service', 'facet-auto-complete-service', 'biocache-service', 'logger-service'])
        .factory("MapService", ['$rootScope', '$q', '$timeout', 'LayersService', 'FacetAutoCompleteService', 'BiocacheService', 'ColourService', 'LoggerService', 'ListsService',
            function ($rootScope, $q, $timeout, LayersService, FacetAutoCompleteService, BiocacheService, ColourService, LoggerService, ListsService) {
                var bounds = {};
                var layers = [];
                var highlightTemplate = {
                    uid: 'highlight',
                    name: 'highlight',
                    type: 'group',
                    visible: true,
                    layerParams: {
                        showOnSelector: false
                    },
                    layerOptions: {
                        layers: []
                    }
                };
                var leafletLayers = {
                    draw: {
                        name: 'draw',
                        type: 'group',
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        }
                    },
                    images: {
                        name: 'images',
                        type: 'group',
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        }
                    },
                    poiImages: {
                        name: 'poiImages',
                        type: 'group',
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        }
                    }
                };
                var selected = {layer: undefined};
                var uid = 1;
                var pidList = [];

                var MapService = {
                    mappedLayers: layers,
                    selected: selected,
                    leafletLayers: leafletLayers,
                    bounds: bounds,

                    areaLayers: function () {
                        var list = [];
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].layertype === 'area') {
                                list.push(layers[i])
                            }
                        }
                        return list
                    },

                    contextualLayers: function () {
                        var list = [];
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].layertype === 'contextual') {
                                list.push(layers[i])
                            }
                        }
                        return list
                    },

                    groupLayersByType: function () {
                        var groups = {};
                        layers.forEach(function (layer) {
                            if (!groups[layer.layertype]) {
                                groups[layer.layertype] = []
                            }

                            groups[layer.layertype].push(layer)
                        });
                        return groups
                    },

                    speciesLayers: function () {
                        var list = [];
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].layertype == 'species') {
                                list.push(layers[i])
                            }
                        }
                        return list
                    },

                    zoomToExtents: function (extents) {
                        this.leafletScope.zoom(extents);
                    },

                    zoom: function (uid) {
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].uid === uid) {
                                if (layers[i].bbox !== undefined && layers[i].area_km != 0) {
                                    if (layers[i].count === undefined || layers[i].count > 0) {
                                        this.zoomToExtents(layers[i].bbox);
                                    }
                                    return
                                }
                            }
                        }
                        this.zoomToExtents([[-90, -180], [90, 180]]);
                    },

                    zoomToAll: function () {
                        var zoom = false
                        var bbox = [[90, 180], [-90, -180]]
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].bbox !== undefined && layers[i].area_km != 0) {
                                if (layers[i].count === undefined || layers[i].count > 0) {
                                    zoom = true
                                    if (bbox[0][0] > layers[i].bbox[0][0]) bbox[0][0] = layers[i].bbox[0][0];
                                    if (bbox[0][1] > layers[i].bbox[0][1]) bbox[0][1] = layers[i].bbox[0][1];
                                    if (bbox[1][0] < layers[i].bbox[1][0]) bbox[1][0] = layers[i].bbox[1][0];
                                    if (bbox[1][1] < layers[i].bbox[1][1]) bbox[1][1] = layers[i].bbox[1][1];
                                }
                            }
                        }
                        if (zoom) {
                            if (bbox[0][0] == 90) bbox[0][0] = -90;
                            if (bbox[0][1] == 180) bbox[0][1] = -180;
                            if (bbox[1][0] == -90) bbox[1][0] = 90;
                            if (bbox[1][1] == -180) bbox[1][1] = 180;
                            this.zoomToExtents(bbox);
                        }
                    },

                    defaultLayerSelection: function () {
                        var selection = undefined; // map options
                        for (var i = 0; selection === undefined && i < layers.length; i++) {
                            if (layers[i].visible) {
                                selection = layers[i];
                            }
                        }
                        this.select(selection)
                    },

                    setVisible: function (uid, show) {
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].uid === uid) {
                                layers[i].visible = show;
                                layers[i].leaflet.visible = show;

                                if (show) {
                                    $SH.hoverLayers.push(layers[i].id);
                                } else {
                                    for (var k = 0; k < $SH.hoverLayers.length; k++) {
                                        if ($SH.hoverLayers[k] === layers[i].id) {
                                            $SH.hoverLayers.splice(k, 1);
                                            break;
                                        }
                                    }
                                }

                                this.leafletScope.showLayer(this.getLayer(uid), show);
                                if (show) this.leafletScope.moveLayer(this.getLayer(uid), layers[i].index);

                                break;
                            }
                        }
                    },

                    setHighlightVisible: function (show) {
                        this.leafletScope.showHighlight(show);
                        $timeout(function () {
                        }, 0)
                    },

                    getExtents: function () {
                        if (this.leafletScope && this.leafletScope.bounds) {
                            return [
                                this.leafletScope.bounds.southWest.lng, this.leafletScope.bounds.southWest.lat,
                                this.leafletScope.bounds.northEast.lng, this.leafletScope.bounds.northEast.lat]
                        } else {
                            return $SH.extents;
                        }
                    },

                    splitBounds: function (min, max) {
                        var allBounds = []

                        if (min.lng < -180) {
                            allBounds.push([Math.max(min.lng + 360, -180), min.lat, Math.min(max.lng + 360, 180), max.lat].join(','));
                        }
                        //create 2st area, longitude >-180 to <180
                        if (min.lng < 180 && max.lng > -180) {
                            allBounds.push([Math.max(min.lng, -180), min.lat, Math.min(max.lng, 180), max.lat].join(','));
                        }
                        //create 3rd area, longitude 180 to >180
                        if (max.lng > 180) {
                            allBounds.push([Math.max(min.lng - 360, -180), min.lat, Math.min(max.lng - 360, 180), max.lat].join(','));
                        }
                        return allBounds;
                    },

                    updateZindex: function () {
                        for (var i = 0; i < this.mappedLayers.length; i++) {
                            this.mappedLayers[i].index = this.mappedLayers.length - i;
                            this.leafletScope.moveLayer(this.getLayer(this.mappedLayers[i].uid), this.mappedLayers[i].index)
                        }
                    },
                    removeAll: function () {
                        var layer;
                        while (layer = layers.pop()) {
                            for (var k = 0; k < $SH.hoverLayers.length; k++) {
                                if (layer.id && ($SH.hoverLayers[k] === layer.id)) {
                                    $SH.hoverLayers.splice(k, 1)
                                }
                            }

                            delete leafletLayers[layer.uid];
                        }
                    },
                    remove: function (uid) {
                        var deleteIndex;
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].uid === uid) {
                                for (var k = 0; k < $SH.hoverLayers.length; k++) {
                                    if (layers[i].id && ($SH.hoverLayers[k] === layers[i].id)) {
                                        $SH.hoverLayers.splice(k, 1)
                                    }
                                }

                                deleteIndex = i;
                                delete leafletLayers[uid];
                                break;
                            }
                        }

                        if (deleteIndex !== undefined) {
                            layers.splice(deleteIndex, 1)
                        }
                    },

                    addOtherArea: function (type, query, area, include) {
                        if (include !== true || query.q[0].indexOf("lsid:") !== 0) {
                            return $q.when()
                        }
                        // for consistency with the species autocomplete, only the first lsid is used in the search
                        var lsid = query.q[0].substring(5);
                        return LayersService.findOtherArea(type, lsid, area).then(function (response) {
                            if (response && response.data && response.data.length > 0) {
                                var data = response.data;
                                for (var i in data) {

                                    var item = data[i];

                                    var name = item.area_name;
                                    if (name === undefined) {
                                        name = item.scientific
                                    }
                                    var metadataUrl = item.metadata_u;

                                    if (type === 'track' && item.group_name) {
                                        // override track metadata url with biocache-hub occurrence url
                                        metadataUrl = $SH.biocacheUrl + '/occurrence/' + item.group_name;

                                        // area_name is the external track id, add name as prefix
                                        name = item.scientific + " (" + name + ")"
                                    }

                                    // map distributions fields to metadata object
                                    var metadata = {};
                                    if (Util.notEmpty(item.data_resource_uid)) metadata.dataResourceUid = $SH.collectionsUrl + "/public/show/" + item.data_resource_uid;
                                    if (Util.notEmpty(item.scientific)) metadata.scientificName = item.scientific;
                                    if (Util.notEmpty(item.authority_)) metadata.authority = item.authority_;
                                    if (Util.notEmpty(item.common_nam)) metadata.commonName = item.common_nam;
                                    if (Util.notEmpty(item.family)) metadata.family = item.family;
                                    if (Util.notEmpty(item.genus_name)) metadata.genusName = item.genus_name;
                                    if (Util.notEmpty(item.specific_n)) metadata.specificName = item.specific_n;
                                    if (Util.notEmpty(item.min_depth)) metadata.minDepth = item.min_depth;
                                    if (Util.notEmpty(item.max_depth)) metadata.maxDepth = item.max_depth;
                                    if (Util.notEmpty(item.pelagic_fl)) metadata.isPelagic = item.pelagic_fl;
                                    if (Util.notEmpty(item.estuarine_fl)) metadata.isEstuarine = item.estuarine_fl;
                                    if (Util.notEmpty(item.coastal_fl)) metadata.isCoastal = item.coastal_fl;
                                    if (Util.notEmpty(item.desmersal_fl)) metadata.isDesmersal = item.desmersal_fl;
                                    if (Util.notEmpty(item.caab_species_number)) metadata.caabSpeciesNumber = item.caab_species_number;
                                    if (Util.notEmpty(item.caab_family_number)) metadata.caabFamilyNumber = item.caab_family_number;
                                    if (Util.notEmpty(item.area_name)) metadata.areaName = item.area_name;
                                    if (Util.notEmpty(item.checklist_name)) metadata.checklistName = item.checklist_name;
                                    if (Util.notEmpty(item.notes)) metadata.notes = item.notes;
                                    if (Util.notEmpty(item.group_name)) metadata.groupName = item.group_name;
                                    if (Util.notEmpty(item.genus_exemplar)) metadata.genusExemplar = item.genus_exemplar;
                                    if (Util.notEmpty(item.family_exemplar)) metadata.familyExemplar = item.family_exemplar;
                                    if (Util.notEmpty(item.endemic)) metadata.endemic = item.endemic;
                                    if (Util.notEmpty(metadataUrl)) metadata.metadataUrl = metadataUrl;

                                    if (data[i].pid) {
                                        //data[i].metadataUrl = metadataUrl;
                                        data[i].name = name;
                                        data[i].geom_idx = item.geom_idx;
                                        data[i].query = query;
                                        data[i].metadata = metadata;

                                        pidList.push(data[i]);
                                    } else {
                                        //map with geom_idx
                                        var parts = item.wmsurl.split("&");
                                        parts[0] = parts[0].split("?")[1];
                                        var parameters = {};
                                        for (var j in parts) {
                                            var kv = parts[j].split("=");
                                            if (kv.length === 2) {
                                                parameters[kv[0]] = kv[1]
                                            }
                                        }
                                        parameters['transparent'] = true;

                                        MapService.add({
                                            log: query.log,
                                            query: query,
                                            geom_idx: item.geom_idx,
                                            layertype: "area",
                                            name: name,
                                            layerParams: parameters,
                                            metadataUrl: metadataUrl
                                        })
                                    }
                                }

                                MapService.mapFromPidList()
                            }
                            return $q.when()
                        }, function (data) {
                            return $q.when()
                        })
                    },

                    mapFromPid: function (next, parentLayer, color) {
                        return LayersService.getObject(next.pid).then(function (data) {
                            data.data.layertype = 'area';
                            if (next.query) data.data.query = next.query;
                            if (next.metadataUrl) data.data.metadataUrl = next.metadataUrl;
                            if (next.name) data.data.name = next.name;
                            if (next.name) data.data.displayname = next.name;
                            if (next.label) data.data.displayname = next.label;
                            if (next.geom_idx) data.data.geom_idx = next.geom_idx;
                            if (next.metadata) data.data.metadata = next.metadata;
                            if (next.log) data.data.log = next.log;
                            if (color) data.data.color = color;

                            return MapService.add(data.data, parentLayer);
                        })
                    },

                    mapFromPidList: function () {
                        if (pidList.length > 0) {
                            var next = pidList.pop();
                            MapService.mapFromPid(next).then(function () {
                                MapService.mapFromPidList();
                            })
                        }
                    },

                    // addHighlight: function (pid, parentLayer) {
                    //
                    //     // wrap in timeout in case we need to wait for a prior removeHighlight()
                    //
                    //     $timeout(function () {
                    //
                    //         MapService.add(id, {leaflet: template});
                    //     }, 0);
                    // },

                    getNextUid: function () {
                        return uid;
                    },

                    removeHighlight: function () {
                        for (var name in leafletLayers) {
                            if (name.match(/highlight.*/) != null) {
                                delete leafletLayers[name];
                            }
                        }
                    },

                    add: function (id, parentLayer) {
                        var parentLeafletGroup;
                        if (parentLayer !== undefined) {
                            parentLeafletGroup = parentLayer.leaflet
                        }
                        if (parentLeafletGroup === undefined) {
                            id.uid = uid;
                            uid = uid + 1;
                        } else {
                            id.uid = parentLayer.uid
                        }

                        var promises = [];

                        if (id.color !== undefined) {
                            id.red = parseInt(id.color.substr(0, 2), 16);
                            id.green = parseInt(id.color.substr(2, 2), 16);
                            id.blue = parseInt(id.color.substr(4, 2), 16)
                        } else if (id.red === undefined) {
                            id.color = ColourService.nextColour();
                            id.red = parseInt(id.color.substr(0, 2), 16);
                            id.green = parseInt(id.color.substr(2, 2), 16);
                            id.blue = parseInt(id.color.substr(4, 2), 16)
                        } else {
                            var r = id.red.toString(16);
                            if (r.length === 1) r = '0' + r;
                            var g = id.green.toString(16);
                            if (g.length === 1) g = '0' + g;
                            var b = id.blue.toString(16);
                            if (b.length === 1) b = '0' + b;
                            id.color = r + g + b
                        }
                        if (id.colorType === undefined) {
                            id.colorType = '-1'
                        }

                        if (id.facet === undefined) {
                            id.facet = '-1';
                        }

                        id.facetList = {};

                        if (id.size === undefined) {
                            id.size = $SH.defaultSpeciesDotSize
                        }

                        if (id.opacity === undefined) {
                            id.opacity = $SH.defaultSpeciesDotOpacity
                        }

                        id.uncertainty = false;

                        id.visible = true;

                        var idx = 0;
                        for (var k in leafletLayers) {
                            idx++
                        }

                        // do not change the selected layer if this is a sublayer
                        if (!parentLeafletGroup) {
                            layers.unshift(id);
                            selected.layer = id;
                            selected.layer.index = idx + 1;
                        }

                        var newLayer = {};

                        if (id.layertype !== undefined && id.layertype.toUpperCase() === "WMS") {
                            //External WMS layer

                            newLayer = {
                                name: uid + ': ' + id.displayname,
                                type: 'wms',
                                visible: true,
                                url: id.url,
                                layertype: 'wms',
                                legendurl: id.legendurl,
                                opacity: 1.0,
                                layerParams: {
                                    layers: id.name,
                                    format: 'image/png',
                                    transparent: true
                                }
                            };

                            // do not add to log if it is a child layer or already logged
                            if ((id.log === undefined || id.log) && parentLayer === undefined) {
                                LoggerService.log('Map', 'WMS', {
                                    url: id.url,
                                    label: id.displayname,
                                    legendurl: id.legendurl
                                }, id.uid);
                            } else {
                                LoggerService.addLayerId(id.uid)
                            }

                        } else if ((id.q || id.qid) && id.layertype !== 'area') {
                            if (!id.bs) id.bs = $SH.biocacheServiceUrl
                            if (!id.ws) id.ws = $SH.biocacheUrl

                            // do not add to log if it is a child layer or already logged
                            if ((id.log === undefined || id.log) && parentLayer === undefined) {
                                LoggerService.log('Map', 'Species', {
                                    bs: id.bs,
                                    ws: id.ws,
                                    qid: id.qid,
                                    label: id.displayname,
                                    species_list: id.species_list
                                }, id.uid);
                            } else {
                                LoggerService.addLayerId(id.uid)
                            }

                            if (id.qid && !id.q) {
                                id.q = id.qid
                            }

                            id.layertype = 'species';

                            // the display of species layers can be modified with 'facets' that hide items
                            id.facets = []

                            var env = 'colormode%3Agrid%3Bname%3Acircle%3Bsize%3A3%3Bopacity%3A1';
                            var firstLayer = undefined;
                            if (id && id.layer && id.layer.leaflet && id.layer.leaflet.layerOptions &&
                                id.layer.leaflet.layerOptions.layers) {
                                firstLayer = id.layer.leaflet.layerOptions.layers[0];
                            }
                            if (firstLayer && firstLayer.layerParams.ENV) {
                                env = firstLayer.layerParams.ENV;
                            } else if (id.colorType === '-1') {
                                env = 'colormode%3A-1%3Bname%3Acircle%3Bsize%3A3%3Bopacity%3A1%3Bcolor%3A' + id.color;
                            }


                            //backup selection fq
                            var fq = undefined;
                            if (firstLayer && firstLayer.layerParams.fq) {
                                fq = firstLayer.layerParams.fq;
                            }

                            newLayer = {
                                name: uid + ': ' + id.name,
                                type: 'wms',
                                visible: true,
                                url: id.bs + '/webportal/wms/reflect?OUTLINE=false&',
                                layertype: 'species',
                                opacity: id.opacity / 100.0,
                                layerParams: {
                                    opacity: id.opacity / 100.0,
                                    layers: 'ALA:occurrences',
                                    format: 'image/png',
                                    q: id.qid,
                                    ENV: env,
                                    transparent: true,
                                    continuousWorld: true
                                }
                                // temporarily use the same legend as colorType == 'grid'
                                , legendurl: $SH.baseUrl + "/assets/gridlegend.png"
                            };

                            //restore selection fq
                            if (fq !== undefined) {
                                newLayer.layerParams.fq = fq;
                            }

                            if (id.species_list && $SH.listsFacets) {
                                promises.push(ListsService.getItemsQ(id.species_list));
                            }

                            id.groupedFacets = []
                            promises.push(FacetAutoCompleteService.search(id, false).then(function (data) {
                                id.groupedFacets = data;
                            }));

                            id.indexFields = []
                            promises.push(FacetAutoCompleteService.search(id, true).then(function (data) {
                                id.indexFields = data;
                            }));

                            promises.push(BiocacheService.bbox(id).then(function (data) {
                                id.bbox = data
                            }));

                            promises.push(BiocacheService.count(id).then(function (data) {
                                id.count = data;
                                if (id.count == 0 && id.fromSave === undefined) {
                                    bootbox.alert(id.name + "<br/><br/>" + $i18n(475, "No occurrences mapped for this layer and applied filters."))
                                }
                                if (id.count < 100000 && id.fromSave === undefined) {
                                    id.colorType = '-1'
                                }
                            }));
                        } else {
                            var layerParams;
                            var sld_body = undefined;

                            if (id.layertype === 'area') {
                                if (id.id && ( isNaN(id.id)? id.id.includes(":") : false )){
                                    //qs does not parse full url, it ignores the first param after ?
                                    var wmsurl = id.wmsurl.split('?')[1]
                                    var qs = new URLSearchParams(wmsurl)
                                    sld_body = qs.get('sld_body');
                                    newLayer = {
                                        name: uid + ': ' + id.name,
                                        type: qs.get('service').toLowerCase(),
                                        visible: true,
                                        opacity: id.opacity / 100.0,
                                        url: $SH.geoserverUrl + '/wms',
                                        layertype: 'area',
                                        layerParams: {
                                            opacity: id.opacity / 100.0,
                                            layers: qs.get('layers'),
                                            format: qs.get('format'),
                                            sld_body: sld_body,
                                            transparent: true
                                        }
                                    }
                                }else{
                                    if (id.type === 'envelope') {
                                        newLayer = {
                                            name: uid + ': ' + id.name,
                                            type: 'wms',
                                            visible: true,
                                            opacity: id.opacity / 100.0,
                                            url: $SH.geoserverUrl + '/wms',
                                            layertype: 'area',
                                            layerParams: {
                                                opacity: id.opacity / 100.0,
                                                layers: 'ALA:' + id.id,
                                                format: 'image/png',
                                                transparent: true
                                            }
                                        };
                                    } else {
                                        //backup sld_body
                                        if (id && id.leaflet && id.leaflet.layerParams && id.leaflet.layerParams.sld_body) {
                                            sld_body = id.leaflet.layerParams.sld_body
                                        }

                                        if (id.layerParams) {
                                            layerParams = id.layerParams;
                                            if (id.transparent !== undefined) layerParams.transparent = true;
                                            if (id.opacity !== undefined) layerParams.opacity = id.opacity / 100.0;
                                            if (id.format !== undefined) layerParams.format = 'image/png';
                                        } else {
                                            layerParams = {
                                                opacity: id.area_km == 0 ? 0 : id.opacity / 100.0,
                                                layers: id.area_km == 0 ? 'ALA:Points' : 'ALA:Objects',
                                                format: 'image/png',
                                                transparent: true,
                                                viewparams: 's:' + id.pid
                                            }
                                        }

                                        //user or layer object
                                        newLayer = {
                                            name: uid + ': ' + id.name,
                                            type: 'wms',
                                            visible: true,
                                            opacity: id.opacity / 100.0,
                                            url: $SH.geoserverUrl + '/wms',
                                            layertype: 'area',
                                            layerParams: layerParams
                                        };

                                        // do not add to log if it is a child layer or already logged
                                        if ((id.log === undefined || id.log) && parentLayer === undefined) {
                                            LoggerService.log('Map', 'Area', {
                                                pid: id.pid,
                                                geom_idx: id.geom_idx,
                                                label: id.displayname,
                                                query: id.query,
                                                taskId: id.taskId
                                            }, id.uid);
                                        } else {
                                            LoggerService.addLayerId(id.uid)
                                        }
                                    }

                                    //restore sld_body
                                    if (sld_body) {
                                        newLayer.layerParams.sld_body = sld_body;
                                    } else {
                                        newLayer.layerParams.sld_body = this.objectSld(id)
                                    }

                                    if (id.pid) newLayer.pid = id.pid;
                                }


                            } else {
                                var layer;
                                if (id.displaypath !== undefined) layer = id;
                                else layer = LayersService.getLayer(id.id);

                                // do not add to log if it is a child layer or already logged
                                if ((id.log === undefined || id.log) && parentLayer === undefined) {
                                    LoggerService.log('Map', 'Layer', {
                                        id: id.id,
                                        label: layer.layer.displayname
                                    }, id.uid);
                                } else {
                                    LoggerService.addLayerId(id.uid)
                                }

                                if (layer.type !== 'e') {
                                    if (layer.type == 'c') {
                                        id.layertype = 'contextual';
                                    } else {
                                        id.layertype = 'gridAsContextual'
                                    }

                                    id.contextualSelection = {};

                                    id.contextualList = [];
                                    id.contextualListCount = null;

                                    id.contextualPage = 1;
                                    id.contextualPageSize = 5;

                                    promises.push(LayersService.getField(id.id, 0, id.contextualPageSize, '').then(function (data) {
                                        id.contextualList = data.data.objects;
                                        id.contextualListCount = id.contextualList.length;
                                        for (var i in id.contextualList) {
                                            if (id.contextualList.hasOwnProperty(i)) {
                                                id.contextualList[i].selected = false
                                            }
                                        }
                                        id.contextualMaxPage = Math.ceil(data.data.number_of_objects / id.contextualPageSize);
                                    }));
                                } else if (id.layertype === undefined) {
                                    id.layertype = 'grid'
                                }

                                var url = layer.layer.displaypath
                                url = url.replace(/\?.*/, '')

                                var source = 'analysis'
                                if (layer.id.startsWith("el") || id.layertype == 'gridAsContextual') {
                                    source = 'environmental'
                                    id.defaultStyle = layer.layer.name
                                } else if (layer.id.startsWith("cl")) {
                                    source = 'contextual'
                                    id.defaultStyle = layer.id
                                }

                                if (!id.style) id.style = 'default'
                                var style = id.style
                                if ('default' == style) style = id.defaultStyle
                                if ('linear' == style) style = id.defaultStyle + '_linear'
                                if ('outline' == style) style = 'outline'
                                if ('filled' == style) style = 'polygon'

                                newLayer = {
                                    name: uid + ': ' + layer.layer.displayname,
                                    type: 'wms',
                                    visible: true,
                                    opacity: id.opacity / 100.0,
                                    url: url,
                                    layertype: id.layertype,
                                    source: source,
                                    layerParams: {
                                        opacity: id.opacity / 100.0,
                                        layers: 'ALA:' + layer.layer.name,
                                        format: 'image/png',
                                        transparent: true
                                    }
                                };
                                if (source != 'analysis' && !style) {
                                    newLayer.layerParams.styles = style || id.id
                                }

                                if (id.layertype === 'scatterplotEnvelope') {
                                    var layer2 = LayersService.getLayer(id.layer2);
                                    newLayer.layerParams.layers = "ALA:" + layer.layer.name + ",ALA:" + layer2.layer.name

                                    parentLayer.parentVisible = true
                                }

                                if (id.sldBody) {
                                    newLayer.layerParams.sld_body = id.sldBody
                                    newLayer.url = newLayer.url.replace("gwc/service/", "")
                                } else if (id.sld_body) {
                                    newLayer.layerParams.sld_body = id.sld_body
                                    newLayer.url = newLayer.url.replace("gwc/service/", "")
                                }

                                newLayer.legendurl = newLayer.url
                                    .replace(/gwc\/service\//, '') + "?layer=" + encodeURIComponent(newLayer.layerParams.layers)

                                if (!newLayer.legendurl.indexOf("GetLegendGraphic") >= 0) {
                                    if (id.sldBody) {
                                        newLayer.legendurl += "&service=WMS&request=GetLegendGraphic&format=image/png&sld_body=" + encodeURIComponent(id.sldBody)
                                    } else if (id.sld_body) {
                                        newLayer.legendurl += "&service=WMS&request=GetLegendGraphic&format=image/png&sld_body=" + encodeURIComponent(id.sld_body)
                                    } else if (id.style) {
                                        //newLayer.legendurl += "&service=WMS&request=GetLegendGraphic&format=image/png&style=" + encodeURIComponent(style)
                                        if(style) {
                                            newLayer.legendurl += "&service=WMS&request=GetLegendGraphic&format=image/png&style=" + encodeURIComponent(style);
                                        } else {
                                            newLayer.legendurl += "&service=WMS&request=GetLegendGraphic&format=image/png&style=" + id.layer.id;
                                        }

                                    } else {
                                        newLayer.legendurl += "&service=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png"
                                    }
                                }
                            }
                        }

                        if (id.leaflet !== undefined && id.fromSave !== undefined) {
                            leafletLayers[id.uid] = id.leaflet;
                            $timeout(function () {
                            }, 0);
                        } else {
                            // add as a layer group
                            var layerGroup = parentLeafletGroup || {
                                type: 'group',
                                visible: true,
                                layerOptions: {
                                    layers: []
                                },
                                name: newLayer.name
                            };

                            if (id.layertype === 'scatterplotEnvelope') {
                                // add below the parent layer
                                layerGroup.layerOptions.layers.unshift(newLayer);
                            } else {
                                layerGroup.layerOptions.layers.push(newLayer);
                            }

                            if (!parentLeafletGroup) {
                                id.leaflet = layerGroup;
                                leafletLayers[id.uid] = layerGroup;
                                $timeout(function () {
                                }, 0);
                            } else {
                                leafletLayers[id.uid] = id.leaflet;
                                delete leafletLayers[id.uid];
                                $timeout(function () {
                                    leafletLayers[parentLayer.uid] = parentLayer.leaflet;
                                }, 0);
                            }

                            if (id.q && id.layertype !== 'area' && id.fromSave === undefined) {
                                promises.push(MapService.addOtherArea("distribution", id, id.area, id.includeExpertDistributions));
                                promises.push(MapService.addOtherArea("track", id, id.area, id.includeAnimalMovement));
                                promises.push(MapService.addOtherArea("checklist", id, id.area, id.includeChecklists));
                            }

                            // do not select this layer if it is a child layer
                            if (!parentLeafletGroup) {
                                $timeout(function () {
                                    $rootScope.$broadcast('showLegend', id);
                                    MapService.select(id);
                                }, 0);
                            }
                        }

                        //add to promises if waiting is required
                        return $q.all(promises).then(function (results) {
                            return id.uid
                        });

                    },

                    getLayer: function (id) {
                        return leafletLayers[id]
                    },

                    getFullLayer: function (uid) {
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].uid === uid) {
                                return layers[i]
                            }
                        }
                        return null
                    },

                    select: function (id) {
                        selected.layer = id;
                        if ($SH.defaultPaneResizer)
                            $SH.defaultPaneResizer.show('south');
                    },
                    objectSld: function (item) {
                        var sldBody = '';
                        if(item.pid && item.pid.includes(":")){
                            //qs does not parse full url, it ignores the first param after ?
                            var wmsurl = id.wmsurl.split('?')[1]
                            var qs = new URLSearchParams(wmsurl)
                            sldBody = qs.get('sld_body')

                        }else if (item.type === 'envelope') {
                            sldBody = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><StyledLayerDescriptor xmlns=\"http://www.opengis.net/sld\">"
                                + "<NamedLayer><Name>ALA:" + item.id + "</Name>"
                                + "<UserStyle><FeatureTypeStyle><Rule><RasterSymbolizer><Geometry></Geometry>"
                                + "<ColorMap>"
                                + "<ColorMapEntry color=\"#ffffff\" opacity=\"0\" quantity=\"0\"/>"
                                + "<ColorMapEntry color=\"#.colour\" opacity=\"1\" quantity=\"1\" />"
                                + "</ColorMap></RasterSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>";
                        } else if (item.area_km === 0) {
                            sldBody = '<?xml version="1.0" encoding="UTF-8"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink"><NamedLayer><Name>ALA:Points</Name><UserStyle><FeatureTypeStyle>\n' +
                                '     <Rule>\n' +
                                '       <PointSymbolizer>\n' +
                                '         <Graphic>\n' + '<ExternalGraphic><OnlineResource xlink:type="simple" xlink:href="https://spatial.ala.org.au/geoserver/styles/marker.png" /><Format>image/png</Format></ExternalGraphic><Size>36</Size>' +
                                '         </Graphic>\n' +
                                '       </PointSymbolizer>\n' +
                                '       <TextSymbolizer><Label>' + item.name + '</Label>' +
                                '           <Font><CssParameter name="font-family">Roboto</CssParameter>' +
                                '                 <CssParameter name="font-size">12</CssParameter>' +
                                '                 <CssParameter name="font-style">normal</CssParameter>' +
                                '           </Font>' +
                                '           <LabelPlacement><PointPlacement><AnchorPoint><AnchorPointX>0.5</AnchorPointX><AnchorPointY>0.0</AnchorPointY></AnchorPoint><Displacement><DisplacementX>0</DisplacementX><DisplacementY>5</DisplacementY>' +
                                '           </Displacement></PointPlacement></LabelPlacement>' +
                                '           <Fill><CssParameter name="fill">#.colour</CssParameter></Fill>' +
                                '       </TextSymbolizer>' +
                                '     </Rule>\n' +
                                '   </FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';
                        } else {
                            var layername = 'ALA:Objects';
                            if (item.layerParams !== undefined) {
                                layername = item.layerParams.layers;
                            }
                            sldBody = '<?xml version="1.0" encoding="UTF-8"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld"><NamedLayer><Name>' + layername + '</Name><UserStyle><FeatureTypeStyle><Rule><Title>Polygon</Title><PolygonSymbolizer><Fill><CssParameter name="fill">#.colour</CssParameter></Fill></PolygonSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';
                        }
                        sldBody = sldBody.replace('.colour', item.color);
                        return sldBody
                    },
                    _firstLayer: function (layer) {
                        if (layer.layer.leaflet !== undefined && layer.layer.leaflet.layerOptions !== undefined && layer.layer.leaflet.layerOptions.layers !== undefined) {
                            return layer.layer.leaflet.layerOptions.layers[0];
                        } else {
                            return layer.leaflet.layerOptions.layers[0];
                        }
                    },
                    reloadLayer: function (layer) {
                        leafletLayers[layer.uid] = layer.leaflet;
                        delete leafletLayers[layer.uid];
                        $timeout(function () {
                            leafletLayers[layer.uid] = layer.leaflet;
                        })
                    },
                    reMap: function (layer) {
                        if (layer.layer.layertype === 'area') {
                            this._firstLayer(layer).layerParams.sld_body = this.objectSld(layer.layer)
                        }

                        var len = 0
                        if (layer.layer.leaflet !== undefined && layer.layer.leaflet.layerOptions !== undefined && layer.layer.leaflet.layerOptions.layers !== undefined) {
                            len = layer.layer.leaflet.layerOptions.layers.length
                        } else {
                            len = layer.leaflet.layerOptions.layers.length
                        }

                        // do not apply layer parameters when there are sublayers
                        if (len == 1) {
                            this.leafletScope.changeParams(this.getLayer(layer.layer.uid), this._firstLayer(layer).layerParams)
                        }
                    },
                    newArea: function (name, q, wkt, area_km, bbox, pid, wms, legend, metadata) {
                        return {
                            q: q,
                            wkt: wkt,
                            area_km: area_km,
                            bbox: bbox,
                            name: name,
                            wms: wms,
                            legend: legend,
                            pid: pid,
                            metadata: metadata
                        }
                    },
                    getSpeciesLayerQuery: function (layer) {
                        var query = {q: [], name: '', bs: '', ws: ''};
                        query.name = layer.name;
                        query.bs = layer.bs;
                        query.ws = layer.ws;
                        query.q.push(layer.q);
                        if (layer.fq && layer.fq.length > 0) {
                            query.q = query.q.concat(layer.fq)
                        }

                        if (layer.qid) query.qid = layer.qid;

                        return query
                    },
                    getAreaLayerQuery: function (layer) {
                        var query = {
                            area: {}
                        };
                        query.area.q = layer.q || [];
                        query.area.wkt = layer.wkt || '';
                        query.area.bbox = layer.bbox || [];
                        query.area.pid = layer.pid || '';
                        query.area.name = layer.name || '';
                        query.area.wms = layer.wms || '';
                        query.area.legend = layer.legend || '';
                        query.area.uid = layer.uid;
                        query.area.type = layer.type || '';
                        return query
                    },
                    setBaseMap: function (basemap) {
                        this.leafletScope.setBaseMap(basemap);
                        this.updateZindex()
                    },
                    nextLayerName: function (name) {
                        var idx = 0;
                        var changed = true;
                        while (changed) {
                            changed = false;
                            for (var i = 0; i < this.mappedLayers.length; i++) {
                                var formatted = idx === 0 ? name : name + '-' + idx;
                                if (this.mappedLayers[i].name === formatted) {
                                    idx = idx + 1;
                                    changed = true;
                                }
                            }
                        }

                        return idx === 0 ? name : name + '-' + idx;
                    }
                };

                return MapService
            }])
}(angular));
