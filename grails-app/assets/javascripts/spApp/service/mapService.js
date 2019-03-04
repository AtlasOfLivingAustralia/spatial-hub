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
                var selected = {layer: null};
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
                                    this.zoomToExtents(layers[i].bbox);
                                    return
                                }
                            }
                        }
                        this.zoomToExtents([[-90, -180], [90, 180]]);
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
                        if (include !== true || query.q.indexOf("lsid:") !== 0) {
                            return $q.when()
                        }
                        // for consistency with the species autocomplete, only the first lsid is used in the search
                        var lsid = query.q.substring(5);
                        return LayersService.findOtherArea(type, lsid, area).then(function (response) {
                            if (response && response.data && response.data.length > 0) {
                                var data = response.data;
                                for (var i in data) {

                                    var item = data[i];

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

                                    if (data[i].pid) {
                                        data[i].metadataUrl = metadataUrl;
                                        data[i].name = name;
                                        data[i].geom_idx = item.geom_idx;
                                        data[i].query = query;

                                        pidList.push(data[i]);
                                    } else {
                                        MapService.add({
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

                    mapFromPidList: function () {
                        if (pidList.length > 0) {
                            var next = pidList.pop();
                            LayersService.getObject(next.pid).then(function (data) {
                                data.data.layertype = 'area';
                                if (next.query) data.data.query = next.query;
                                if (next.metadataUrl) data.data.metadataUrl = next.metadataUrl;
                                if (next.name) data.data.name = next.name;
                                if (next.name) data.data.displayname = next.name;
                                if (next.geom_idx) data.data.geom_idx = next.geom_idx;

                                MapService.add(data.data);

                                MapService.mapFromPidList();
                            })
                        }
                    },

                    addHighlight: function (id) {
                        // wrap in timeout in case we need to wait for a prior removeHighlight()
                        $timeout(function () {
                            var template = highlightTemplate;
                            template.layerOptions.layers = [];

                            MapService.add(id, {leaflet: template});
                            leafletLayers["highlight" + uid] = template;
                            uid = uid + 1;
                        }, 0);
                    },

                    removeHighlight: function () {
                        for (var name in leafletLayers) {
                            if (name.match(/highlight.*/)) {
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

                        id.facet = '-1';
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

                        } else if (id.q && id.layertype !== 'area') {
                            LoggerService.log('AddToMap', 'Species', {qid: id.qid});

                            id.layertype = 'species';
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
                            };

                            //restore selection fq
                            if (fq !== undefined) {
                                newLayer.layerParams.fq = fq;
                            }

                            if (id.species_list && $SH.listsFacets) {
                                promises.push(ListsService.getItemsQ(id.species_list));
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
                                var layerParams;
                                var sld_body = undefined;

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
                                    LoggerService.log('AddToMap', 'Area', {pid: id.pid, geom_idx: id.geom_idx});

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
                                }

                                //restore sld_body
                                if (sld_body) {
                                    newLayer.layerParams.sld_body = sld_body;
                                } else {
                                    newLayer.layerParams.sld_body = this.objectSld(id)
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

                                newLayer = {
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
                                    newLayer.layerParams.sld_body = id.sldBody
                                    newLayer.url = newLayer.url.replace("gwc/service/", "")
                                } else {
                                    //id.leaflet.layerParams.styles = layer.id
                                }
                                newLayer.legendurl = newLayer.url
                                    .replace("gwc/service/", "")
                                    .replace('GetMap', 'GetLegendGraphic')
                                    .replace('layers=', 'layer=')
                                    .replace('_style', '')
                                    .replace("&style=", "&ignore=");

                                if (!newLayer.legendurl.indexOf("GetLegendGraphic") >= 0) {
                                    newLayer.legendurl += "&service=WMS&version=1.1.0&request=GetLegendGraphic&format=image/png"
                                }
                            }
                        }

                        // add as a layer group
                        var layerGroup = parentLeafletGroup || {
                            type: 'group',
                            visible: true,
                            layerOptions: {
                                layers: []
                            },
                            name: newLayer.name
                        };

                        layerGroup.layerOptions.layers.push(newLayer);

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

                        if (id.q && id.layertype !== 'area') {
                            promises.push(MapService.addOtherArea("distribution", id, id.area, id.includeExpertDistributions));
                            promises.push(MapService.addOtherArea("track", id, id.area, id.includeAnimalMovement));
                            promises.push(MapService.addOtherArea("checklist", id, id.area, id.includeChecklists));

                        }

                        // do not select this layer if it is a child layer
                        if (!parentLeafletGroup) {
                            $timeout(function () {
                                $rootScope.$broadcast('showLegend');
                                MapService.select(id);
                            }, 0);
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
                        if (item.type === 'envelope') {
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
                    reMap: function (layer) {
                        if (layer.layer.layertype === 'area') {
                            this._firstLayer(layer).layerParams.sld_body = this.objectSld(layer.layer)
                        }

                        this.leafletScope.changeParams(this.getLayer(layer.layer.uid), this._firstLayer(layer).layerParams)
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
                        query.name = $i18n("All species");
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