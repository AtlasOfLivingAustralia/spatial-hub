(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name ToolExportSampleService
     * @description
     *   Client side tool to export points of occurrence layers
     */
    angular.module('tool-export-sample-service', [])
        .factory("ToolExportSampleService", ["$http", "$q", "MapService", "LayersService", "BiocacheService", function ($http, $q, MapService, LayersService, BiocacheService) {
            return {

                // Override text with view-config.json
                spec: {
                    "input": [
                        {
                            "name": "area",
                            "description": "Select area.",
                            "type": "area",
                            "constraints": {
                                "min": 1,
                                "max": 1,
                                "optional": false,
                                "defaultAreas": true
                            }
                        },
                        {
                            "name": "species",
                            "description": "Select species.",
                            "type": "species",
                            "constraints": {
                                "min": 1,
                                "max": 1,
                                "optional": false,
                                "spatialValidity": true,
                                "areaIncludes": false
                            }
                        },
                        {
                            "name": "layers",
                            "description": "Select layers.",
                            "type": "layer",
                            "constraints": {
                                "min": 1,
                                "optional": true
                            }
                        }
                    ],
                    "description": "Export points."
                },

                execute: function (inputs) {
                    var area = inputs[0];
                    var species = inputs[1];
                    var layers = inputs[2];

                    return BiocacheService.newLayer(species, area[0], '').then(function (query) {
                        //include redirect to biocache-service/occurrences/search page
                        var sampleUrl = species.ws + '/download/options1?searchParams=' +
                            encodeURIComponent('q=' + query.qid) +
                            "&targetUri=/occurrences/search%3F&downloadType=records";

                        if (layers && (layers.length > 0)) {
                            var layers = '';
                            var layerNames = '';
                            $.map(layers,
                                function (v, k) {
                                    layers += (layers.length > 0 ? ',' : '') + v.id;
                                    layerNames += (layerNames.length > 0 ? ',' : '') + v.name;
                                });
                            sampleUrl += '&layers=' + layers + '&customHeader' + encodeURIComponent(layerNames) +
                                "&layersServiceUrl=" + encodeURIComponent($SH.layersServiceUrl);
                        }

                        return $q.when({output: {0: {openUrl: sampleUrl}}});
                    });
                }
            };
        }])
}(angular));
