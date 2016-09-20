/*
 * Copyright (C) 2016 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * Created by Temi on 8/09/2016.
 */
(function (angular) {
    'use strict';
    angular.module('leaflet-quick-links-directive', ['leaflet-directive'])
        .directive('leafletQuickLinks', [
            function () {
                return {
                    transclude: true,
                    controller: ['$scope', '$compile', '$templateRequest', '$rootScope', 'leafletData', 'MapService', 'LayoutService',
                        function ($scope, $compile, $templateRequest, $rootScope, leafletData, MapService, LayoutService) {
                            $scope.expanded = true
                            $scope.showMainMenu = true
                            $scope.species = undefined
                            $scope.layer = undefined
                            $scope.area = undefined
                            $scope.toggle = function () {
                                $scope.expanded = !$scope.expanded
                                event.stopPropagation()
                            }
                            // $scope.layer = {show:false, item: undefined, name:null}
                            $scope.delegateCall = function (type, inputs) {
                                var data = {}
                                switch (type){
                                    case 'metadata':
                                        switch (inputs){
                                            case 'species':
                                                MapService.info($scope.species)
                                                break
                                            case 'layer':
                                                MapService.info($scope.layer)
                                                break
                                            case 'area':
                                                MapService.info($scope.area)
                                                break;
                                        }

                                        break;
                                    case 'download':
                                        switch (inputs){
                                            case 'speciesarea':
                                                data.selectedQ = MapService.getSpeciesLayerQuery($scope.species)
                                                data.selectedArea = MapService.getAreaLayerQuery($scope.area)
                                                LayoutService.openModal('exportSample', data)
                                                break;
                                            case 'specieslist':
                                                data.step = 1;
                                                data.selectedArea = MapService.getAreaLayerQuery($scope.area)
                                                LayoutService.openModal('exportChecklist', data)
                                                break;
                                            case 'area':
                                                data.step = 1;
                                                data.selectedQ = MapService.getAllSpeciesQuery()
                                                data.selectedArea = MapService.getAreaLayerQuery($scope.area)
                                                LayoutService.openModal('exportSample', data)
                                                break;
                                            case 'species':
                                                data.step = 1;
                                                data.selectedQ = MapService.getSpeciesLayerQuery($scope.species)
                                                data.speciesOption = 'selectedSpecies'
                                                data.includeDefaultAreas = true
                                                LayoutService.openModal('exportSample', data)
                                                break;
                                        }
                                        break;
                                    case 'export':
                                        switch (inputs){
                                            case 'area':
                                                data.step = 1;
                                                data.selectedArea = MapService.getAreaLayerQuery($scope.area)
                                                LayoutService.openModal('exportArea', data)
                                                break;
                                        }
                                        break;
                                    case 'areareport':
                                        data.selectedArea = MapService.getAreaLayerQuery($scope.area)
                                        LayoutService.openModal('toolAreaReport', data)
                                        break;
                                    case 'classification':
                                        data  = {opening: true, processName: 'Classification'}
                                        data.overrideValues = {
                                            Classification: {
                                                input: {
                                                    area: {
                                                        constraints: {
                                                            default: MapService.getAreaLayerQuery($scope.area)
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        data.selectedArea = MapService.getAreaLayerQuery($scope.area)
                                        LayoutService.openModal('backgroundProcess', data)
                                        break;
                                    case 'scatterplot':
                                        switch (inputs) {
                                            case 'species':
                                                data = {opening: true, processName: 'ScatterplotCreate' }
                                                data.overrideValues = {
                                                    ScatterplotCreate: {
                                                        input: {
                                                            species1: {
                                                                constraints: {
                                                                    default: MapService.getSpeciesLayerQuery($scope.species)
                                                                }
                                                            },
                                                            species2: {
                                                                constraints: {
                                                                    default: MapService.getSpeciesLayerQuery($scope.species)
                                                                }
                                                            }
                                                        }
                                                    }
                                                }

                                                LayoutService.openModal('backgroundProcess', data)
                                                break;
                                            case 'speciesarea':
                                                data = {opening: true, processName: 'ScatterplotCreate' }
                                                data.overrideValues = {
                                                    ScatterplotCreate: {
                                                        input: {
                                                            species1: {
                                                                constraints: {
                                                                    default: MapService.getSpeciesLayerQuery($scope.species)
                                                                }
                                                            },
                                                            species2: {
                                                                constraints: {
                                                                    default: MapService.getSpeciesLayerQuery($scope.species)
                                                                }
                                                            },
                                                            area: {
                                                                constraints: {
                                                                    default: MapService.getAreaLayerQuery($scope.area)
                                                                }
                                                            }
                                                        }
                                                    }
                                                }

                                                LayoutService.openModal('backgroundProcess', data)
                                                break;
                                        }
                                        break;
                                    case 'prediction':
                                        switch (inputs){
                                            case 'species':
                                                data = {opening: true, processName: 'Maxent'}
                                                data.overrideValues = {
                                                    Maxent: {
                                                        input: {
                                                            species: {
                                                                constraints: {
                                                                    default: MapService.getSpeciesLayerQuery($scope.species)
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                LayoutService.openModal('backgroundProcess', data)
                                                break;
                                            case 'speciesarea':
                                                data = {opening: true, processName: 'Maxent'}
                                                data.overrideValues = {
                                                        Maxent: {
                                                        input: {
                                                            species: {
                                                                constraints: {
                                                                    default: MapService.getSpeciesLayerQuery($scope.species)
                                                                }
                                                            },
                                                            area: {
                                                                constraints: {
                                                                    default: MapService.getAreaLayerQuery($scope.area)
                                                                }
                                                            }
                                                        }
                                                    }
                                                }

                                                LayoutService.openModal('backgroundProcess', data)
                                                break;
                                        }
                                        break;
                                    case 'pointstogrid':
                                        switch (inputs){
                                            case 'species':
                                                data = {opening: true, processName: 'PointsToGrid'}
                                                data.overrideValues = {
                                                    PointsToGrid: {
                                                        input: {
                                                            species: {
                                                                constraints: {
                                                                    default: MapService.getSpeciesLayerQuery($scope.species)
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                LayoutService.openModal('backgroundProcess', data)
                                                break;
                                            case 'speciesarea':
                                                data = {opening: true, processName: 'PointsToGrid'}
                                                data.overrideValues = {
                                                    PointsToGrid: {
                                                        input: {
                                                            species: {
                                                                constraints: {
                                                                    default: MapService.getSpeciesLayerQuery($scope.species)
                                                                }
                                                            },
                                                            area: {
                                                                constraints: {
                                                                    default: MapService.getAreaLayerQuery($scope.area)
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                LayoutService.openModal('backgroundProcess', data)
                                                break;
                                        }

                                        break
                                    case 'gdm':
                                        // todo
                                        break
                                    case 'facet':
                                        // cannot consistently drop down a select box programmatically in all browsers
                                        break
                                    case '':
                                        break
                                }

                                event.stopPropagation()
                            }

                            $scope.controlVisibility = function (linkOfType) {
                                if(linkOfType === 'speciesarea'){
                                    return !!( $scope.species && $scope.area)
                                } else if(linkOfType === 'species'){
                                    return !!$scope.species && !$scope.area
                                } else if(linkOfType === 'area'){
                                    return !!$scope.area
                                } else if(linkOfType === 'layer'){

                                    return !!$scope.layer
                                } else {
                                    return true
                                }
                            }

                            function getSelectedOrFirstLayer(selected, layers, layertype) {
                                if(layers && layers.length){
                                    var i = 0
                                    while (i < layers.length && !layers[i].visible) i++

                                    if (selected && (i >= layers.length || selected.layertype === layers[i].layertype)) {
                                        return selected
                                    } else if (i < layers.length) {
                                        return layers[i]
                                    }
                                } else {
                                    if(selected && (selected.layertype === layertype)){
                                        return selected
                                    }
                                }
                            }

                            $scope.mappedLayers = MapService.mappedLayers
                            $scope.$watch('mappedLayers', function () {
                                var groups = MapService.groupLayersByType()
                                $scope.area = getSelectedOrFirstLayer($scope.selectedlayer, groups.area, 'area')
                                $scope.layer = getSelectedOrFirstLayer($scope.selectedlayer, groups.contextual, 'contextual')
                                $scope.layer = $scope.layer || getSelectedOrFirstLayer($scope.selectedlayer, groups.grid, 'grid')
                                $scope.species = getSelectedOrFirstLayer($scope.selectedlayer, groups.species, 'species')
                            }, true)

                            $scope.selectedLayer = MapService.selected
                            $scope.$watch('selectedLayer', function () {
                                $scope.selectedlayer = MapService.selected
                            })

                            $scope.openModal = function (type) {
                                LayoutService.openModal(type)
                            }

                            $templateRequest('portal/quickLinksContent.html').then(function (content) {
                                var html = $compile(content)($scope)
                                leafletData.getMap().then(function (map) {
                                    new L.Control.QuickLinks({template: html[0]}).addTo(map)
                                })
                          })
                    }]
                }
            }])
}(angular));