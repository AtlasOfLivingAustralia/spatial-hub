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
                            "description": $i18n(420),
                            "type": "area",
                            "constraints": {
                                "min": 1,
                                "max": 1,
                                "optional": false,
                                "defaultAreas": false
                            }
                        },
                        {
                            "description": $i18n(421),
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
                            "name": $i18n(422),
                            "inputs": [
                                "area"
                            ]
                        },
                        {
                            "name": $i18n(423),
                            "inputs": [
                                "layer"
                            ]
                        },
                        {
                            "name": $i18n(424),
                            "inputs": [
                                "groups",
                                "shp"
                            ]
                        }
                    ],
                    "description": $i18n(425)
                },

                execute: function (inputs) {
                    //We only allow to download this first area at the current stage
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
