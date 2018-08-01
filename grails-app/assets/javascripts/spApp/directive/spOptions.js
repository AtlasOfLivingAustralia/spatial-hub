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
                        scope.selection = {
                            name: $SH.defaultBaseLayer
                        };

                        scope.baselayers = [];
                        $.map($SH.baseLayers, function (v, k) {
                            scope.baselayers.push({
                                key: k,
                                name: v.name,
                                url: v.link
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

                                        //set zoom
                                        MapService.leafletScope.resetZoom();

                                        //set base layer
                                        MapService.setBaseMap($SH.defaultBaseLayer);

                                        MapService.leafletScope.baseMap()
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
                        }
                    }
                };

            }])
}(angular));