(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name ToolExportAreaService
     * @description
     *   Client side tool to export area layers
     */
    angular.module('tool-export-area-service', [])
        .factory("ToolExportAreaService", ["$http", "$q", "MapService", "LayersService", function ($http, $q, MapService, LayersService) {
            return {

                // Override text with view-config.json
                spec: {
                    "input": [
                        {
                            "description": "Select areas.",
                            "type": "area",
                            "constraints": {
                                "min": 1,
                                "max": 1,
                                "optional": false,
                                "defaultAreas": false
                            }
                        },
                        {
                            "description": "Filetype.",
                            "type": "list",
                            "constraints": {
                                "default": "Shapefile",
                                "selection": "single",
                                "content": [
                                    "Shapefile",
                                    "KML",
                                    "WKT"
                                ],
                                "optional": false
                            }

                        }],
                    "view": [
                        {
                            "name": "Select areas to export.",
                            "inputs": [
                                "area"
                            ]
                        },
                        {
                            "name": "Select filetype.",
                            "inputs": [
                                "layer"
                            ]
                        },
                        {
                            "name": "Number of groups and Shapefile generation",
                            "inputs": [
                                "groups",
                                "shp"
                            ]
                        }
                    ],
                    "description": "Export areas."
                },

                execute: function (inputs) {
                    var url = LayersService.getAreaDownloadUrl(inputs[0].pid, inputs[1], inputs[0].name);
                    Util.download(url);
                }
            };
        }])
}(angular));
