(function (angular) {
    'use strict';
    angular.module('map-service', ['layers-service', 'facet-auto-complete-service', 'biocache-service'])
        .factory("MapService", ['LayoutService', '$timeout', 'LayersService', 'FacetAutoCompleteService', 'BiocacheService', 'ColourService',
            function (LayoutService, $timeout, LayersService, FacetAutoCompleteService, BiocacheService, ColourService) {
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
                    
                    groupLayersByType: function () {
                        var groups = {}
                        layers.forEach(function (layer) {
                            if(!groups[layer.layertype]){
                                groups[layer.layertype] = []
                            }

                            groups[layer.layertype].push(layer)
                        })
                        return groups
                    },

                    speciesLayers: function () {
                        var list = []
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

                    getBaseMap: function () {
                        this.leafletScope.getBaseMap()
                    },

                    updateZindex: function () {
                        for (var i = 0; i < this.mappedLayers.length; i++) {
                            this.mappedLayers[i].index = this.mappedLayers.length - i
                            this.leafletScope.moveLayer(this.getLayer(this.mappedLayers[i].uid), this.mappedLayers[i].index)
                        }
                    },
                    removeAll: function () {
                        var layer
                        while(layer = layers.pop()){
                            for (var k = 0; k < SpatialPortalConfig.hoverLayers.length; k++) {
                                if (layer.layer && (SpatialPortalConfig.hoverLayers[k] == layer.layer.id)) {
                                    SpatialPortalConfig.hoverLayers.splice(k, 1)
                                }
                            }

                            delete leafletLayers[layers[i].uid]

                            layers.splice(i, 1)
                        }
                    },
                    remove: function (uid) {
                        var deleteIndex
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].uid === uid) {
                                for (var k = 0; k < SpatialPortalConfig.hoverLayers.length; k++) {
                                    if (layers[i].layer && (SpatialPortalConfig.hoverLayers[k] == layers[i].layer.id)) {
                                        SpatialPortalConfig.hoverLayers.splice(k, 1)
                                    }
                                }

                                deleteIndex = i
                                delete leafletLayers[uid]
                                break;
                            }
                        }

                        if(deleteIndex != undefined){
                            layers.splice(deleteIndex, 1)
                        }
                    },

                    add: function (id, bs) {
                        bs = bs || SpatialPortalConfig.biocacheServiceUrl

                        id.uid = uid
                        uid = uid + 1

                        layers.unshift(id)

                        if (id.red === undefined) {
                            id.color = ColourService.nextColour()
                            id.red = parseInt(id.color.substr(0, 2), 16)
                            id.green = parseInt(id.color.substr(2, 2), 16)
                            id.blue = parseInt(id.color.substr(4, 2), 16)
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
                            id.opacity = 60
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
                                url: bs + '/webportal/wms/reflect?',
                                layertype: 'species',
                                opacity: id.opacity / 100.0,
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
                                    opacity: id.opacity / 100.0,
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
                                    opacity: id.opacity / 100.0,
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

                    getFullLayer: function (uid) {
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].uid === uid) {
                                return layers[i]
                            }
                        }
                        return null
                    },

                    select: function (id) {
                        selected.layer = id
                    },
                    objectSld: function (item) {
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
                    },
                    getSpeciesLayerQuery: function (layer) {
                        var query = {q: [], name: '', bs: '', ws: ''}
                        query.name = layer.name
                        query.bs = layer.bs
                        query.ws = layer.ws
                        query.q.push(layer.q)
                        if (layer.fq && layer.fq.length > 0) {
                            query.q = query.q.concat(layer.fq)
                        }

                        if (layer.qid) query.qid = layer.qid

                        return query
                    },
                    getAllSpeciesQuery: function (layer) {
                        var query = {q: [], name: '', bs: '', ws: ''}
                        query.name = 'All species'
                        query.bs = SpatialPortalConfig.biocacheServiceUrl
                        query.ws = SpatialPortalConfig.biocacheUrl
                        query.q.push('*:*')
                        query.selectOption = 'allSpecies'

                        return query
                    },
                    getAreaLayerQuery: function (layer) {
                        var query = {
                            area: {
                            }
                        }
                        query.area.q = layer.q || []
                        query.area.wkt = layer.wkt || ''
                        query.area.bbox = layer.bbox || []
                        query.area.pid = layer.pid || ''
                        query.area.name = layer.name || ''
                        query.area.wms = layer.wms || ''
                        query.area.legend = layer.legend || ''
                        query.area.uid = layer.uid
                        return query
                    },
                    info: function (item) {
                        if (item.layertype == 'species') {
                            LayoutService.openModal('speciesInfo', item, '')
                        } else if (item.layertype == 'area') {
                            console.log(item)
                            alert('area')
                        } else {
                            if (item.metadataUrl !== undefined) {
                                LayoutService.openIframe(item.metadataUrl, '', '')
                            } else {
                                LayoutService.openIframe(LayersService.url() + '/layer/more/' + item.layer.layer.id, '', '')
                            }
                        }
                    },
                    setBaseMap: function (basemap) {
                        this.leafletScope.setBaseMap(basemap)
                        this.updateZindex()
                    }
                }
            }])
}(angular));