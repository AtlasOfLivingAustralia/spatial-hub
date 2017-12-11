(function (angular) {
    'use strict';
    angular.module('map-service', ['layers-service', 'facet-auto-complete-service', 'biocache-service', 'logger-service'])
        .factory("MapService", ['LayoutService', '$q', '$timeout', 'LayersService', 'FacetAutoCompleteService', 'BiocacheService', 'ColourService', 'LoggerService',
            function (LayoutService, $q, $timeout, LayersService, FacetAutoCompleteService, BiocacheService, ColourService, LoggerService) {
                var bounds = {};
                var layers = [];
                var leafletLayers = {
                    draw: {
                        name: 'draw',
                        type: 'group',
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        }
                    }
                };
                var selected = {layer: null};
                var uid = 1;

                var MapService = {
                    mappedLayers: layers,
                    selected: selected,
                    leafletLayers: leafletLayers,
                    bounds: bounds,

                    areaLayers: function () {
                        var list = [];
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].pid !== undefined) {
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
                            if (layers[i].q !== undefined) {
                                list.push(layers[i])
                            }
                        }
                        return list
                    },

                    zoom: function (uid) {
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].uid === uid) {
                                if (layers[i].bbox !== undefined) {
                                    this.leafletScope.zoom(layers[i].bbox);
                                    return
                                }
                            }
                        }
                        this.leafletScope.zoom([[-90, -180], [90, 180]])
                    },

                    setVisible: function (uid, show) {
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].uid === uid) {
                                layers[i].visible = show;
                                layers[i].leaflet.visible = show;

                                this.leafletScope.showLayer(this.getLayer(uid), show);
                                if (show) this.leafletScope.moveLayer(this.getLayer(uid), layers[i].index);

                                break;
                            }
                        }
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
                                if (layer.layer && ($SH.hoverLayers[k] === layer.layer.id)) {
                                    $SH.hoverLayers.splice(k, 1)
                                }
                            }

                            delete leafletLayers[layers[i].uid];

                            layers.splice(i, 1)
                        }
                    },

                    remove: function (uid) {
                        var deleteIndex;
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].uid === uid) {
                                for (var k = 0; k < $SH.hoverLayers.length; k++) {
                                    if (layers[i].layer && ($SH.hoverLayers[k] === layers[i].layer.id)) {
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
                        if (include !== true) {
                            return $q.when()
                        }
                        //intersect query (lsid) and area (wkt)
                        return BiocacheService.facetGeneral("species_guid", query, 1, 0).then(function(response) {
                            if (response && response.length > 0 && response[0].fieldResult &&
                                response[0].fieldResult.length > 0 && response[0].fieldResult[0].label !== "") {
                                return LayersService.findOtherArea(type, response[0].fieldResult[0].label, area).then(function(response) {
                                    var data = response.data
                                    if (data && data.length > 0) {
                                        for (var i in data) {
                                            var item = data[i];

                                            //map with geom_idx
                                            var parts = item.wmsurl.split("&");
                                            parts[0] = parts[0].split("?")[1];
                                            var parameters = {};
                                            for (var j in parts) {
                                                var kv = parts[j].split("=");
                                                if (kv.length == 2) {
                                                    parameters[kv[0]] = kv[1]
                                                }
                                            }

                                            var name = item.area_name;
                                            if (name === undefined) {
                                                name = item.scientific
                                            }
                                            var metadataUrl = item.metadata_u;

                                            if (type == 'track' && item.group_name) {
                                                // override track metadata url with biocache-hub occurrence url
                                                metadataUrl = $SH.biocacheUrl + '/occurrence/' + item.group_name

                                                // area_name is the external track id, add name as prefix
                                                name = item.scientific + " (" + name + ")"
                                            }

                                            MapService.add( {
                                                query: query,
                                                geom_idx: item.geom_idx,
                                                layertype: "area",
                                                name: name,
                                                layerParams: parameters,
                                                metadataUrl: metadataUrl
                                            })
                                        }
                                    }
                                    return $q.when()
                                }, function(data) {
                                    return $q.when()
                                })
                            } else {
                                return $q.when()
                            }
                        })
                    },

                    add: function (id) {
                        id.uid = uid;
                        uid = uid + 1;

                        var promises = [];

                        layers.unshift(id);

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

                        id.facet = '-1';
                        id.facetList = {};

                        if (id.size === undefined) {
                            id.size = 3
                        }

                        if (id.opacity === undefined) {
                            id.opacity = 60
                        }

                        id.uncertainty = false;

                        id.visible = true;

                        selected.layer = id;

                        var idx = 0;
                        for (var k in leafletLayers) {
                            idx++
                        }
                        selected.layer.index = idx + 1;

                        if (id.q && id.layertype !== 'area') {
                            LoggerService.log('AddToMap', 'Species', {qid: id.qid});

                            id.layertype = 'species';
                            var env = 'colormode%3Agrid%3Bname%3Acircle%3Bsize%3A3%3Bopacity%3A1';
                            if (id && id.layer && id.layer.leaflet && id.layer.leaflet.layerParams &&
                                id.layer.leaflet.layerParams.ENV) {
                                env = id.layer.leaflet.layerParams.ENV;
                            } else if (id.colorType === '-1') {
                                env = 'colormode%3A-1%3Bname%3Acircle%3Bsize%3A3%3Bopacity%3A1%3Bcolor%3A' + id.color;
                            }

                            //backup selection fq
                            var fq = undefined;
                            if (id && id.layer && id.layer.leaflet && id.layer.leaflet.layerParams &&
                                id.layer.leaflet.layerParams.fq) {
                                fq = id.layer.leaflet.layerParams.fq;
                            }

                            selected.layer.leaflet = {
                                name: uid + ': ' + id.name,
                                type: 'wms',
                                visible: true,
                                url: id.bs + '/webportal/wms/reflect?',
                                layertype: 'species',
                                opacity: id.opacity / 100.0,
                                layerParams: {
                                    opacity: id.opacity / 100.0,
                                    layers: 'ALA:occurrences',
                                    format: 'image/png',
                                    q: id.qid,
                                    ENV: env,
                                    transparent: true
                                }
                            };

                            //restore selection fq
                            if (fq !== undefined) {
                                selected.layer.leaflet.layerParams.fq = fq;
                            }

                            promises.push(FacetAutoCompleteService.search(id).then(function (data) {
                                id.list = data;
                            }));

                            promises.push(BiocacheService.bbox(id).then(function (data) {
                                id.bbox = data
                            }));

                            promises.push(BiocacheService.count(id).then(function (data) {
                                id.count = data;
                                if (id.count < 100000) {
                                    id.colorType = '-1'
                                }
                            }));
                        } else {
                            if (id.layertype === 'area') {
                                LoggerService.log('AddToMap', 'Area', {pid: id.pid, geom_idx: id.geom_idx});

                                //backup sld_body
                                var sld_body = undefined;
                                if (id && id.leaflet && id.leaflet.layerParams && id.leaflet.layerParams.sld_body) {
                                    sld_body = id.leaflet.layerParams.sld_body
                                }
                                var layerParams;
                                if (id.layerParams) {
                                    layerParams = id.layerParams;
                                    if (id.transparent !== undefined) layerParams.transparent = true;
                                    if (id.opacity !== undefined) layerParams.opacity = id.opacity / 100.0;
                                    if (id.format !== undefined) layerParams.format = 'image/png';
                                } else {
                                    layerParams = {
                                        opacity: id.opacity / 100.0,
                                        layers: 'ALA:Objects',
                                        format: 'image/png',
                                        transparent: true,
                                        viewparams: 's:' + id.pid
                                    }
                                }
                                //user or layer object
                                selected.layer.leaflet = {
                                    name: uid + ': ' + id.name,
                                    type: 'wms',
                                    visible: true,
                                    opacity: id.opacity / 100.0,
                                    url: $SH.geoserverUrl + '/wms',
                                    layertype: 'area',
                                    layerParams: layerParams
                                };

                                //restore sld_body
                                if (sld_body) {
                                    selected.layer.leaflet.layerParams.sld_body = sld_body;
                                } else {
                                    selected.layer.leaflet.layerParams.sld_body = this.objectSld(selected.layer)
                                }
                            } else {
                                var layer;
                                if (id.displaypath !== undefined) layer = id;
                                else layer = LayersService.getLayer(id.id);

                                LoggerService.log('AddToMap', 'Layer', {id: id.id});

                                if (layer.type !== 'e') {
                                    id.layertype = 'contextual';

                                    id.contextualSelection = {};

                                    id.contextualList = [];

                                    id.contextualPage = 1;
                                    id.contextualPageSize = 5;

                                    promises.push(LayersService.getField(id.id, 0, id.contextualPageSize, '').then(function (data) {
                                        id.contextualList = data.data.objects;
                                        for (var i in id.contextualList) {
                                            if (id.contextualList.hasOwnProperty(i)) {
                                                id.contextualList[i].selected = false
                                            }
                                        }
                                        id.contextualMaxPage = Math.ceil(data.data.number_of_objects / id.contextualPageSize);
                                    }));
                                } else {
                                    id.layertype = 'grid'
                                }

                                var url = layer.layer.displaypath.replace("&style=", "&ignore=");

                                selected.layer.leaflet = {
                                    name: uid + ': ' + layer.layer.displayname,
                                    type: 'wms',
                                    visible: true,
                                    opacity: id.opacity / 100.0,
                                    url: layer.layer.displaypath,
                                    layertype: id.layertype,
                                    layerParams: {
                                        opacity: id.opacity / 100.0,
                                        layers: 'ALA:' + layer.layer.name,
                                        format: 'image/png',
                                        transparent: true
                                    }
                                };
                                if (id.sldBody) {
                                    selected.layer.leaflet.layerParams.sld_body = id.sldBody
                                    selected.layer.leaflet.url = selected.layer.leaflet.url.replace("gwc/service/", "")
                                } else {
                                    //selected.layer.leaflet.layerParams.styles = layer.id
                                }
                                selected.layer.leaflet.legendurl = selected.layer.leaflet.url
                                    .replace("gwc/service/", "")
                                    .replace('GetMap', 'GetLegendGraphic')
                                    .replace('layers=', 'layer=')
                                    .replace('_style', '')
                                    .replace("&style=", "&ignore=");

                                if (!selected.layer.leaflet.legendurl.indexOf("GetLegendGraphic") >= 0) {
                                    selected.layer.leaflet.legendurl += "&service=WMS&version=1.1.0&request=GetLegendGraphic&format=image/png"
                                }

                                $SH.hoverLayers.push(selected.layer.id)
                            }
                        }

                        leafletLayers[selected.layer.uid] = selected.layer.leaflet;

                        $timeout(function () {
                        }, 0);

                        if (id.q && id.layertype !== 'area') {
                            promises.push(MapService.addOtherArea("distribution", id, id.area, id.includeExpertDistributions));
                            promises.push(MapService.addOtherArea("track", id, id.area, id.includeAnimalMovement));
                            promises.push(MapService.addOtherArea("checklist", id, id.area, id.includeChecklists))
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
                        $SH.defaultPaneResizer.show('south');
                    },
                    objectSld: function (item) {
                        var sldBody = '<?xml version="1.0" encoding="UTF-8"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld"><NamedLayer><Name>ALA:Objects</Name><UserStyle><FeatureTypeStyle><Rule><Title>Polygon</Title><PolygonSymbolizer><Fill><CssParameter name="fill">#.colour</CssParameter></Fill></PolygonSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';
                        sldBody = sldBody.replace('.colour', item.color);
                        return sldBody
                    },
                    reMap: function (layer) {
                        if (layer.layer.layertype === 'area') {
                            layer.layer.leaflet.layerParams.sld_body = this.objectSld(layer.layer)
                        }

                        this.leafletScope.changeParams(this.getLayer(layer.layer.uid), layer.layer.leaflet.layerParams)
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
                    getAllSpeciesQuery: function (layer) {
                        var query = {q: [], name: '', bs: '', ws: ''};
                        query.name = $i18n('All species');
                        query.bs = $SH.biocacheServiceUrl;
                        query.ws = $SH.biocacheUrl;
                        query.q.push('*:*');
                        query.selectOption = 'allSpecies';

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
                        return query
                    },
                    info: function (item) {
                        if (item.layertype === 'species') {
                            item.display = {size: 'full'};
                            LayoutService.openModal('speciesInfo', item, false)
                        } else if (item.layertype === 'area' && item.metadataUrl === undefined) {
                            var b = item.bbox;
                            if ((item.bbox + '').startsWith('POLYGON')) {
                                //convert POLYGON box to bounds
                                var split = item.bbox.split(',');
                                var p1 = split[1].split(' ');
                                var p2 = split[3].split(' ');
                                b = [[Math.min(p1[1], p2[1]), Math.min(p1[0], p2[0])], [Math.max(p1[1], p2[1]), Math.max(p1[0], p2[0])]]
                            }
                            if (item.bbox && item.bbox.length === 4) {
                                b = [[item.bbox[1], item.bbox[0]], [item.bbox[3], item.bbox[2]]]
                            }

                            bootbox.alert("<b>Area</b><br/><br/>" +
                                "<table class='table-striped table table-bordered'>" +
                                "<tr><td style='width:100px'>Name</td><td>" + item.name + "</td></tr>" +
                                "<tr><td>" + $i18n("Description") + "</td><td>" + item.description + "</td></tr>" +
                                "<tr><td>" + $i18n("Area (sq km)") + "</td><td>" + item.area_km.toFixed(2) + "</td></tr>" +
                                "<tr><td>" + $i18n("Extents") + "</td><td>" + b[0][0] + " " + b[0][1] + ", " +
                                b[1][0] + " " + b[1][1] + "</td></tr></table>")
                        } else {
                            if (item.metadataUrl !== undefined) {
                                LayoutService.openIframe(item.metadataUrl, '', '')
                            } else {
                                LayoutService.openIframe(LayersService.url() + '/layer/more/' + item.layer.layer.id, '', '')
                            }
                        }
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
                                var formatted = idx === 0 ? name : name + ' (' + idx + ')';
                                if (this.mappedLayers[i].name === formatted) {
                                    idx = idx + 1;
                                    changed = true;
                                }
                            }
                        }

                        return idx === 0 ? name : name + ' (' + idx + ')';
                    }
                };

                return MapService
            }])
}(angular));