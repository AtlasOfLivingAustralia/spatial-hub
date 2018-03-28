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

                        //change inputs
                        // if  inputs[0].q array  lsid: or species_list :   enable 'next'
                        // else
                        //     disable
                        if (specs) {
                            specs.input[1].constraints.disable = !this.checkAreaCompatible(inputs[0].q);
                        }
                    },

                    checkAreaCompatible: function (q) {
                        //change inputs
                        // if  inputs[0].q array  lsid: or species_list :   enable 'next'
                        // else
                        //     disable
                        var enableArea = false;
                        if (q !== undefined) {
                            enableArea = (q.length === 0);
                            for (var i = 0; i < q.length; i++) {
                                if (q[i].indexOf("lsid:") > -1 || q[i].indexOf("species_list:") > -1) {
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
                        //Check if areas is compatible
                        inputs[1].enabled = this.checkAreaCompatible(inputs[0].q);

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
                            if (inputs[1].enabled) {
                                data.includeAnimalMovement = inputs[1].includeAnimalMovement;
                                data.includeChecklists = inputs[1].includeChecklists;
                                data.includeExpertDistributions = inputs[1].includeExpertDistributions;
                            }
                            return MapService.add(data).then(function() {
                                return true;
                            })
                        });
                    }
                };
            }])
}(angular));
