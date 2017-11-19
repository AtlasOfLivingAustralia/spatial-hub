(function (angular) {
    'use strict';
    angular.module('predefined-areas-service', ['map-service'])
        .factory("PredefinedAreasService", ['MapService', function (MapService) {
            return {
                // TODO: fetch from external config
                getList: function () {
                    var extents = MapService.getExtents();

                    return [
                        MapService.newArea($i18n("Current extent"),
                            ["longitude:[" + extents[0] + " TO " + extents[2] + "]", "latitude:[" + extents[1] + " TO " + extents[3] + "]"],
                            'POLYGON((' + extents[0] + ' ' + extents[1] + ',' + extents[0] + ' ' + extents[3] + ',' +
                            extents[2] + ' ' + extents[3] + ',' + extents[2] + ' ' + extents[1] + ',' +
                            extents[0] + ' ' + extents[1] + '))',
                            LGeo.area(wellknown.parse('POLYGON((' + extents[0] + ' ' + extents[1] + ',' + extents[0] + ' ' + extents[3] + ',' +
                                extents[2] + ' ' + extents[3] + ',' + extents[2] + ' ' + extents[1] + ',' +
                                extents[0] + ' ' + extents[1] + '))')) / 1000000,
                            [extents[0], extents[1], extents[2], extents[3]]),
                        MapService.newArea($i18n("Australia"),
                            ["longitude:[112 TO 154]", "latitude:[-44 TO -9]"],
                            "POLYGON((112.0 -44.0,154.0 -44.0,154.0 -9.0,112.0 -9.0,112.0 -44.0))",
                            16322156.76,
                            [112, -44, 154, -9]),
                        MapService.newArea($i18n("World"),
                            [], //["longitude:[-180 TO 180]","latitude:[-90 TO 90]"],
                            "POLYGON((-180 -90.0,-180.0 90.0,180.0 90.0,180 -90.0,-180 -90.0))",
                            510000000,
                            [-180, -90, 180, 90])
                    ]
                }
            }

        }])
}(angular));