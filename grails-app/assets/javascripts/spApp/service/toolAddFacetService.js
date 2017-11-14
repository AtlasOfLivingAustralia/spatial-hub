(function (angular) {
    'use strict';
    angular.module('tool-add-facet-service', [])
        .factory("ToolAddFacetService", ["$http", "$q", "MapService", "LayersService", "BiocacheService", function ($http, $q, MapService, LayersService, BiocacheService) {
            return {
                spec: {
                    "input": [
                        {
                            "description": "Select area.",
                            "type": "area",
                            "constraints": {
                                "min": 1,
                                "max": 1,
                                "optional": false
                            }
                        },
                        {
                            "description": "Species options.",
                            "type": "speciesOptions",
                            "constraints": {
                                "optional": true
                            }
                        },
                        {
                            "description": "Select facet.",
                            "type": "facet",
                            "constraints": {
                                "min": 1,
                                "max": 1,
                                "optional": false
                            }
                        }],
                        "description": "Add species using a facet."
                    },

                execute: function (inputs) {
                    var area = inputs[0][0];
                    var speciesOptions = inputs[1];
                    var facet = inputs[2];
                    var q = [facet];
                    if (speciesOptions.spatiallyValid && speciesOptions.spatiallySuspect) q.push('geospatial_kosher:*');
                    else if (speciesOptions.spatiallyValid) q.push('geospatial_kosher:true');
                    else if (speciesOptions.spatiallySuspect) q.push('geospatial_kosher:false');
                    var newName = "Facet";
                    if (area.name !== undefined) newName += ' (' + area.name + ')';
                    return BiocacheService.newLayer({
                        q: q,
                        bs: $SH.biocacheServiceUrl,
                        ws: $SH.biocacheUrl
                    }, area, newName).then(function (data) {
                        return MapService.add(data).then(function () {
                            return true
                        })
                    });
                }
            };
        }])
}(angular));
