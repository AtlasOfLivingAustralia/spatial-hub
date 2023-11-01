(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name selectMultipleArea
     * @description
     *    Multiple area selection controls
     */
    angular.module('select-multiple-area-directive', ['map-service', 'predefined-areas-service'])
        .directive('selectMultipleArea', ['$http', 'MapService', 'PredefinedAreasService', 'LayoutService',
            'LayersService', '$q', function ($http, MapService, PredefinedAreasService, LayoutService, LayersService, $q) {

                return {
                    templateUrl: '/spApp/selectMultipleAreaCtrl.htm',
                    scope: {
                        _custom: '&onCustom',
                        _selectedArea: '=selectedArea',
                        _includeDefaultAreas: '=includeDefaultAreas',
                        _uniqueId: '=uniqueId'
                        //_includeInOutLayer: '=includeInOutLayer' // in/out layer selection is can only be queried. Mapping is not implemented.
                        // ,
                        // maxAreas: '=maxAreas',
                        // minAreas: '=minAreas'
                    },
                    link: function (scope, element, attrs) {

                        scope.selectedLayer = {layers: []}; //watch for change
                        scope.pickContextualLayer = undefined;
                        scope.pickContextualLayerName = "";
                        scope.pickContextualLayerVisible = true;

                        scope.selectedInOutLayer = {layers: []}; //watch for change
                        scope.pickInOutLayer = undefined;
                        scope.pickInOutLayerName = "";
                        scope.pickInOutLayerVisible = true;

                        scope._includeInOutLayer = true;

                        scope.isSelected = function (item) {
                            var a = scope._selectedArea.area;
                            var len = a.length;
                            for (var i = 0; i < len; i++) {
                                // mapped layers
                                if (item.uid !== undefined && a[i].uid === item.uid) {
                                    return true;
                                }
                                // contextual layers
                                if (item.id !== undefined && a[i].id === item.id) {
                                    return true;
                                }
                                // predefined areas
                                if (item.name !== undefined && a[i].name === item.name) {
                                    return true;
                                }
                            }
                            return false;
                        };

                        LayoutService.addToSave(scope);

                        scope.layerAreas = [];
                        $.map(MapService.areaLayers(), function (x, idx) {
                            // Remove incompatible areas that have area.pid.contains(':')
                            if (x.pid /* ((x.pid + '').indexOf(':') < 0 && (x.pid + '').indexOf('~')) < 0 */) {
                                scope.layerAreas.push({
                                    name: x.name,
                                    q: x.q,
                                    wkt: x.wkt,
                                    bbox: x.bbox,
                                    pid: x.pid,
                                    area_km: x.area_km,
                                    uid: x.uid,
                                    type: x.type,
                                    selected: scope.isSelected(x)
                                })
                            }
                        });

                        scope.defaultAreas = [];
                        if (scope._includeDefaultAreas !== false) {
                            scope.defaultAreas = $.map(PredefinedAreasService.getList(), function (x, idx) {
                                x.selected = scope.isSelected(x);
                                return x
                            })
                        }

                        scope.editPickContextualLayerVisible = function () {
                            scope.pickContextualLayerVisible = true;
                            scope.pickContextualLayerName = ""
                        };
                        scope.editPickInOutLayerVisible = function () {
                            scope.pickInOutLayerVisible = true;
                            scope.pickInOutLayerName = ""
                        };

                        scope.removeInOutLayer = function () {
                            var a = scope._selectedArea.area;
                            var len = a.length;
                            var i;
                            for (i = len - 1; i >= 0; i--) {
                                if (a[i].inOutLayer) {
                                    a.splice(i, 1);
                                }
                            }
                            scope.pickInOutLayerName = "";
                            scope.pickInOutLayerVisible = true;
                        };

                        scope.updatePickInOutLayer = function () {
                            if (!scope.pickInOutLayer) {
                                scope.removeInOutLayer()
                            }
                        }

                        scope.updatePickContextualLayer = function () {
                            if (!scope.pickContextualLayer) {
                                scope.removeContextualLayer()
                            }
                        }

                        scope.removeInOut = true
                        scope.$watch('selectedInOutLayer.layers.length', function (newValue, oldValue) {
                            //remove all inOutLayers
                            if (scope.removeInOut) {
                                scope.removeInOutLayer();
                            }
                            scope.removeInOut = true;

                            //add selected
                            var a = scope.selectedInOutLayer.layers;
                            var len = a.length;
                            for (i = 0; i < len; i++) {
                                var x = a[i];

                                scope.pickInOutLayerVisible = false;
                                scope.pickInOutLayerName = a[i].name;

                                var areaIn = {
                                    name: x.name,
                                    q: x.id + ":*",
                                    inOutLayer: true,
                                    inOutLayerObj: x
                                };
                                scope._selectedArea.area.push(areaIn);

                                var areaOut = {
                                    name: x.name,
                                    q: "-" + x.id + ":*",
                                    inOutLayer: true,
                                    inOutLayerObj: x
                                };
                                scope._selectedArea.area.push(areaOut);

                                scope.removeInOut = false
                                scope.selectedInOutLayer.layers.splice(0, scope.selectedInOutLayer.layers.length);
                            }
                        });

                        scope.updateSelection = function (area) {
                            if (!scope.pickInOutLayer) {
                                scope.removeInOutLayer();
                            }
                            if (!scope.pickContextualLayer) {
                                scope.removeContextualLayer();
                            }
                            if (area) {
                                if (area.selected) {
                                    scope._selectedArea.area.push(area)
                                } else {
                                    var a = scope._selectedArea.area;
                                    var len = a.length;
                                    var i;

                                    for (i = len - 1; i >= 0; i--) {
                                        if (a[i] == area) {
                                            a.splice(i, 1);
                                        }
                                    }
                                }
                            }
                        };

                        scope.removeContextualLayer = function () {
                            var a = scope._selectedArea.area;
                            var len = a.length;
                            var i;
                            for (i = len - 1; i >= 0; i--) {
                                if (a[i].allLayer) {
                                    a.splice(i, 1);
                                }
                            }
                            scope.pickContextualLayerName = "";
                            scope.pickContextualLayerVisible = true;
                        };

                        scope.removeContextual = true
                        scope.$watch('selectedLayer.layers.length', function (newValue, oldValue) {
                            //remove all inOutLayers
                            if (scope.removeContextual) {
                                scope.removeContextualLayer();
                            }
                            scope.removeContextual = true;

                            //add selected
                            var a = scope.selectedLayer.layers;
                            var len = a.length;
                            for (i = 0; i < len; i++) {
                                scope.pickContextualLayerVisible = false;
                                scope.pickContextualLayerName = a[i].name;

                                var x = a[i];
                                var area = {
                                    name: x.name,
                                    q: x.id + ":*",
                                    allLayer: true,
                                    allLayerObj: x
                                };

                                //TODO: Make the corresponding spatial-service change to recognise this aggregation.
                                scope._selectedArea.area.push(area);

                                scope.removeContextual = false
                                scope.selectedLayer.layers.splice(0, scope.selectedLayer.layers.length);
                            }
                        });

                        // apply existing selection
                        scope.applyLayersSelections = function () {
                            var allLayerObjAdded = false;
                            var InOutLayerObjAdded = false;
                            for (var i = scope._selectedArea.area.length; i >= 0; i--) {
                                var a = scope._selectedArea.area[i];
                                if (a !== undefined && a.allLayerObj && !allLayerObjAdded) {
                                    allLayerObjAdded = true;
                                    scope.selectedLayer.layers.push(a);
                                }
                                if (a !== undefined && a.inOutLayerObj && !InOutLayerObjAdded) {
                                    InOutLayerObjAdded = true;
                                    scope.selectedInOutLayer.layers.push(a);
                                }
                            }
                        };

                        scope.createArea = function () {
                            LayoutService.openModal('addArea', undefined, true);
                        };

                        scope.applyLayersSelections();
                    }

                }

            }])
}(angular));
