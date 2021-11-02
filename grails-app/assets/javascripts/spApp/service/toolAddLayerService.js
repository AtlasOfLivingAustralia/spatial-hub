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
                            "description": $i18n(414,"Select layers."),
                            "type": "layer",
                            "constraints": {
                                "min": 1,
                                "optional": false
                            }
                        }],
                    "description": $i18n(415,"Add environmental and contextual layers to the map.")
                },

                execute: function (inputs) {
                    var promises = [];
                    for (var i = 0; i < inputs[0].length; i++) {
                        var item = LayersService.convertFieldIdToMapLayer(inputs[0][i])
                        item.log = false
                        promises.push(MapService.add(item))
                    }
                    return $q.all(promises)
                }
            };
        }])
}(angular));
