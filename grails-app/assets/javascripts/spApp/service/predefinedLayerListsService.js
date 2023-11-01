(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name PredefinedLayerListsService
     * @description
     *   List of predefined layer lists
     */
    angular.module('predefined-layer-lists-service', [])
        .factory("PredefinedLayerListsService", [function () {
            return {
                // TODO: fetch from external config
                getList: function () {
                    return [
                        {
                            label: "BIOCLIM 1960 best 5",
                            value: "el882,el889,el887,el894,el865"
                        }
                    ]
                }
            }
        }])
}(angular));
