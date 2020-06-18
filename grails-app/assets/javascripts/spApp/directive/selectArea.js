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
                        _defaultToWorld: '=?defaultToWorld'
                    },
                    link: function (scope, element, attrs) {

                        scope.selected = '';
                        LayoutService.addToSave(scope);

                        scope.create = 'create';

                        scope.addLayerAreas = function () {
                            $.map(MapService.areaLayers(), function (x, idx) {

                                // Incompatible areas have area.pid.contains(':')
                                if (x.pid !== undefined || !x.pid.contain(':')) {
                                    scope.layerAreas.push({
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
                            });
                        };
                        scope.layerAreas = [];

                        scope.change = function (select) {
                            scope._selectedArea.area[0] = select
                        };

                        scope.defaultAreas = [];
                        if (scope._includeDefaultAreas !== false) {
                            scope.defaultAreas = $.map(PredefinedAreasService.getList(), function (x, idx) {
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
                            if (scope.selected === '' || scope.selected === scope.create) {
                                if (scope.layerAreas.length > 0) {
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

                                    scope.selected = scope._selectedArea.area[0].name
                                }
                            } else {
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