(function (angular) {
    'use strict';
    angular.module('select-multiple-area-directive', ['map-service', 'predefined-areas-service'])
        .directive('selectMultipleArea', ['$http', 'MapService', 'PredefinedAreasService',
            'LayoutService', function ($http, MapService, PredefinedAreasService, LayoutService) {

                return {
                    template: '<div><div ng-repeat="x in layerAreas" >\
                                    <input type="checkbox" ng-model="area[x + idx]" \
                                        ng-value="x" name="selectedArea">{{x.name}}<br/>\
                                </div><div ng-repeat="x in defaultAreas">\
                                    <input type="checkbox" ng-model="selectedArea.area[0]" \
                                        ng-value="x" name="selectedArea">{{x.name}}<br/>\
                                </div>\
                                <div>\
                                <input type="checkbox" ng-model="pickContextualLayer" name="selectedArea">Select all areas of a contextual layers<br/>\
                                    <div ng-if="pickContextualLayer" select-layers selected-layers="selectedLayer" \
                                    min-count="1" max-count="1" mandatory="false" environmental="false" contextual="true" analysis="false" \
                                 ></div>\
                                </div>\
                                </div>',
                    scope: {
                        _custom: '&onCustom',
                        _selectedArea: '=selectedArea',
                        _includeDefaultAreas: '=includeDefaultAreas',
                        _uniqueId: '=uniqueId'
                        // ,
                        // maxAreas: '=maxAreas',
                        // minAreas: '=minAreas'
                    },
                    link: function (scope, element, attrs) {

                        scope.selectedLayer = undefined; //watch for change
                        scope.pickContextualLayer = undefined;

                        if (scope._selectedArea.area.length === 0) scope._selectedArea.area = [{}];
                        // if (!scope.minAreas) scope.minAreas = 1
                        // if (!scope.maxAreas) scope.maxAreas = 1

                        scope.layerAreas = $.map(MapService.areaLayers(), function (x, idx) {
                            return {
                                name: x.name,
                                q: x.q,
                                wkt: x.wkt,
                                bbox: x.bbox,
                                pid: x.pid,
                                area_km: x.area_km,
                                uid: x.uid
                            }
                        });

                        scope.defaultAreas = [];
                        if (scope._includeDefaultAreas !== false) {
                            scope.defaultAreas = $.map(PredefinedAreasService.getList(), function (x, idx) {
                                return x
                            })
                        }

                        function selectPredefinedArea(uid) {
                            scope.layerAreas.forEach(function (layer) {
                                if (uid === layer.uid) {
                                    scope.selectedArea.area[0] = layer
                                }
                            })
                        }

                        if (scope._selectedArea && scope._selectedArea.area && scope._selectedArea.area.length > 0 &&
                            scope._selectedArea.area[0].name) {
                            selectPredefinedArea(scope._selectedArea.area[0].uid)
                        } else {
                            scope._selectedArea.area = [scope.defaultAreas[0]];
                            if (!scope._selectedArea.area && scope.defaultAreas.length) {
                                scope._selectedArea.area = [scope.defaultAreas[0]]
                            }
                        }

                        LayoutService.addToSave(scope)


                    }
                }

            }])
}(angular));