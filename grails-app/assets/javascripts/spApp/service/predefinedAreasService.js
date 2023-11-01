(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name PredefinedAreasService
     * @description
     *   List of general predefined areas
     */
    angular.module('predefined-areas-service', ['map-service'])
        .factory("PredefinedAreasService", ['MapService', function (MapService) {
            return {
                /**
                 * Get default areas. Includes 'current map extent' area.
                 *
                 * @returns {Array.<area>} list of default areas.
                 */
                getList: function (excludeWorld) {
                    var extents = MapService.getExtents();

                    var defaultAreas = [];

                    for (var i in $SH.defaultAreas) {
                        if ($SH.defaultAreas.hasOwnProperty(i) && (!excludeWorld || $SH.defaultAreas[i].name != 'World')) {
                            var area = $SH.defaultAreas[i];
                            var geoArea = undefined
                            if (area.areaSqKm) {
                                geoArea = area.areaSqKm
                            } else if (area.wkt && area.wkt.length > 0) {
                                geoArea = LGeo.area(wellknown.parse(area.wkt))
                            }

                            defaultAreas.push(MapService.newArea($i18n(area.name),
                                area.fqs,
                                area.wkt,
                                geoArea,
                                area.bbox))
                        }
                    }

                    return [
                        MapService.newArea($i18n(16, "Current extent"),
                            ["longitude:[" + extents[0] + " TO " + extents[2] + "]", "latitude:[" + extents[1] + " TO " + extents[3] + "]"],
                            'POLYGON((' + extents[0] + ' ' + extents[3] + ',' + extents[0] + ' ' + extents[1] + ',' +
                            extents[2] + ' ' + extents[1] + ',' + extents[2] + ' ' + extents[3] + ',' +
                            extents[0] + ' ' + extents[3] + '))',
                            LGeo.area(wellknown.parse('POLYGON((' + extents[0] + ' ' + extents[1] + ',' + extents[0] + ' ' + extents[3] + ',' +
                                extents[2] + ' ' + extents[3] + ',' + extents[2] + ' ' + extents[1] + ',' +
                                extents[0] + ' ' + extents[1] + '))')) / 1000000,
                            [extents[0], extents[1], extents[2], extents[3]])
                    ].concat(defaultAreas)
                }
            }

        }])
}(angular));
