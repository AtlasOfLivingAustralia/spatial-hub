(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name spMap
     * @description
     *    Panel displaying the map
     */
    angular.module('sp-map-directive', ['map-service', 'layout-service', 'layers-service']).directive('spMap', ['$timeout', 'MapService', 'LayoutService', 'LayersService', 'KeepAliveService',
        function ($timeout, MapService, LayoutService, LayersService, KeepAliveService) {
            if ($SH.userId) {
                KeepAliveService.start();
            }

            return {
                scope: {},
                templateUrl: '/spApp/mapContent.htm',
                link: function (scope, element, attrs) {
                    scope.list = MapService.mappedLayers;

                    scope.sortingLog = [];

                    scope.selectControls = function () {
                        MapService.select(null);

                        //enable base layer chooser list, etc
                        LayoutService.enable('options')
                    };

                    scope.info = function (url, title, notes) {
                        scope.$parent.openIframe(url, title, notes)
                    };

                    scope.deleteAll = function () {
                        bootbox.confirm($i18n("Delete all mapped layers?"),
                            function (result) {
                                if (result) {
                                    var uids = [], i;
                                    for (i = 0; i < scope.list.length; i++) {
                                        uids.push(scope.list[i].uid)
                                    }

                                    for (i = 0; i < uids.length; i++) {
                                        MapService.remove(uids[i])
                                    }

                                    scope.selectControls()
                                }
                            }
                        );
                    };

                    scope.showAll = function () {
                        for (var i = 0; i < scope.list.length; i++) {
                            MapService.setVisible(scope.list[i].uid, true)
                        }
                    };

                    scope.hideAll = function () {
                        for (var i = 0; i < scope.list.length; i++) {
                            MapService.setVisible(scope.list[i].uid, false)
                        }
                    };

                    scope.zoom = function (item) {
                        MapService.zoom(item.uid)
                    };

                    scope.info = function (item) {
                        MapService.info(item)
                    };

                    scope.isSelected = function (item) {
                        return MapService.selected.layer === item
                    };


                    scope['delete'] = function (item) {
                        MapService.remove(item['uid']);
                        scope.selectControls()
                    };

                    scope.updateVisibility = function (item) {
                        MapService.setVisible(item.uid, item.visible)
                    };

                    scope.sortableOptions = {
                        update: function (e, ui) {
                            //MapService.updateZindex()
                        },
                        stop: function (e, ui) {
                            MapService.updateZindex()
                        }
                    };

                    scope.select = function (layer) {
                        LayoutService.enable('legend');
                        MapService.select(layer)
                    }

                    scope.reconnect = function() {
                        KeepAliveService.reconnect();
                    }
                }
            };
        }])
}(angular));