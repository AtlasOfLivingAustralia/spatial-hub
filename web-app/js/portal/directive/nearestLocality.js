(function (angular) {
    'use strict';
    angular.module('nearest-locality-directive', ['map-service', 'layers-service', 'predefined-areas-service'])
        .directive('nearestLocality', ['$rootScope', 'MapService', '$timeout', 'LayersService',
            'PredefinedAreasService', "$http",
            function ($rootScope, MapService, $timeout, LayersService, PredefinedAreasService, $http) {
                return {
                    scope: {},
                    templateUrl: 'portal/' + 'nearestLocalityContent.html',
                    link: function (scope, iElement, iAttrs) {
                        scope.name = 'nearestLocalityCtrl'

                        scope.enableDrawing = function () {
                            if (scope.deleteDrawing) {
                                scope.deleteDrawing()
                            }

                            scope.addMarker()
                        }

                        scope.points = []

                        $timeout(function () {
                            scope.enableDrawing()
                        }, 0)

                        scope.cancel = function () {
                            scope.deleteDrawing()

                            LayoutService.closePanel()
                        }

                        scope.ok = function (data) {
                            scope.deleteDrawing()

                            LayoutService.closePanel()
                        }

                        scope.showWkt = function () {
                            //validate wkt

                            //display wkt
                            MapService.leafletScope.addPointsToMap(scope.points)
                        }

                        scope.addMarker = function () {
                            $('.leaflet-draw-draw-marker')[0].click();
                        }

                        scope.stopDrawing = function () {
                            var a = $('.leaflet-draw-actions a')
                            for (var i = 0; i < a.length; i++) {
                                if (a[i].title === 'Cancel drawing') {
                                    a[i].click()
                                }
                            }
                        }

                        scope.deleteDrawing = function () {
                            scope.stopDrawing()

                            MapService.leafletScope.deleteDrawing()
                        }

                        scope.point = {
                            longitude: 0,
                            latitude: 0
                        }

                        $rootScope.$on('setWkt', function (event, data) {
                            if (data[0] === 'point') {
                                //points must be layer intersected
                                scope.point.longitude = data[1]
                                scope.point.latitude = data[2]

                                var url = "http://spatial.ala.org.au/ws/objects/" + SpatialPortalConfig.gazField + "/" +
                                    scope.point.latitude + "/" + scope.point.longitude + "?limit=10";

                                $http.get(url).then(function (response) {
                                    scope.points = response.data
                                    scope.showWkt()
                                });
                            }
                        })
                    }
                }
            }])
}(angular));