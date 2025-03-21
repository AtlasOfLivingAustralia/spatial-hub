(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name nearestLocality
     * @description
     *   Panel for map location selection and display of nearest gazetteer points
     */
    angular.module('nearest-locality-directive', ['map-service', 'layers-service', 'predefined-areas-service'])
        .directive('nearestLocality', ['$rootScope', 'MapService', '$timeout', 'LayersService', 'LayoutService',
            'PredefinedAreasService', "$http", '$filter', 'LoggerService',
            function ($rootScope, MapService, $timeout, LayersService, LayoutService, PredefinedAreasService, $http, $filter, LoggerService) {
                var _httpDescription = function (method, httpconfig) {
                    if (httpconfig === undefined) {
                        httpconfig = {};
                    }
                    httpconfig.service = 'NearestLocality';
                    httpconfig.method = method;

                    return httpconfig;
                };

                return {
                    scope: {
                        _config: '=config'
                    },
                    templateUrl: '/spApp/nearestLocalityContent.htm',
                    link: function (scope, iElement, iAttrs) {
                        scope.name = 'nearestLocalityCtrl';
                        scope.searching = false;

                        scope.point = {
                            longitude: 0,
                            latitude: 0
                        };

                        scope.defaultLabel = $i18n(380, "Click on the map to set the point.");

                        scope.pointLabel = scope.defaultLabel;

                        scope.enableDrawing = function () {
                            scope.pointLabel = scope.defaultLabel;
                            scope.points = [];

                            if (scope.deleteDrawing) {
                                scope.deleteDrawing()
                            }

                            scope.addMarker()
                        };

                        scope.points = [];

                        scope.cancel = function () {
                            scope.deleteDrawing();

                            LayoutService.closePanel()
                        };

                        scope.ok = function (data) {
                            scope.deleteDrawing();

                            LayoutService.closePanel()
                        };

                        scope.showWkt = function () {
                            //validate wkt

                            //display wkt
                            MapService.leafletScope.addPointsToMap(scope.points)
                        };

                        scope.addMarker = function () {
                            $('.leaflet-draw-draw-marker')[0].click();
                        };

                        scope.stopDrawing = function () {
                            var a = $('.leaflet-draw-actions a');
                            for (var i = 0; i < a.length; i++) {
                                if (a[i].title === $i18n(379, "Cancel drawing")) {
                                    a[i].click()
                                }
                            }
                        };

                        scope.deleteDrawing = function () {
                            scope.stopDrawing();

                            MapService.leafletScope.deleteDrawing()
                        };

                        scope.zoom = function () {
                            var minLat, maxLat, minLng, maxLng;
                            for (var i = 0; i < scope.points.length; i++) {
                                var point = wellknown.parse(scope.points[i].geometry);
                                var lat = point.coordinates[1];
                                var lng = point.coordinates[0];
                                if (i == 0 || minLat > lat) minLat = lat;
                                if (i == 0 || maxLat < lat) maxLat = lat;
                                if (i == 0 || minLng > lng) minLng = lng;
                                if (i == 0 || maxLng < lng) maxLng = lng;
                            }
                            MapService.zoomToExtents([[minLat, minLng], [maxLat, maxLng]])
                        };

                        scope.intersectPoint = function () {
                            var url = $SH.layersServiceUrl + "/objects/" + $SH.gazField + "/" +
                                scope.point.latitude + "/" + scope.point.longitude + "?limit=10";

                            scope.pointLabel = '';
                            scope.searching = true;

                            $timeout(function () {
                                $(window).trigger("resize");
                            }, 0);

                            $http.get(url, _httpDescription('search')).then(function (response) {
                                scope.points = response.data;
                                scope.showWkt();
                                scope.searching = false;

                                var rows = "";
                                for (var i = 0; i < scope.points.length; i++) {
                                    var p = scope.points[i];
                                    rows += "\n\"" + p.name.replace("\"", "\\\"") + "\"," + p.geometry + "," + p.distance + "," + p.degrees
                                }

                                var header = $i18n(409, "Longitude") + "," + scope.point.longitude + "\n" +
                                    $i18n(410, "Latitude") + "," + scope.point.latitude + "\n\n" +
                                    $i18n(160, "Feature") + "," + $i18n(161, "Location") + "," + $i18n(162, "Distance (m)") + "," + $i18n(163, "Heading (deg)");
                                var blob = new Blob([header + rows], {type: 'text/plain'});
                                scope.exportUrl = (window.URL || window.webkitURL).createObjectURL(blob);

                                $timeout(function () {
                                    $(window).trigger("resize");
                                }, 0);

                                LoggerService.log("View", "nearestLocality", {
                                    gazField: $SH.gazField,
                                    longitude: scope.point.longitude,
                                    latitude: scope.point.latitude
                                })
                            }, function (response) {
                                scope.searching = false;
                                scope.pointLabel = $i18n(337, "Error")
                            });
                        }

                        $rootScope.$on('setWkt', function (event, data) {
                            if (data[0] === 'point') {
                                //points must be layer intersected
                                scope.point.longitude = data[1];
                                scope.point.latitude = data[2];

                                scope.intersectPoint()
                            }
                        })

                        /* init */
                        //check if a point has been set
                        //Init panel if no point yet
                        if (!scope._config || !scope._config.longitude) {
                            $timeout(function () {
                                scope.enableDrawing()
                            }, 0);
                        } else {
                            scope.point.longitude = scope._config.longitude
                            scope.point.latitude = scope._config.latitude

                            scope.intersectPoint()
                        }
                    }
                }
            }])
}(angular));
