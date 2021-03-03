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
                            "description": "Select area",
                            "type": "area",
                            "constraints": {
                                "min": 1,
                                "max": 1,
                                "optional": false,
                                "defaultToWorld": true
                            }
                        },
                        {
                            "description": "Species options",
                            "type": "speciesOptions",
                            "constraints": {
                                "min": 1,
                                "optional": false,
                                "absentOption": true
                            }
                        },
                        {
                            "description": "Select facet",
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
                    var q = facet;
                    if (speciesOptions.spatiallyUnknown) {
                        if (speciesOptions.spatiallyValid && speciesOptions.spatiallySuspect) { /* do nothing */
                        } else if (speciesOptions.spatiallyValid) q.push('-geospatial_kosher:false');
                        else if (speciesOptions.spatiallySuspect) q.push('-geospatial_kosher:true');
                    } else {
                        if (speciesOptions.spatiallyValid && speciesOptions.spatiallySuspect) q.push('geospatial_kosher:*');
                        else if (speciesOptions.spatiallyValid) q.push('geospatial_kosher:true');
                        else if (speciesOptions.spatiallySuspect) q.push('geospatial_kosher:false');
                    }

                    if (!speciesOptions.includeAbsences) {
                        q.push($SH.fqExcludeAbsent)
                    }

                    var newName = $i18n(127, "Facet");

                    //Guess name from facet Genuse:"Cractus" OR Genuse:"xxxxxx"
                    try {
                        if (facet.length == 1) {
                            var classes = facet[0].split("OR");
                            var classesname = [];
                            for (var i in classes) {
                                classesname.push(classes[0].split(":")[1].replace(/['"]+/g, ''))
                            }
                            newName += ' (' + classesname.join('/') + ')'
                        } else {
                            var fields = []
                            $.each(facet, function (i, v) {
                                if (fields.length > 0) fields += ', '
                                fields += facet.split(":")[0].replace(/['"]+/g, '')
                            })
                            newName += ' (' + fields + ')'
                        }
                    } catch (e) {
                        if (area.name !== undefined) newName += ' (' + area.name + ')'; //in case
                    }

                    return BiocacheService.newLayer({
                        q: q,
                        bs: $SH.biocacheServiceUrl,
                        ws: $SH.biocacheUrl
                    }, area, newName).then(function (data) {
                        if (data == null) {
                            return $q.when(false)
                        } else {
                            data.log = false
                            return MapService.add(data).then(function () {
                                return true
                            })
                        }
                    });
                }
            };
        }])
}(angular));
