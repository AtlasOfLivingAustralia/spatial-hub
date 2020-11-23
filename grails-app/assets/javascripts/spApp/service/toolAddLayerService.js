(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name ToolAddLayerService
     * @description
     *   Client side tool to add spatial-service layers to the map
     */
    angular.module('tool-add-layer-service', [])
        .factory("ToolAddLayerService", ["$http", "$q", "MapService", "LayersService", function ($http, $q, MapService, LayersService) {
            return {

                // Override text with view-config.json
                spec: {
                    "input": [
                        {
                            "description": $i18n(298),
                            "type": "layer",
                            "constraints": {
                                "min": 1,
                                "optional": false
                            }
                        }],
                    "description": $i18n(415)
                },

                execute: function (inputs) {
                    var promises = [];
                    for (var i = 0; i < inputs[0].length; i++) {
                        promises.push(MapService.add(LayersService.convertFieldIdToMapLayer(inputs[0][i])))
                    }
                    return $q.all(promises)
                }
            };
        }])
}(angular));
