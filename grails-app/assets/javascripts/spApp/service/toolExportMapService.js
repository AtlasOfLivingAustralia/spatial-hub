(function (angular) {
    'use strict';
    angular.module('tool-export-map-service', [])
        .factory("ToolExportMapService", ["$http", "$q", "MapService", "LayersService", function ($http, $q, MapService, LayersService) {
            return {

                // Override text with view-config.json
                spec: {
                    "input": [
                        {
                            "name": "caption",
                            "description": "Enter a map caption.",
                            "type": "text",
                            "constraints": {
                                "optional": true
                            }
                        },
                        {
                            "name": "format",
                            "description": "Select an image format.",
                            "type": "list",
                            "constraints": {
                                "default": "png",
                                "selection": "single",
                                "content": [
                                    "png",
                                    "jpg",
                                    "pdf"
                                ],
                                "optional": false
                            }

                        }],
                        "description": "Export areas."
                    },

                execute: function (inputs) {
                    var leafletmap = $('.angular-leaflet-map');

                    var outputType = inputs[1];
                    var resolution = "0.01";
                    var bbox = MapService.getExtents();
                    var windowSize = [leafletmap.width(), leafletmap.height()];
                    var comment = inputs[0];
                    var baseMap = $SH.baseLayers[MapService.leafletScope.baseMap].exportType;
                    var mapLayers = [];


                    for (var k in MapService.leafletLayers) {
                        if (MapService.leafletLayers.hasOwnProperty(k)) {
                            if (k !== 'draw') {
                                var i = MapService.leafletLayers[k];
                                var url = i.url;
                                if (url.indexOf('?') < 0) url += '?';
                                url += "&opacity=" + (i.opacity);
                                for (var j in i.layerParams) {
                                    if (i.layerParams.hasOwnProperty(j)) {
                                        url += '&' + j + '=' + encodeURIComponent(i.layerParams[j])
                                    }
                                }
                                mapLayers.push(url)
                            }
                        }
                    }

                    var data = {processName: 'MapImage'};
                    data.overrideValues = {
                        MapImage: {
                            input: {
                                outputType: {constraints: {'default': outputType}},
                                resolution: {constraints: {'default': resolution}},
                                bbox: {constraints: {'default': bbox}},
                                windowSize: {constraints: {'default': windowSize}},
                                comment: {constraints: {'default': comment}},
                                baseMap: {constraints: {'default': baseMap}},
                                mapLayers: {constraints: {'default': mapLayers}}
                            }
                        },
                        'step': 8
                    };
                    LayoutService.openModal('tool', data, false);
                }
            };
        }])
}(angular));
