(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name envelope
     * @description
     *   A panel with controls for creating environmental envelopes
     */
    angular.module('envelope-directive', ['biocache-service', 'map-service', 'layers-service', 'facet-auto-complete-service'])
        .directive('envelope', ['LayoutService', 'MapService', '$timeout', 'LayersService', 'BiocacheService', 'PredefinedAreasService',
            'FacetAutoCompleteService', '$q', 'LoggerService',
            function (LayoutService, MapService, $timeout, LayersService, BiocacheService, PredefinedAreasService, FacetAutoCompleteService, $q, LoggerService) {

                return {
                    scope: {
                        _custom: '&onCustom'
                    },
                    templateUrl: '/spApp/envelopeContent.htm',
                    link: function (scope, element, attrs) {
                        scope.list = [];

                        scope.layers = [];

                        scope.selection = {};

                        scope.countRequests = [];

                        scope.refreshTimeout = null;

                        LoggerService.pause()

                        scope.save = function () {
                            //create new layer
                            var data = {processName: 'Envelope'};
                            data.overrideValues = {
                                Envelope: {
                                    input: {
                                        envelope: {
                                            constraints: {
                                                'defaultValue': scope.getFq()
                                            }
                                        }
                                    }
                                },
                                'stage': 'execute'
                            };
                            //delete template layers
                            scope.cancel();

                            LoggerService.resume();

                            LayoutService.openModal('tool', data, false);
                        };

                        scope.cancel = function () {
                            LoggerService.resume();

                            scope.cancelCountRequests();

                            if (scope.refreshTimeout != null) {
                                $timeout.cancel(scope.refreshTimeout);
                                scope.refreshTimeout = null;
                            }

                            while (scope.layers.length > 0) {
                                scope.removeLayer()
                            }
                            LayoutService.closePanel()
                        };

                        scope.addLayer = function (layerItem) {
                            var layer = layerItem;

                            if (layer && layer.id && !layer.selected) {
                                layer.min = layer.layer.environmentalvaluemin;
                                layer.max = layer.layer.environmentalvaluemax;
                                scope.layers.push(layer);
                                scope.selection = scope.layers[scope.layers.length - 1];

                                layer.layer.displaypath = layer.layer.displaypath.replace("/gwc/service", "");

                                layer.sldBody = scope.getSldBody(layer.layer.name, layer.min, layer.max);

                                MapService.add(layer).then(function (uid) {
                                    layer.uid = uid;
                                });

                                scope.update();
                                scope.updateDisplay();
                            }
                        };

                        scope.removeLayer = function () {
                            var layer = scope.layers[scope.layers.length - 1];

                            MapService.remove(layer.uid);

                            scope.layers.splice(scope.layers.length - 1, 1);

                            scope.selection = scope.layers[scope.layers.length - 1];
                        };

                        scope.updateDisplay = function () {
                            var layer = scope.layers[scope.layers.length - 1];

                            var mappedLayer = MapService.getLayer(layer.uid);

                            if (mappedLayer) {
                                var ly = mappedLayer.layerOptions.layers[0];
                                ly.layerParams.sld_body = scope.getSldBody(layer.layer.name, layer.min, layer.max);

                                layer.layer.uid = layer.uid;
                                layer.layer.leaflet = {layerParams: mappedLayer.layerParams};

                                MapService.reMap(layer)
                            }
                        };

                        scope.getSldBody = function (name, min, max) {
                            var sldBody = '<?xml version="1.0" encoding="UTF-8"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld"><NamedLayer><Name>ALA:.name.</Name><UserStyle><FeatureTypeStyle><Rule><RasterSymbolizer><ColorMap><ColorMapEntry color="0x0000FF" opacity="1" quantity=".min0."/><ColorMapEntry color="0x0000FF" opacity="0" quantity=".min1."/><ColorMapEntry color="0x0000FF" opacity="0" quantity=".max0."/><ColorMapEntry color="0x0000FF" opacity="1" quantity=".max1."/></ColorMap></RasterSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';
                            sldBody = sldBody.replace('.name.', name);
                            sldBody = sldBody.replace('.min0.', 1 * min - 0.0000002).replace('.min1.', 1 * min - 0.0000001);
                            sldBody = sldBody.replace('.max0.', 1 * max + 0.0000001).replace('.max1.', 1 * max + 0.0000002);
                            return sldBody
                        };

                        scope.getFq = function () {
                            var fq = [];
                            for (var i = 0; i < scope.layers.length; i++) {
                                var layer = scope.layers[i];
                                fq[i] = layer.id + ":[" + layer.min + " TO " + layer.max + "]"
                            }
                            return fq
                        };

                        scope.cancelCountRequests = function () {
                            var size = scope.countRequests.length;
                            for (var i = size - 1; i >= 0; i--) {
                                scope.countRequests[i].resolve();
                                scope.countRequests.splice(i);
                            }
                        };

                        scope.update = function () {
                            scope.cancelCountRequests();

                            var fq = scope.getFq();

                            var layer = scope.layers[scope.layers.length - 1];
                            layer.envelopeSpeciesCount = -1;

                            var timeout = $q.defer();
                            scope.countRequests.push(timeout);

                            BiocacheService.speciesCount({
                                q: fq,
                                bs: $SH.biocacheServiceUrl
                            }, undefined, {timeout: timeout.promise}).then(function (data) {
                                layer.envelopeSpeciesCount = data;
                                $timeout(function () {
                                })
                            });

                        };

                        scope.addToMap = function () {
                            MapService.add(scope.area)
                        };

                        scope.refreshAll = function () {
                            scope.update();
                            scope.updateDisplay()
                        };

                        scope.refreshAllTimeout = function () {
                            scope.cancelCountRequests();

                            if (scope.refreshTimeout != null) {
                                $timeout.cancel(scope.refreshTimeout);
                                scope.refreshTimeout = null;
                            }

                            var layer = scope.layers[scope.layers.length - 1];
                            layer.envelopeSpeciesCount = -1;

                            scope.refreshTimeout = $timeout(function () {
                                scope.refreshAll()
                            }, 2000)
                        }
                    }
                };

            }])
}(angular));
