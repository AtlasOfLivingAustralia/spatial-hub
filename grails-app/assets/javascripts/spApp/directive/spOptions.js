(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name spMenu
     * @description
     *    General map option controls
     */
    angular.module('sp-options-directive', ['map-service'])
        .directive('spOptions', ['$timeout', 'MapService', 'LayoutService',
            function ($timeout, MapService, LayoutService) {

                return {
                    scope: {},
                    templateUrl: '/spApp/optionsContent.htm',
                    link: function (scope, element, attrs) {
                        scope.projections = $SH.projections;
                        scope.projection = {code: $SH.projections[$SH.projection].definition.code};

                        scope.config = $SH.config;

                        scope.selection = {
                            name: $SH.defaultBaseLayer
                        };

                        scope.baselayers = [];
                        $.map($SH.baseLayers, function (v, k) {
                            scope.baselayers.push({
                                key: k,
                                name: v.name,
                                url: v.link,
                                projections: v.projections,
                                invalidProjections: v.invalidProjections
                            })
                        });

                        scope.info = function (url) {
                            LayoutService.openIframe(url, '', '')
                        };

                        scope.resetMap = function () {
                            bootbox.confirm("Reset to the default map?",
                                function (result) {
                                    if (result) {
                                        //remove layers
                                        MapService.removeAll();

                                        //close popup boxes
                                        $.each($('.close'), function (idx, item) {
                                            if (item.click instanceof Function) item.click()
                                        });
                                        $.each($('.leaflet-popup-close-button'), function (idx, item) {
                                            if (item.click instanceof Function) item.click()
                                        });

                                        //set zoom
                                        MapService.leafletScope.resetZoom();

                                        //set base layer
                                        MapService.setBaseMap($SH.defaultBaseLayer);
                                    }
                                }
                            );
                        };

                        scope.open = function (type) {
                            LayoutService.openModal(type)
                        };

                        scope.downloadMap = function () {
                            LayoutService.openModal('exportMap')
                        };

                        scope.addWMS = function () {
                            LayoutService.openModal('addWMS')
                        };

                        scope.select = function (key) {
                            MapService.setBaseMap(key)
                        };

                        scope.selectProjection = function (code) {
                            $SH.projection = code.replace("EPSG:", "");

                            // is the current base layer invalid for this projection?
                            if (!scope.isValidBaseLayerForProjection($SH.baseLayers[scope.selection.name])) {
                                // find a valid baselayer for this projection
                                for (var key in $SH.baseLayers) {
                                    if (scope.isValidBaseLayerForProjection($SH.baseLayers[key])) {
                                        scope.select(key)
                                    }
                                }
                            }

                            MapService.leafletScope.updateCRS();
                        };

                        scope.isValidBaseLayerForProjection = function (baselayer) {
                            return !((baselayer.projections && baselayer.projections.indexOf($SH.projection) < 0) ||
                                (baselayer.invalidProjections && baselayer.invalidProjections.indexOf($SH.projection) >= 0))
                        };

                        scope.showProjections = function () {
                            var count = 0;
                            for (k in $SH.projections) {
                                count++;
                            }
                            return count > 1;
                        }

                    }
                };

            }])
}(angular));