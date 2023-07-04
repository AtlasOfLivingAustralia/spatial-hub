(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name selectArea
     * @description
     *   Area selection controls
     */
    angular.module('select-area-directive', ['map-service', 'predefined-areas-service'])
        .directive('selectArea', ['$http', 'MapService', 'PredefinedAreasService', '$timeout',
            'LayoutService', function ($http, MapService, PredefinedAreasService, $timeout, LayoutService) {

                return {
                    templateUrl: '/spApp/selectAreaCtrl.htm',
                    scope: {
                        _selectedArea: '=selectedArea',
                        _includeDefaultAreas: '=includeDefaultAreas',
                        _uniqueId: '=uniqueId',
                        _defaultToWorld: '=?defaultToWorld',
                        _excludeWorld: '=?excludeWorld'
                    },
                    link: function (scope, element, attrs) {

                        scope.selected = '';
                        scope.layerAreas = []; // new area created ONLY
                        scope.isNewAreaCreated = false; //check if new area is created
                        LayoutService.addToSave(scope);

                        scope.addLayerAreas = function () {
                            var numberOflayerAreas = scope.layerAreas.length;
                            $.map(MapService.areaLayers(), function (x, idx) {
                                // Incompatible areas have area.pid.contains(':') or '~'
                                if (x.pid /* || ((x.pid + '').indexOf(':') < 0 && (x.pid + '').indexOf('~')) < 0 */) {
                                    //check if pid exists
                                    if ( scope.layerAreas.filter(function(layer) {return layer.pid == x.pid} ).length == 0 ) {
                                        //Add the new layer on the top (the top one should be selected by default)
                                        scope.layerAreas.unshift({
                                            name: x.name,
                                            q: x.q,
                                            wkt: x.wkt,
                                            bbox: x.bbox,
                                            pid: x.pid,
                                            area_km: x.area_km,
                                            uid: x.uid,
                                            type: x.type
                                        })
                                    }

                                }
                            });

                            if (scope.layerAreas.length > numberOflayerAreas) {
                                scope.isNewAreaCreated = true;
                            } else {
                                scope.isNewAreaCreated = false;
                            }
                        };


                        scope.change = function (select) {
                            scope._selectedArea.area[0] = select
                        };

                        scope.defaultAreas = [];
                        if (scope._includeDefaultAreas !== false) {
                            scope.defaultAreas = $.map(PredefinedAreasService.getList(scope._excludeWorld), function (x, idx) {
                                return x
                            })
                        }

                        scope.createArea = function () {
                            LayoutService.openModal('addArea', undefined, true);
                        };

                        function selectPredefinedArea(uid) {
                            scope.layerAreas.forEach(function (layer) {
                                if (uid === layer.uid) {
                                    scope._selectedArea.area[0] = layer
                                }
                            })
                        }

                        scope.element = element;

                        $timeout(function () {
                            scope.addLayerAreas();
                            if (scope.selected === '' ||  scope.isNewAreaCreated) {
                                if (scope.isNewAreaCreated && scope.layerAreas.length > 0) {
                                    scope._selectedArea.area[0] = scope.layerAreas[0];
                                    scope.selected = scope._selectedArea.area[0].uid
                                } else {
                                    if (scope.defaultAreas.length > 0) {
                                        var defaultArea = scope.defaultAreas[0];
                                        if (scope._defaultToWorld) defaultArea = scope.defaultAreas[scope.defaultAreas.length - 1];
                                        if (scope._selectedArea.area !== undefined) {
                                            scope._selectedArea.area[0] = defaultArea;
                                        } else {
                                            scope._selectedArea = [defaultArea];
                                        }
                                    }

                                    if (scope._selectedArea.area.length > 0) {
                                        scope.selected = scope._selectedArea.area[0].name
                                    }
                                }
                            } else if (scope._selectedArea.area.length > 0) {
                                if (scope._selectedArea.area[0].uid === undefined) {
                                    scope.selected = scope._selectedArea.area[0].name
                                } else {
                                    scope.selected = scope._selectedArea.area[0].uid
                                }
                            }
                        }, 0);
                    }
                }

            }])
}(angular));
