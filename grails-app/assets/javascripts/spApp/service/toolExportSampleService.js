(function (angular) {
    'use strict';
    angular.module('tool-export-sample-service', [])
        .factory("ToolExportSampleService", ["$http", "$q", "MapService", "LayersService", "BiocacheService", function ($http, $q, MapService, LayersService, BiocacheService) {
            return {

                // Override text with view-config.json
                spec: {
                    "input": [
                        {
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
                        var sampleUrl = species.ws + '/download/options1?searchParams=' + encodeURIComponent('q=' + query.qid) + "&targetUri=/occurrences/search";

                        if (layers && (layers.length > 0)) {
                            var layers = '';
                            $.map(layers,
                                function (v, k) {
                                    layers = layers + (layers.length > 0 ? ',' : '') + v.id;
                                });
                            sampleUrl = sampleUrl + '&layers=' + layers;
                        }

                        return $q.when({ output: { openUrl: sampleUrl } });
                    });
                }
            };
        }])
}(angular));
