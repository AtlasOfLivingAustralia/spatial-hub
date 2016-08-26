(function (angular) {
    'use strict';
    angular.module('select-area-directive', ['map-service', 'predefined-areas-service'])
        .directive('selectArea', ['$http', 'MapService', 'PredefinedAreasService',
            '$rootScope', function ($http, MapService, PredefinedAreasService, $rootScope) {

                return {
                    template: '<div><div ng-repeat="x in layerAreas" >\
                                    <input type="radio" ng-model="selectedArea.area" \
                                        ng-value="x" name="selectedArea">{{x.name}}<br/>\
                                </div><div ng-repeat="x in defaultAreas">\
                                    <input type="radio" ng-model="selectedArea.area" \
                                        ng-value="x" name="selectedArea">{{x.name}}<br/>\
                                </div>\
                                </div>',
                    scope: {
                        custom: '&onCustom',
                        selectedArea: '=selectedArea',
                        includeDefaultAreas: '=includeDefaultAreas'
                    },
                    link: function (scope, element, attrs) {

                        scope.name = 'selectArea'

                        scope.layerAreas = $.map(MapService.areaLayers(), function (x) {
                            return {
                                name: x.name,
                                q: x.q,
                                wkt: x.wkt,
                                pid: x.pid,
                                area_km: x.area_km
                            }
                        })

                        scope.defaultAreas = []
                        if (scope.includeDefaultAreas !== false) {
                            scope.defaultAreas = $.map(PredefinedAreasService.getList(), function (x) {
                                return {
                                    name: x.name,
                                    q: x.q,
                                    wkt: x.wkt,
                                    pid: x.pid,
                                    area_km: x.area_km
                                }
                            })
                        }

                        scope.selectedArea.area = $rootScope.getValue(scope.name, 'selectedArea', scope.defaultAreas[0])
                        $rootScope.addToSave(scope)


                    }
                }

            }])
}(angular));