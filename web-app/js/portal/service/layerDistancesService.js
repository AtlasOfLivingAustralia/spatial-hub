(function (angular) {
    'use strict';
    angular.module('layer-distances-service', [])
        .factory('LayerDistancesService', ['gLayerDistances', function (gLayerDistances) {
            var distances = gLayerDistances

            return {
                getDistance: function (layer1, layer2) {
                    var key = layer1 < layer2 ? layer1 + " " + layer2 : layer2 + " " + layer1
                    return distances[key]
                }
            };
        }])
}(angular));
