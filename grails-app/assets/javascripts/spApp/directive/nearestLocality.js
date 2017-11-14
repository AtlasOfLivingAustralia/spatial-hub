(function (angular) {
    'use strict';
    angular.module('nearest-locality-directive', ['map-service', 'layers-service', 'predefined-areas-service'])
        .directive('nearestLocality', ['$rootScope', 'MapService', '$timeout', 'LayersService', 'LayoutService',
            'PredefinedAreasService', "$http", '$filter',
            function ($rootScope, MapService, $timeout, LayersService, LayoutService, PredefinedAreasService, $http, $filter) {
                return {
                    scope: {},
                    templateUrl: '/spApp/nearestLocalityContent.htm',
                    link: function (scope, iElement, iAttrs) {
                        scope.name = 'nearestLocalityCtrl';
                        scope.searching = false;

                        scope.point = {
                            longitude: 0,
                            latitude: 0
                        };

                        scope.defaultLabel = 'Click on the map to set the point.';

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

                        $timeout(function () {
                            scope.enableDrawing()
                        }, 0);

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
                                if (a[i].title === 'Cancel drawing') {
                                    a[i].click()
                                }
                            }
                        };

                        scope.deleteDrawing = function () {
                            scope.stopDrawing();

                            MapService.leafletScope.deleteDrawing()
                        };

                        $rootScope.$on('setWkt', function (event, data) {
                            if (data[0] === 'point') {
                                //points must be layer intersected
                                scope.point.longitude = data[1];
                                scope.point.latitude = data[2];

                                var url = $SH.layersServiceUrl + "/objects/" + $SH.gazField + "/" +
                                    scope.point.latitude + "/" + scope.point.longitude + "?limit=10";

                                scope.pointLabel = '';
                                scope.searching = true;

                                $http.get(url).then(function (response) {
                                    scope.points = response.data;
                                    scope.showWkt();
                                    scope.searching = false;

                                    var rows = "";
                                    for (var i=0;i<scope.points.length;i++) {
                                        var p = scope.points[i];
                                        rows += "\n\"" + p.name.replace("\"", "\\\"") + "\"," + p.geometry + "," + p.distance + "," + p.degrees
                                    }

                                    var header = "Longitude," + scope.point.longitude + "\n" +
                                        "Latitude," + scope.point.latitude + "\n\n" +
                                        "Feature,Location,Distance (km),Heading (deg)";
                                    var blob = new Blob([header + rows], {type: 'text/plain'});
                                    scope.exportUrl = (window.URL || window.webkitURL).createObjectURL(blob);
                                }, function(response) {
                                    scope.searching = false;
                                    scope.pointLabel = "Error"
                                });
                            }
                        })
                    }
                }
            }])
}(angular));