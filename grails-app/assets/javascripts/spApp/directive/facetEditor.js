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
        .directive('facetEditor', ['$timeout', '$q', 'MapService', 'BiocacheService', 'LayersService', 'ColourService', '$http', 'LayoutService', 'PopupService', 'LoggerService',
            function ($timeout, $q, MapService, BiocacheService, LayersService, ColourService, $http, LayoutService, PopupService, LoggerService) {

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
                        scope.baseUrl = $SH.baseUrl; // for image icons

                        if (scope._facet.filter === undefined) scope._facet.filter = '';
                        if (scope._facet.fq === undefined) scope._facet.fq = [];
                        if (scope._facet.sortType === undefined) scope._facet.sortType = 'count';
                        if (scope._facet.sortReverse === undefined) scope._facet.sortReverse = true;
                        if (scope._facet.isAllFacetsSelected === undefined) scope._facet.isAllFacetsSelected = false;

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
                            scope.updateCount()
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

                        scope.updateCount()
                    }

                }

            }])
}(angular));