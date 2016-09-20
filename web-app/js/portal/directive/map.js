(function (angular) {
    'use strict';
    angular.module('sp-map-directive', ['map-service', 'layout-service', 'layers-service']).directive('spMap', ['$timeout', 'MapService', 'LayoutService', 'LayersService',
        function ($timeout, MapService, LayoutService, LayersService) {
            return {
                scope: {
                    custom: '&onCustom'
                },
                templateUrl: 'portal/' + 'mapContent.html',
                link: function (scope, element, attrs) {
                    scope.list = MapService.mappedLayers

                    scope.sortingLog = [];

                    scope.selectControls = function () {
                        //enable base layer chooser list, etc
                        LayoutService.enable('options')
                    }

                    scope.info = function (url, title, notes) {
                        scope.$parent.openIframe(url, title, notes)
                    }

                    scope.deleteAll = function () {
                        var uids = [], i
                        for (i = 0; i < scope.list.length; i++) {
                            uids.push(scope.list[i].uid)
                        }

                        for ( i = 0; i < uids.length; i++) {
                            MapService.remove(uids[i])
                        }

                        scope.selectControls()
                    }

                    scope.showAll = function () {
                        for (var i = 0; i < scope.list.length; i++) {
                            MapService.setVisible(scope.list[i].uid, true)
                        }
                    }

                    scope.hideAll = function () {
                        for (var i = 0; i < scope.list.length; i++) {
                            MapService.setVisible(scope.list[i].uid, false)
                        }
                    }

                    scope.zoom = function (item) {
                        MapService.zoom(item.uid)
                    }

                    scope.info = function (item) {
                        MapService.info(item)
                    }

                    scope.delete = function (item) {
                        MapService.remove(item.uid)
                        scope.selectControls()
                    }

                    scope.updateVisibility = function (item) {
                        MapService.setVisible(item.uid, item.visible)
                    }

                    scope.sortableOptions = {
                        update: function (e, ui) {
                            //MapService.updateZindex()
                        },
                        stop: function (e, ui) {
                            MapService.updateZindex()
                        }
                    }

                    scope.select = function (layer) {
                        LayoutService.enable('legend')
                        MapService.select(layer)
                    }
                }
            };
        }])
}(angular));