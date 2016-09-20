(function (angular) {
    'use strict';
    angular.module('envelope-directive', ['biocache-service', 'map-service', 'layers-service', 'facet-auto-complete-service'])
        .directive('envelope', ['LayoutService', 'MapService', '$timeout', 'LayersService', 'BiocacheService',
            'FacetAutoCompleteService',
            function (LayoutService, MapService, $timeout, LayersService, BiocacheService, FacetAutoCompleteService) {

                return {
                    scope: {
                        custom: '&onCustom'
                    },
                    templateUrl: 'portal/' + 'envelopeContent.html',
                    link: function (scope, element, attrs) {
                        scope.list = []

                        scope.layers = []

                        scope.selection = {}

                        scope.list = PredefinedAreasService.getList()

                        FacetAutoCompleteService.search('').then(function (data) {
                            scope.list = data
                        })

                        scope.save = function () {
                            //create new layer
                            var fq = scope.getFq()

                            //TODO: start task and monitor for new layer

                            //delete template layers
                            scope.close()
                        }

                        scope.close = function () {
                            while (scope.layers.length > 0) {
                                scope.removeLayer()
                            }
                            LayoutService.closePanel()
                        }

                        scope.addLayer = function (layerItem) {
                            var layer = layerItem

                            if (layer && layer.id && !layer.selected) {
                                layer.min = layer.layer.environmentalvaluemin
                                layer.max = layer.layer.environmentalvaluemax
                                scope.layers.push(layer)
                                scope.selection = scope.layers[scope.layers.length - 1];

                                layer.layer.displaypath = layer.layer.displaypath.replace("/gwc/service", "")

                                layer.sldBody = scope.getSldBody(layer.layer.name, layer.min, layer.max)

                                layer.uid = MapService.add(layer)
                            }
                        }

                        scope.removeLayer = function () {
                            var layer = scope.layers[scope.layers.length - 1];

                            MapService.remove(layer.uid)

                            scope.layers.splice(scope.layers.length - 1, 1)

                            scope.selection = scope.layers[scope.layers.length - 1];
                        }

                        scope.updateDisplay = function () {
                            var layer = scope.layers[scope.layers.length - 1];

                            var mappedLayer = MapService.getLayer(layer.uid)

                            mappedLayer.layerParams.sld_body = scope.getSldBody(layer.layer.layer.name, layer.min, layer.max)

                            layer.layer.uid = layer.uid
                            layer.layer.leaflet = {layerParams: mappedLayer.layerParams}

                            MapService.reMap(layer)
                        }

                        scope.getSldBody = function (name, min, max) {
                            var sldBody = '<?xml version="1.0" encoding="UTF-8"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld"><NamedLayer><Name>ALA:.name.</Name><UserStyle><FeatureTypeStyle><Rule><RasterSymbolizer><ColorMap><ColorMapEntry color="0x0000FF" opacity="1" quantity=".min0."/><ColorMapEntry color="0x0000FF" opacity="0" quantity=".min1."/><ColorMapEntry color="0x0000FF" opacity="0" quantity=".max0."/><ColorMapEntry color="0x0000FF" opacity="1" quantity=".max1."/></ColorMap></RasterSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>'
                            sldBody = sldBody.replace('.name.', name)
                            sldBody = sldBody.replace('.min0.', 1 * min - 0.0000002).replace('.min1.', 1 * min - 0.0000001)
                            sldBody = sldBody.replace('.max0.', 1 * max + 0.0000001).replace('.max1.', 1 * max + 0.0000002)
                            return sldBody
                        }

                        scope.getFq = function () {
                            var fq = []
                            for (var i = 0; i < scope.layers.length; i++) {
                                var layer = scope.layers[i]
                                fq[i] = layer.id + ":[" + layer.min + " TO " + layer.max + "]"
                            }
                            return fq
                        }

                        scope.update = function () {
                            var fq = scope.getFq()

                            BiocacheService.speciesCount({
                                q: fq,
                                bs: SpatialPortalConfig.biocacheServiceUrl
                            }).then(function (data) {
                                var layer = scope.layers[scope.layers.length - 1];
                                layer.count = data
                            })
                        }

                        scope.addToMap = function () {
                            MapService.add(scope.area)
                        }
                    }
                };

            }])
}(angular));