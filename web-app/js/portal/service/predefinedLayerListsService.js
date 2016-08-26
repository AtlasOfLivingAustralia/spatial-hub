(function (angular) {
    'use strict';
    angular.module('predefined-layer-lists-service', [])
        .factory("PredefinedLayerListsService", [function () {
            return {
                getList: function () {
                    return [
                        {
                            label: "BIOCLIM 1960 best 5",
                            value: "el882,el889,el887,el894,el865"
                        },
                        {
                            label: "Williams 1960 best 5",
                            value: "el720,el726,el718,el766,el708"
                        },
                        {
                            label: "Williams 2030 best 5",
                            value: "el1002,el1019,el1037,el1036,el1013"
                        }
                    ]
                }
            }
        }])
}(angular));