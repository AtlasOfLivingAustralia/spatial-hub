(function (angular) {
    'use strict';
    angular.module('select-area-directive', ['map-service', 'predefined-areas-service'])
        .directive('selectArea', ['$http', 'MapService', 'PredefinedAreasService', '$timeout',
            'LayoutService', function ($http, MapService, PredefinedAreasService, $timeout, LayoutService) {

                return {
                    template: '<div><div ng-repeat="x in layerAreas" >\
                                    <input type="radio" ng-change="change(x)" ng-model="selected" \
                                        ng-value="x.uid" name="selectedArea">{{x.name}}<br/>\
                                </div><br/><div ng-repeat="x in defaultAreas">\
                                    <input type="radio" ng-change="change(x)" ng-model="selected" \
                                        ng-value="x.name" name="selectedArea">{{x.name}}<br/>\
                                </div><br/><div><input type="radio" ng-click="createArea()" ng-model="selected" \
                                        ng-model="_selectedArea.area[0]" ng-value="create" \
                                        name="selectedArea">Define new area...<br/>\
                                </div>\
                                </div>',
                    scope: {
                        _selectedArea: '=selectedArea',
                        _includeDefaultAreas: '=includeDefaultAreas',
                        _uniqueId: '=uniqueId'
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
                                scope.layerAreas.push({
                                    name: x.name,
                                    q: x.q,
                                    wkt: x.wkt,
                                    bbox: x.bbox,
                                    pid: x.pid,
                                    area_km: x.area_km,
                                    uid: x.uid
                                })
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
                            LayoutService.openModal('addArea', {display: {size: 'sm'}}, true);
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
                                    scope._selectedArea.area[0] = scope.defaultAreas[0];
                                    scope.selected = scope._selectedArea.area[0].name
                                }
                            }
                        }, 0);
                    }
                }

            }])
}(angular));