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
                    //We only allow to download this first area at the current stage
                    console.log('Warning: We only download the first selected area at this momonet!');
                    var areas = inputs[0];
                    var downloadingArea = areas[0];
                    var pid = downloadingArea.pid;
                    var name = downloadingArea.name;
                    var url = LayersService.getAreaDownloadUrl(pid, inputs[1].toLowerCase(), name);
                    Util.download(url);
                }
            };
        }])
}(angular));
