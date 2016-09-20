(function (angular) {
    'use strict';
    angular.module('sp-options-directive', ['map-service'])
        .directive('spOptions', ['$timeout', 'MapService', 'LayoutService',
            function ($timeout, MapService, LayoutService) {

                return {
                    scope: {},
                    templateUrl: 'portal/optionsContent.html',
                    link: function (scope, element, attrs) {
                        scope.selection = {
                            name: "google_roadmaps"
                        }

                        scope.baselayers = [
                            {
                                key: 'outline',
                                name: 'Outline',
                            },
                            {
                                key: 'osm',
                                name: 'Open Street Map',
                                link: 'http://www.openstreetmap.org/about'
                            },
                            {
                                key: 'google_roadmaps',
                                name: 'Streets',
                                url: 'http://www.google.com/intl/en_au/help/terms_maps.html'
                            },
                            {
                                key: 'google_hybrid',
                                name: 'Hybrid',
                                url: 'http://www.google.com/intl/en_au/help/terms_maps.html'
                            },
                            {
                                key: 'google_satellite',
                                name: 'Satellite',
                                url: 'http://www.google.com/intl/en_au/help/terms_maps.html'
                            }
                        ]

                        scope.info = function (url) {
                            LayoutService.openIframe(url, '', '')
                        }

                        scope.resetMap = function () {
                            //remove layers
                            MapService.removeAll()
                            
                            //set zoom
                            MapService.leafletScope.resetZoom()
                            
                            //set base layer
                            MapService.setBaseMap('google_roadmaps')

                            mapService.leafletScope.baseMap()
                        }

                        scope.open = function (type) {
                            LayoutService.openModal(type)
                        }

                        scope.downloadMap = function () {

                        }

                        scope.addWMS = function () {

                        }

                        scope.select = function (key) {
                            MapService.setBaseMap(key)
                        }
                    }
                };

            }])
}(angular));