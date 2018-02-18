(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name LayerDistancesService
     * @description
     *   Access to inter-layer association distances.
     */
    angular.module('layer-distances-service', [])
        .factory('LayerDistancesService', ['gLayerDistances', function (gLayerDistances) {
            var distances = gLayerDistances;

            return {
                /**
                 * Get the inter-association distance between two layers
                 * @memberof LayerDistancesService
                 * @param {string} layer1 fieldId of the first layer
                 * @param {string} layer2 fieldId of the second layer
                 * @returns {double} distance (0 - 1)
                 *
                 * @example
                 * Input:
                 * - layer1
                 *  "el1"
                 * - layer2
                 *  "el2"
                 *
                 * Output:
                 *  0.5
                 */
                getDistance: function (layer1, layer2) {
                    var key = layer1 < layer2 ? layer1 + " " + layer2 : layer2 + " " + layer1;
                    return distances[key]
                }
            };
        }])
}(angular));
