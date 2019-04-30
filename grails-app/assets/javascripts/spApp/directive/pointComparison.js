(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name pointComparison
     * @description
     *   Panel for map location selection and display spatial-service layer intersections
     */
    angular.module('point-comparison-directive', ['map-service', 'layers-service', 'predefined-areas-service'])
        .directive('pointComparison', ['$rootScope', 'MapService', '$timeout', 'LayersService', 'LayoutService',
            'PredefinedAreasService', 'LoggerService', "$http", '$filter',
            function ($rootScope, MapService, $timeout, LayersService, LayoutService, PredefinedAreasService, LoggerService, $http, $filter) {
                var _httpDescription = function (method, httpconfig) {
                    if (httpconfig === undefined) {
                        httpconfig = {};
                    }
                    httpconfig.service = 'PointComparison';
                    httpconfig.method = method;

                    return httpconfig;
                };

                return {
                    scope: {},
                    templateUrl: '/spApp/pointComparisonContent.htm',
                    link: function (scope, iElement, iAttrs) {

                        scope.points = [];
                        scope.comparison = [];

                        scope.header = [];
                        scope.searchText = {name: ''};

                        scope.exportUrl = null;
                        scope.csv = null;

                        scope.statusUrl = null;

                        scope.placingMarker = false;

                        scope.searching = false;

                        scope.cancel = function () {
                            scope.deleteDrawing();

                            LayoutService.closePanel()
                        };

                        scope.update = function () {
                            scope.deleteDrawing();
                            MapService.leafletScope.addPointsToMap(scope.points)
                        };

                        scope.remove = function (idx) {
                            scope.points.splice(idx, 1);
                            scope.update()
                        };

                        scope.addMarker = function () {
                            scope.placingMarker = true;
                            $('.leaflet-draw-draw-marker')[0].click();
                        };

                        scope.stopDrawing = function () {
                            scope.placingMarker = false;
                            var a = $('.leaflet-draw-actions a');
                            for (var i = 0; i < a.length; i++) {
                                if (a[i].title === $i18n("Cancel drawing")) {
                                    a[i].click()
                                }
                            }
                        };

                        scope.deleteDrawing = function () {
                            scope.stopDrawing();

                            MapService.leafletScope.deleteDrawing()
                        };

                        scope.compare = function () {

                            scope.searching = true;

                            var points = '';
                            $.map(scope.points, function (p) {
                                if (points.length > 0)
                                    points = points + ",";
                                points = points + p[2] + ',' + p[1];
                            });

                            var fids = '';
                            LayersService.getLayers().then(function (response) {
                                $.map(response.data, function (field) {
                                    if (fids.length > 0)
                                        fids = fids + ',';
                                    fids = fids + field.id;
                                });

                                //sample
                                scope.statusUrl = $SH.samplingUrl + "/intersect/batch?points=" + points + "&fids=" + fids;

                                scope.checkStatus();
                            });
                        };

                        scope.checkStatus = function () {
                            $http.get(scope.statusUrl, _httpDescription('checkStatus')).then(function (response) {
                                if (response.status === 200) {
                                    scope.status = response.data.status;
                                    if (response.data.statusUrl) {
                                        scope.statusUrl = response.data.statusUrl
                                        $timeout(scope.checkStatus(), 2000)
                                    } else if (response.data.downloadUrl) {
                                        LoggerService.log("View", "pointComparison", {points: scope.points})
                                        $http.get($SH.baseUrl + '/portal/getSampleCSV?url=' + encodeURIComponent(response.data.downloadUrl), _httpDescription('getCsv')).then(function (response) {
                                            if (scope.comparison.length > 0)
                                                scope.comparison.splice(0, scope.comparison.length);

                                            var csv = $.csv.toArrays(response.data);

                                            scope.header = [];
                                            $.map(csv, function (row) {
                                                scope.header.push(row[0] + ' ' + row[1])
                                            });

                                            for (var i = 2; i < csv[0].length; i++) {
                                                var row = [Messages.get('facet.' + csv[0][i], csv[0][i])];
                                                for (var j = 1; j < csv.length; j++) {
                                                    row.push(csv[j][i]);
                                                }
                                                scope.comparison.push(row);
                                            }

                                            var blob = new Blob([$.csv.fromArrays([scope.header]) +
                                            $.csv.fromArrays(scope.comparison)], {type: 'text/plain'});
                                            scope.exportUrl = (window.URL || window.webkitURL).createObjectURL(blob);

                                            scope.searching = false;

                                            $timeout(function () {
                                                $(window).trigger("resize");
                                            }, 0);
                                        });
                                    } else {
                                        $timeout(scope.checkStatus(), 2000)
                                    }
                                } else {
                                    $timeout(scope.checkStatus(), 2000)
                                }
                            }, function (err) {
                                $timeout(scope.checkStatus(), 2000)
                            });
                        };

                        $rootScope.$on('setWkt', function (event, data) {
                            if (data[0] === 'point') {
                                //points must be layer intersected
                                data[1] = parseFloat(data[1]).toFixed(3);
                                data[2] = parseFloat(data[2]).toFixed(3);

                                scope.points.push(data);
                                scope.update();
                            }
                        });

                        scope.addMarker();
                    }
                }
            }])
}(angular));