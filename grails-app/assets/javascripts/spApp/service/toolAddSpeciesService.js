(function (angular) {
    'use strict';
    angular.module('tool-add-species-service', [])
        .factory("ToolAddSpeciesService", ["$http", "$q", "MapService", "BiocacheService",
            function ($http, $q, MapService, BiocacheService) {
            return {
                spec: {
                    "input": [
                        {
                            "description": "Select species.",
                            "type": "species",
                            "constraints": {
                                "min": 1,
                                "max": 1,
                                "optional": false,
                                "spatialValidity": true,
                                "areaIncludes": false,
                                "speciesOption": "searchSpecies"
                            },
                        },
                        {
                            "description": "Include related areas.",
                            "type": "speciesOptions",
                            "constraints": {
                                "optional": true,
                                "spatialValidity": false,
                                "areaIncludes": true
                            },
                        },
                        {
                            "description": "Restrict to an area.",
                            "type": "area",
                            "constraints": {
                                "min": 1,
                                "max": 1,
                                "defaultToWorld": true
                            }
                        }],
                        "description": "Add a species layer to the map"
                    },

                execute: function (inputs) {
                    var newName = inputs[0].name;

                    //append area to the species layer name
                    if (inputs[2][0].name !== undefined)
                        newName += ' (' + inputs[2][0].name + ')';

                    //geospatial_kosher if part of inputs[1] instead of inputs[0]
                    // var includeTrue = inputs[1].spatiallyValid;
                    // var includeFalse = inputs[1].spatiallySuspect;
                    // var gs = ["-*:*"];
                    // if (includeTrue && !includeFalse) {
                    //     gs = ["geospatial_kosher:true"]
                    // } else if (!includeTrue && includeFalse) {
                    //     gs = ["geospatial_kosher:false"]
                    // } else if (includeTrue && includeFalse) {
                    //     gs = ["geospatial_kosher:*"]
                    // }
                    // inputs[0].q = inputs[0].q.concat(gs);

                    return BiocacheService.newLayer(inputs[0], inputs[2], newName).then(function (data) {
                        data.includeAnimalMovement = inputs[1].includeAnimalMovement;
                        data.includeChecklists = inputs[1].includeChecklists;
                        data.includeExpertDistributions = inputs[1].includeExpertDistributions;

                        return MapService.add(data).then(function() {
                            return true;
                        })
                    });
                }
            };
        }])
}(angular));
