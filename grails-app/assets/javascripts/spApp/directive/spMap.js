(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name spMap
     * @description
     *    Panel displaying the map
     */
    angular.module('sp-map-directive', ['map-service', 'layout-service', 'layers-service']).directive('spMap', ['$timeout', 'MapService', 'LayoutService', 'LayersService', 'KeepAliveService', '$q',
        function ($timeout, MapService, LayoutService, LayersService, KeepAliveService, $q) {
            if ($SH.userId) {
                KeepAliveService.start();
            }

            return {
                scope: {},
                templateUrl: '/spApp/mapContent.htm',
                link: function (scope, element, attrs) {
                    scope.baseUrl = $SH.baseUrl; // for image icons
                    scope.config = $SH.config; // used by mapContent.tpl.htm

                    scope.list = MapService.mappedLayers;

                    scope.sortingLog = [];

                    scope.addBWK = function() {
                        var layerId = $SH.bwk;
                        return scope.addLayer(layerId);
                    }

                    scope.addLandbouw = function() {
                        var layerId = $SH.landbouw;
                        return scope.addLayer(layerId);
                    }

                    scope.addVhga = function() {
                        var layerId = $SH.vhga;
                        return scope.addLayer(layerId);
                    }

                    scope.addLayer = function (layerId) {
                        var promises = [];
                        var item = LayersService.convertFieldIdToMapLayer(layerId, true)
                        item.log = false
                        console.log("ksh-debug. adding layer " + layerId);
                        promises.push(MapService.add(item))
                        return $q.all(promises)
                    }

                    scope.info = function (url, title, notes) {
                        scope.$parent.openIframe(url, title, notes)
                    };

                    scope.deleteAll = function () {
                        bootbox.confirm($i18n(344, "Delete all mapped layers?"),
                            function (result) {
                                if (result) {
                                    var uids = [], i;
                                    for (i = 0; i < scope.list.length; i++) {
                                        uids.push(scope.list[i].uid)
                                    }

                                    for (i = 0; i < uids.length; i++) {
                                        MapService.remove(uids[i])
                                    }

                                    scope.select(undefined)
                                }
                            }
                        );
                    };

                    scope.showAll = function () {
                        for (var i = 0; i < scope.list.length; i++) {
                            MapService.setVisible(scope.list[i].uid, true)
                        }
                        scope.defaultLayerSelection()
                    };

                    scope.hideAll = function () {
                        for (var i = 0; i < scope.list.length; i++) {
                            MapService.setVisible(scope.list[i].uid, false)
                        }
                        scope.select(undefined)
                    };

                    scope.zoom = function (item) {
                        MapService.zoom(item.uid)
                    };

                    scope.info = function (item) {
                        LayoutService.info(item)
                    };

                    scope.isSelected = function (item) {
                        return MapService.selected.layer === item
                    };

                    scope['delete'] = function (item) {
                        MapService.remove(item['uid']);
                        scope.defaultLayerSelection()
                    };

                    scope.updateVisibility = function (item, event) {
                        MapService.setVisible(item.uid, item.visible)
                        if (item.visible) {
                            scope.select(item)
                        } else {
                            scope.defaultLayerSelection()
                        }
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
                        MapService.select(layer)

                        if (layer === undefined) {
                            //enable base layer chooser list, etc
                            LayoutService.enable('options')
                        } else {
                            LayoutService.enable('legend', layer);
                        }
                    };

                    scope.reconnect = function () {
                        KeepAliveService.reconnect();
                    },

                        scope.defaultLayerSelection = function () {
                            var selection = undefined; // map options
                            for (var i = 0; selection === undefined && i < scope.list.length; i++) {
                                if (scope.list[i].visible) {
                                    selection = scope.list[i];
                                }
                            }

                            scope.select(selection)
                        },

                        scope.openModal = function (type, data) {
                            LayoutService.clear();
                            LayoutService.openModal(type, data)
                        };

                    scope.openTool = function (type) {
                        scope.openModal('tool', {processName: type})
                    };


                }
            };
        }])
}(angular));