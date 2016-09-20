(function (angular) {
    'use strict';
    angular.module('select-area-directive', ['map-service', 'predefined-areas-service'])
        .directive('selectArea', ['$http', 'MapService', 'PredefinedAreasService',
            'LayoutService', function ($http, MapService, PredefinedAreasService, LayoutService) {

                return {
                    template: '<div><div ng-repeat="x in layerAreas" >\
                                    <input type="radio" ng-model="selectedArea.area[0]" \
                                        ng-value="x" name="selectedArea">{{x.name}}<br/>\
                                </div><div ng-repeat="x in defaultAreas">\
                                    <input type="radio" ng-model="selectedArea.area[0]" \
                                        ng-value="x" name="selectedArea">{{x.name}}<br/>\
                                </div>\
                                </div>',
                    scope: {
                        custom: '&onCustom',
                        selectedArea: '=selectedArea',
                        includeDefaultAreas: '=includeDefaultAreas'
                        // ,
                        // maxAreas: '=maxAreas',
                        // minAreas: '=minAreas'
                    },
                    link: function (scope, element, attrs) {

                        if (scope.selectedArea.area.length == 0) scope.selectedArea.area = [{}]
                        // if (!scope.minAreas) scope.minAreas = 1
                        // if (!scope.maxAreas) scope.maxAreas = 1

                        scope.name = 'selectArea'
                        scope.layerAreas = $.map(MapService.areaLayers(), function (x) {
                            return {
                                name: x.name,
                                q: x.q,
                                wkt: x.wkt,
                                bbox: x.bbox,
                                pid: x.pid,
                                area_km: x.area_km,
                                uid: x.uid
                            }
                        })

                        scope.defaultAreas = []
                        if (scope.includeDefaultAreas !== false) {
                            scope.defaultAreas = $.map(PredefinedAreasService.getList(), function (x) {
                                return x
                            })
                        }
                        
                        function selectPredefinedArea(uid) {
                            scope.layerAreas.forEach(function (layer) {
                                if(uid === layer.uid){
                                    scope.selectedArea.area[0] = layer
                                }
                            })
                        }

                        if (scope.selectedArea && scope.selectedArea.area && scope.selectedArea.area.length > 0 &&
                            scope.selectedArea.area[0].name) {
                            selectPredefinedArea(scope.selectedArea.area[0].uid)
                        } else {
                            scope.selectedArea.area = [scope.defaultAreas[0]]
                            if(!scope.selectedArea.area && scope.defaultAreas.length){
                                scope.selectedArea.area = [scope.defaultAreas[0]]
                            }
                        }

                        LayoutService.addToSave(scope)


                    }
                }

            }])
}(angular));