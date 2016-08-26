(function (angular) {
    'use strict';
    angular.module('sp-options-directive', ['map-service'])
        .directive('spOptions', ['$timeout', 'MapService', '$rootScope',
            function ($timeout, MapService, $rootScope) {

                return {
                    scope: {},
                    templateUrl: 'portal/optionsContent.html',
                    link: function (scope, element, attrs) {
                        scope.selection = {
                            name: "Outline"
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
                                key: 'google_satellite',
                                name: 'Satellite',
                                url: 'http://www.google.com/intl/en_au/help/terms_maps.html'
                            },
                            {
                                key: 'google_hybrid',
                                name: 'Hybrid',
                                url: 'http://www.google.com/intl/en_au/help/terms_maps.html'
                            },
                            {
                                key: 'google_roadmaps',
                                name: 'Streets',
                                url: 'http://www.google.com/intl/en_au/help/terms_maps.html'
                            }
                        ]

                        scope.info = function (url) {
                            $rootScope.openIframe(url, '', '')
                        }

                        scope.resetMap = function () {
                            MapService.resetMap()
                        }

                        scope.open = function (type) {
                            $rootScope.openModal(type)
                        }

                        scope.downloadMap = function () {

                        }

                        scope.addWMS = function () {

                        }

                        scope.select = function (key) {
                            MapService.leafletScope.setBaseMap(key)
                        }
                    }
                };

            }])
}(angular));