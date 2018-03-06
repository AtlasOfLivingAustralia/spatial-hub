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
                        // ,
                        // maxAreas: '=maxAreas',
                        // minAreas: '=minAreas'
                    },
                    link: function (scope, element, attrs) {

                        // if (scope.selectedArea.area.length == 0) scope.selectedArea.area = [{}]
                        // if (!scope.minAreas) scope.minAreas = 1
                        // if (!scope.maxAreas) scope.maxAreas = 1

                        scope.selected = '';
                        LayoutService.addToSave(scope);

                        scope.create = 'create';

                        scope.addLayerAreas = function () {
                            $.map(MapService.areaLayers(), function (x, idx) {

                                var area = {
                                    name: x.name,
                                    q: x.q,
                                    wkt: x.wkt,
                                    bbox: x.bbox,
                                    pid: x.pid,
                                    area_km: x.area_km,
                                    uid: x.uid
                                };
                                // Incompatible areas have area.pid.contains(':')
                                if (x.pid){
                                    if (! x.pid.contain(':'))
                                        scope.layerAreas.push(area)
                                }else
                                    scope.layerAreas.push(area)

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
                            LayoutService.openModal('addArea', undefined,undefined,true);
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
                            }
                        }, 0);
                    }
                }

            }])
}(angular));