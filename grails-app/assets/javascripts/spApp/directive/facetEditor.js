(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name spLegend
     * @description
     *    Panel displaying selected map layer information and controls
     */
    angular.module('facet-editor-directive', ['map-service', 'biocache-service', 'layers-service', 'popup-service'])
        .directive('facetEditor', ['$timeout', '$q', '$filter', 'MapService', 'BiocacheService', 'LayersService', 'ColourService', '$http', 'LayoutService', 'PopupService', 'LoggerService',
            function ($timeout, $q, $filter, MapService, BiocacheService, LayersService, ColourService, $http, LayoutService, PopupService, LoggerService) {

                var _httpDescription = function (method, httpconfig) {
                    if (httpconfig === undefined) {
                        httpconfig = {};
                    }
                    httpconfig.service = 'facetEditor';
                    httpconfig.method = method;

                    return httpconfig;
                };

                return {
                    scope: {
                        _onCustom: "&onCustom",
                        _facet: "=facet"
                    },
                    templateUrl: '/spApp/facetEditorContent.htm',
                    link: function (scope, element, attrs) {
                        var labelLength = 10,
                            lineHeight = 20,
                            chartData = scope._facet.data || [],
                            tableFacetDisplay = 'table',
                            chartFacetDisplay = 'chart',
                            defaultFacetDisplay = tableFacetDisplay,
                            showChartForDataTypes = ['tint', 'int', 'tdouble', 'tfloat', 'tdate'],
                            filterFieldName = 'displayname';
                        scope.baseUrl = $SH.baseUrl; // for image icons
                        scope.$i18n = $i18n;
                        if (scope._facet.filter === undefined) scope._facet.filter = '';
                        if (scope._facet.fq === undefined) scope._facet.fq = [];
                        if (scope._facet.sortType === undefined) scope._facet.sortType = 'count';
                        if (scope._facet.sortReverse === undefined) scope._facet.sortReverse = true;
                        if (scope._facet.isAllFacetsSelected === undefined) scope._facet.isAllFacetsSelected = false;
                        if (scope.chart === undefined) scope.chart = {colours: [], data: [], labels: [], datasets: {}};
                        if (scope.slider === undefined) scope.slider = {values: [0, 1], min: 0, max: 1, active: false};
                        if (scope.height === undefined) scope.height = 50;

                        scope.showTableOrChart = function () {
                            if (showChartForDataTypes.indexOf(scope._facet.dataType) >= 0)
                                scope.facetDisplay = chartFacetDisplay;
                            else
                                scope.facetDisplay = defaultFacetDisplay;
                        };

                        scope.updateChartData = function () {
                            scope.chart.data.length = 0;
                            scope.chart.labels.length = 0;
                            chartData = $filter('filter')(scope._facet.data, scope._facet.filter, null, filterFieldName);
                            chartData = $filter('orderBy')(chartData, scope._facet.sortType, scope._facet.sortReverse);
                        };

                        scope.updateChartHeight = function () {
                            if (chartData && chartData.length) {
                                var height = chartData.length * lineHeight;
                                scope.height = height;
                            }
                        };

                        scope.drawChart = function () {
                            if (scope._facet.data) {
                                scope.updateChartData();
                                scope.updateChartColour();
                                Util.convertFacetDataToChartJSFormat(chartData, scope.chart);
                                scope.updateSliderConfig();
                                scope.updateChartHeight();
                            }
                        };

                        scope.updateChartColour = function () {
                            Util.getBorderColour(chartData, scope.datasetOverride.borderColor);
                            Util.getBarColour(chartData, scope.chart.colours, scope.formatColor);
                        };

                        scope.chartClick = function (elements, event, element) {
                            scope.setSliderInactive();

                            elements && elements.forEach(function (elem) {
                                chartData[elem._index].selected = !chartData[elem._index].selected
                            });

                            scope.updateSelection();
                        };

                        scope.selectClassesInRange = function () {
                            scope.facetClearSelection();
                            var max = scope.slider.max - scope.slider.values[0],
                                min = scope.slider.max - scope.slider.values[1];

                            for (var i = min; i <= max; i++) {
                                chartData[i].selected = true;
                            }

                            scope.updateSelection();
                        };

                        scope.updateSliderConfig = function () {
                            var data = chartData || scope._facet.data;
                            if (data && data.length) {
                                scope.slider.values[1] = scope.slider.max = data.length - 1;
                                scope.slider.values[0] = scope.slider.max - 1;
                                if (scope.slider.values[0] < 0)
                                    scope.slider.values[0] = 0;
                            } else {
                                scope.slider.values[1] = scope.slider.max = 1;
                                scope.slider.values[0] = scope.slider.min = 0;
                            }
                        };

                        scope.setSliderState = function (state) {
                            scope.slider.active = !!state;
                        };

                        scope.setSliderActive = function () {
                            scope.setSliderState(true);
                        };

                        scope.setSliderInactive = function () {
                            scope.setSliderState(false);
                        };

                        scope.setSliderInactiveAndRedrawChart = function () {
                            scope.setSliderInactive();
                            scope.drawChart();
                        };

                        scope.info = function (item) {
                            bootbox.alert($i18n(397, "Metadata url") + ': <a href="' + item.url + '">' + item.url + '</a>')
                        };

                        scope.zoom = function (item) {
                            MapService.leafletScope.zoom(item.bbox)
                        };

                        scope.facetClearSelection = function () {
                            if (scope._facet !== undefined) {
                                for (var i = 0; i < scope._facet.data.length; i++) {
                                    scope._facet.data[i].selected = false
                                }
                                scope.updateSelection()
                            }
                        };

                        scope.checkAllFacets = function () {
                            if (scope._facet.isAllFacetsSelected) {
                                scope.facetSelectAll()
                            } else {
                                scope.facetClearSelection()
                            }
                        }

                        scope.facetSelectAll = function () {
                            if (scope._facet !== undefined) {
                                for (var i = 0; i < scope._facet.data.length; i++) {
                                    scope._facet.data[i].selected = true
                                }
                                scope.updateSelection()
                            }
                        };

                        scope.ifAllFacetsSelected = function () {
                            if (scope._facet !== undefined) {
                                for (var i = 0; i < scope._facet.data.length; i++) {
                                    if (!scope._facet.data[i].selected) {
                                        return false;
                                    }
                                }
                                return true;
                            }
                            return false;
                        }

                        scope.updateSelection = function () {
                            scope._onCustom();
                            scope.updateChartColour();
                            scope.updateCount();
                        };

                        scope.updateCount = function () {
                            if (scope._facet.data !== undefined) {
                                var count = 0;
                                for (var i = 0; i < scope._facet.data.length; i++) {
                                    if (scope._facet.data[i].selected) {
                                        count += scope._facet.data[i].count;
                                    }
                                }
                                scope.selectionCount = count
                            } else {
                                scope.selectionCount = 0
                            }
                        }

                        scope.formatColor = function (item) {
                            var r = Number(item.red).toString(16);
                            if (r.length === 1) r = '0' + r;
                            var g = Number(item.green).toString(16);
                            if (g.length === 1) g = '0' + g;
                            var b = Number(item.blue).toString(16);
                            if (b.length === 1) b = '0' + b;
                            return r + g + b
                        }

                        // slider configuration
                        scope.sliderOptions = {
                            orientation: 'vertical',
                            range: true,
                            stop: scope.selectClassesInRange,
                            start: scope.setSliderActive
                        };

                        // chart configuration
                        scope.chartOptions = {
                            maintainAspectRatio: false,
                            animation: false,
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        callback: function (value) {
                                            return value ? value.substr(0, labelLength) : '';
                                        }
                                    }
                                }],
                                xAxes: [{
                                    position: 'top'
                                }]
                            },
                            tooltips: {
                                enabled: true,
                                mode: 'label',
                                callbacks: {
                                    title: function (tooltipItems, data) {
                                        var idx = tooltipItems[0].index;
                                        return data.labels[idx];
                                    },
                                    label: function (tooltipItem, data) {
                                        var idx = tooltipItem.index,
                                            label = data.datasets[0].data[idx];

                                        if (chartData[idx].selected)
                                            label += " " + $i18n(450);

                                        return label;
                                    }
                                }
                            }
                        };

                        // selected facets on chart are highlighted using border colour.
                        scope.datasetOverride = {
                            borderColor: []
                        };

                        scope.$watch('_facet.data', function () {
                            scope.setSliderInactiveAndRedrawChart();
                            scope.showTableOrChart();
                        });
                        scope.$watch('_facet.filter', scope.setSliderInactiveAndRedrawChart);

                        scope.showTableOrChart();
                        scope.updateCount()
                    }

                }

            }])
}(angular));