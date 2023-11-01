(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name ToolExportMapService
     * @description
     *   Client side tool to export the map as an image
     */
    angular.module('tool-export-map-service', [])
        .factory("ToolExportMapService", ["$http", "$q", "MapService", "LayersService", "LayoutService",
            function ($http, $q, MapService, LayersService, LayoutService) {
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
                                    "defaultValue": "png",
                                    "selection": "single",
                                    "content": [
                                        "png",
                                        "jpg",
                                        "pdf"
                                    ],
                                    "optional": false
                                }

                            }],
                        "description": $i18n(425,"Export areas.")
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
                                if (k !== 'draw' && k.match(/highlight.*/) == null && k !== 'images') {
                                    var group = MapService.leafletLayers[k].layerOptions.layers;
                                    for (var j in group) {
                                        var i = group[j];
                                        var url = i.url;
                                        if (url.indexOf('?') < 0) url += '?';
                                        //Adding a quick fix for the issue that exporting map without areas
                                        //Todo Mapservice may be a better place to put this fix
                                        url += "&bbox=" + bbox.join();
                                        url += "&width=" + windowSize[0] + "&height=" + windowSize[1]
                                        url += "&service=WMS&request=GetMap"
                                        //end fix

                                        for (var j in i.layerParams) {
                                            if (i.layerParams.hasOwnProperty(j) && i.layerParams[j] !== undefined) {
                                                url += '&' + j + '=' + i.layerParams[j]
                                            }
                                        }
                                        //Check if opacity has been defined
                                        if (url.indexOf("opacity") == -1)
                                            url += "&opacity=" + (i.opacity);

                                        mapLayers.push(url)
                                    }
                                }
                            }
                        }

                        var data = {processName: 'MapImage'};
                        data.overrideValues = {
                            MapImage: {
                                input: {
                                    outputType: {constraints: {'defaultValue': outputType}},
                                    resolution: {constraints: {'defaultValue': resolution}},
                                    bbox: {constraints: {'defaultValue': bbox}},
                                    windowSize: {constraints: {'defaultValue': windowSize}},
                                    comment: {constraints: {'defaultValue': comment}},
                                    baseMap: {constraints: {'defaultValue': baseMap}},
                                    mapLayers: {constraints: {'defaultValue': mapLayers}}
                                }
                            },
                            'stage': 'execute'
                        };
                        LayoutService.openModal('tool', data, false);
                    }
                };
            }])
}(angular));
