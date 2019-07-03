(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name ToolAddSpeciesService
     * @description
     *   Client side tool to add occurrence layers to the map
     */
    angular.module('tool-add-species-service', [])
        .factory("ToolAddSpeciesService", ["$http", "$q", "MapService", "BiocacheService",
            function ($http, $q, MapService, BiocacheService) {
                return {

                    // Override text with view-config.json
                    spec: {
                        "input": [
                            {
                                "name": "species",
                                "description": "Select species.",
                                "type": "species",
                                "constraints": {
                                    "min": 1,
                                    "max": 1,
                                    "optional": false,
                                    "spatialValidity": true,
                                    "areaIncludes": false,
                                    "speciesOption": "searchSpecies"
                                }
                            },
                            {
                                "name": "speciesOptions",
                                "description": "Include related areas.",
                                "type": "speciesOptions",
                                "constraints": {
                                    "optional": true,
                                    "spatialValidity": false,
                                    "areaIncludes": true,
                                    "disable": false
                                }
                            },
                            {
                                "name": "area",
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


                    refresh: function (inputs, specs) {
                        if (specs) {
                            for (k in specs.injectDateRangeInput) {
                                if (specs.input[k].name === "speciesOptions") {
                                    specs.input[k].constraints.disable = !this.checkAreaCompatible(inputs[0].q);
                                }
                            }
                        }
                    },

                    checkAreaCompatible: function (q) {
                        var enableArea = false;
                        if (q !== undefined) {
                            enableArea = (q.length === 0);
                            for (var i = 0; i < q.length; i++) {
                                if (q[i].indexOf("lsid:") === 0) {
                                    enableArea = true;
                                    break;
                                }
                            }
                        }
                        return enableArea
                    },

                    execute: function (inputs) {
                        var newName = inputs[0].name;
                        //append area to the species layer name
                        if (inputs[2][0].name !== undefined)
                            newName += ' (' + inputs[2][0].name + ')';

                        newName = MapService.nextLayerName(newName);

                        //Check if areas is compatible
                        inputs[1].enabled = this.checkAreaCompatible(inputs[0].q);

                        return BiocacheService.newLayer(inputs[0], inputs[2], newName).then(function (data) {
                            if (inputs[1].enabled) {
                                data.includeAnimalMovement = inputs[1].includeAnimalMovement;
                                data.includeChecklists = inputs[1].includeChecklists;
                                data.includeExpertDistributions = inputs[1].includeExpertDistributions;
                            }
                            if (inputs[0].species_list) {
                                data.species_list = inputs[0].species_list;
                            }
                            return MapService.add(data).then(function () {
                                return true;
                            })
                        });
                    }
                };
            }])
}(angular));
