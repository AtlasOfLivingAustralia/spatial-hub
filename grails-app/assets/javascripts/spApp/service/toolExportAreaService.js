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
                            "description": $i18n(420,"Select areas."),
                            "type": "area",
                            "constraints": {
                                "min": 1,
                                "max": 1,
                                "optional": false,
                                "defaultAreas": false
                            }
                        },
                        {
                            "description": $i18n(421,"Filetype."),
                            "type": "list",
                            "constraints": {
                                "defaultValue": "Shapefile",
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
                            "name": $i18n(422,"Select areas to export."),
                            "inputs": [
                                "area"
                            ]
                        },
                        {
                            "name": $i18n(423,"Select filetype."),
                            "inputs": [
                                "layer"
                            ]
                        },
                        {
                            "name": $i18n(424,"Number of groups and Shapefile generation"),
                            "inputs": [
                                "groups",
                                "shp"
                            ]
                        }
                    ],
                    "description": $i18n(425,"Export areas.")
                },

                execute: function (inputs) {
                    //We only allow to download this first area at the current stage
                    var areas = inputs[0];
                    var downloadingArea = areas[0];

                    var pid = downloadingArea.pid;
                    var name = downloadingArea.name;
                    var url = LayersService.getAreaDownloadUrl(pid, inputs[1].toLowerCase(), name);
                    Util.download(url, name.replace('[^a-zA-Z0-9]', '_') + "." + inputs[1].toLowerCase());
                }
            };
        }])
}(angular));
