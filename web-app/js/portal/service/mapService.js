(function (angular) {
    'use strict';
    angular.module('map-service', ['layers-service', 'facet-auto-complete-service', 'biocache-service'])
        .factory("MapService", ['$rootScope', '$timeout', 'LayersService', 'FacetAutoCompleteService', 'BiocacheService',
            function ($rootScope, $timeout, LayersService, FacetAutoCompleteService, BiocacheService) {
                var bounds = {}
                var layers = []
                var leafletLayers = {
                    draw: {
                        name: 'draw',
                        type: 'group',
                        visible: true,
                        layerParams: {
                            showOnSelector: false
                        }
                    }
                }
                var selected = {layer: null};
                var uid = 1
                //var leafletScope = {}

                //$("#map").height($(window).height() - $('.navbar-header').height());
//                map.invalidateSize();

                return {
                    mappedLayers: layers,
                    selected: selected,
                    leafletLayers: leafletLayers,
                    bounds: bounds,

                    areaLayers: function () {
                        var list = []
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].pid !== undefined) {
                                list.push(layers[i])
                            }
                        }
                        return list
                    },

                    zoom: function (uid) {
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].uid === uid) {
                                if (layers[i].bbox !== undefined) {
                                    this.leafletScope.zoom(layers[i].bbox)
                                    return
                                }
                            }
                        }
                        this.leafletScope.zoom([[-90, -180], [90, 180]])
                    },

                    setVisible: function (uid, show) {
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].uid === uid) {
                                layers[i].visible = show
                                layers[i].leaflet.visible = show

                                this.leafletScope.showLayer(this.getLayer(uid), show)
                                if (show) this.leafletScope.moveLayer(this.getLayer(uid), layers[i].index)

                                break;
                            }
                        }
                    },

                    getExtents: function () {
                        return [
                            this.leafletScope.bounds.southWest.lng, this.leafletScope.bounds.southWest.lat,
                            this.leafletScope.bounds.northEast.lng, this.leafletScope.bounds.northEast.lat]
                    },

                    updateZindex: function () {
                        for (var i = 0; i < this.mappedLayers.length; i++) {
                            this.mappedLayers[i].index = this.mappedLayers.length - i
                            this.leafletScope.moveLayer(this.getLayer(this.mappedLayers[i].uid), this.mappedLayers[i].index)
                        }
                    },
                    removeAll: function () {
                        for (var i = layers.length - 1; i >= 0; i--) {
                            for (var k = 0; k < SpatialPortalConfig.hoverLayers.length; k++) {
                                if (SpatialPortalConfig.hoverLayers[k] == layers[i].layer.id) {
                                    SpatialPortalConfig.hoverLayers.splice(k, 1)
                                }
                            }

                            layers.splice(i, 1)

                            delete leafletLayers[uid]

                            break;
                        }
                    },
                    remove: function (uid) {
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].uid === uid) {
                                for (var k = 0; k < SpatialPortalConfig.hoverLayers.length; k++) {
                                    if (SpatialPortalConfig.hoverLayers[k] == layers[i].layer.id) {
                                        SpatialPortalConfig.hoverLayers.splice(k, 1)
                                    }
                                }

                                layers.splice(i, 1)

                                delete leafletLayers[uid]

                                break;
                            }
                        }
                    },

                    add: function (id) {
                        id.uid = uid
                        uid = uid + 1

                        layers.unshift(id)

                        if (id.red === undefined) {
                            id.color = 'ff0000'
                        } else {
                            var r = id.red.toString(16);
                            if (r.length == 1) r = '0' + r;
                            var g = id.green.toString(16);
                            if (g.length == 1) g = '0' + g;
                            var b = id.blue.toString(16);
                            if (b.length == 1) b = '0' + b;
                            id.color = r + g + b

                        }
                        if (id.colorType === undefined) {
                            id.colorType = '-1'
                        }

                        id.facet = '-1'
                        id.facetList = {}

                        if (id.size === undefined) {
                            id.size = 3
                        }

                        if (id.opacity === undefined) {
                            id.opacity = 80
                        }

                        id.uncertainty = false

                        id.visible = true

                        selected.layer = id

                        var idx = 0;
                        for (var k in leafletLayers) {
                            idx++
                        }
                        selected.layer.index = idx + 1

                        if (id.q && id.layertype !== 'area') {
                            id.layertype = 'species'
                            id.name = id.name
                            selected.layer.leaflet = {
                                name: uid + ': ' + id.name,
                                type: 'wms',
                                visible: true,
                                url: SpatialPortalConfig.biocacheServiceUrl + '/webportal/wms/reflect?',
                                layertype: 'species',
                                opacity: 80,
                                layerParams: {
                                    layers: 'ALA:occurrences',
                                    format: 'image/png',
                                    q: id.qid,
                                    ENV: 'colormode%3Agrid%3Bname%3Acircle%3Bsize%3A3%3Bopacity%3A1',
                                    transparent: true
                                }
                            }
                            if (id.colorType === '-1') {
                                selected.layer.leaflet.layerParams.ENV = 'colormode%3A-1%3Bname%3Acircle%3Bsize%3A3%3Bopacity%3A1%3Bcolor%3A' + id.color
                            }

                            //id.q + (id.fq !== undefined && id.fq.length > 0 ? " AND " + (id.fq.join(" AND ")) : '')

                            FacetAutoCompleteService.search(id).then(function (data) {
                                id.list = data
                            })

                            BiocacheService.bbox(id).then(function (data) {
                                id.bbox = data
                            })

                            BiocacheService.count(id).then(function (data) {
                                id.count = data
                                if (id.count < 100000) {
                                    id.colorType = '-1'
                                }
                            })
                        } else {
                            if (id.layertype === 'area') {
                                //user or layer object
                                selected.layer.leaflet = {
                                    name: uid + ': ' + id.name,
                                    type: 'wms',
                                    visible: true,
                                    opacity: 80,
                                    url: SpatialPortalConfig.geoserverUrl + '/wms',
                                    layertype: 'area',
                                    layerParams: {
                                        layers: 'ALA:Objects',
                                        format: 'image/png',
                                        transparent: true,
                                        viewparams: 's:' + id.pid
                                    }
                                }
                                selected.layer.leaflet.layerParams.sld_body = this.objectSld(selected.layer)
                            } else {
                                var layer
                                if (id.displaypath !== undefined) layer = id
                                else layer = LayersService.getLayer(id.id)

                                if (layer.type != 'e') {
                                    id.layertype = 'contextual'

                                    id.contextualSelection = {}

                                    id.contextualList = []

                                    id.contextualPage = 1
                                    id.contextualPageSize = 5

                                    LayersService.getField(id.id, 0, id.contextualPageSize, '').then(function (data) {
                                        id.contextualList = data.data.objects
                                        for (var i in id.contextualList) {
                                            id.contextualList[i].selected = false
                                        }
                                        id.contextualMaxPage = Math.ceil(data.data.number_of_objects / (1.0 * id.contextualPageSize))
                                    })
                                } else {
                                    id.layertype = 'grid'
                                }
                                id.layer = layer
                                var url = layer.layer.displaypath.replace("&style=", "&ignore=")

                                selected.layer.leaflet = {
                                    name: uid + ': ' + layer.layer.displayname,
                                    type: 'wms',
                                    visible: true,
                                    opacity: 80,
                                    url: layer.layer.displaypath,
                                    layertype: id.layertype,
                                    layerParams: {
                                        layers: 'ALA:' + layer.layer.name,
                                        format: 'image/png',
                                        transparent: true
                                    }
                                }
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
                                    .replace("&style=", "&ignore=")

                                if (!selected.layer.leaflet.legendurl.indexOf("GetLegendGraphic") >= 0) {
                                    selected.layer.leaflet.legendurl += "&service=WMS&version=1.1.0&request=GetLegendGraphic&format=image/png"
                                }

                                SpatialPortalConfig.hoverLayers.push(selected.layer.id)
                            }
                        }
                        console.log(selected.layer.leaflet)

                        leafletLayers[selected.layer.uid] = selected.layer.leaflet

                        $timeout(function () {
                        }, 0)

                        return id.uid
                    },

                    getLayer: function (id) {
                        return leafletLayers[id]
                    },

                    select: function (id) {
                        selected.layer = id
                    },
                    objectSld: function (item) {
//                        var r = item.red.toString(16); if (r.length == 1) r = '0' + r;
//                        var g = item.green.toString(16); if (g.length == 1) g = '0' + g;
//                        var b = item.blue.toString(16); if (b.length == 1) b = '0' + b;
                        var sldBody = '<?xml version="1.0" encoding="UTF-8"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld"><NamedLayer><Name>ALA:Objects</Name><UserStyle><FeatureTypeStyle><Rule><Title>Polygon</Title><PolygonSymbolizer><Fill><CssParameter name="fill">#.colour</CssParameter></Fill></PolygonSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>'
                        sldBody = sldBody.replace('.colour', item.color)
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
                    }
                }
            }])
}(angular));