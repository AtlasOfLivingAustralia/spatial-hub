(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name ToolAddFacetService
     * @description
     *   Client side tool to add occurrence facet layers to the map
     */
    angular.module('tool-add-facet-service', [])
        .factory("ToolAddFacetService", ["$http", "$q", "MapService", "LayersService", "BiocacheService", function ($http, $q, MapService, LayersService, BiocacheService) {
            return {

                // Override text with view-config.json
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
                    var newName = $i18n("Facet");
                    //if (area.name !== undefined) newName += ' (' + area.name + ')';
                    //Guess name from factet Genuse:"Cractus" OR Genuse:"xxxxxx"
                    var classes = facet.split("OR");
                    var classesname = []
                    for (var i in classes){
                        classesname.push(classes[0].split(":")[1].replace(/['"]+/g, ''))
                    }
                    newName += ' ('+classesname.join('/')+')'
                    // if (classes.length>1){
                    //     newName = facet;
                    // }else{
                    //     newName += ' ('+classes[0].split(":")[1].replace(/['"]+/g, '')+')'
                    // }

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
