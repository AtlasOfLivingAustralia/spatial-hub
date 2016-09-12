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
                    controller: ['$scope', '$compile', '$templateRequest', '$rootScope', 'leafletData', 'MapService',
                        function ($scope, $compile, $templateRequest, $rootScope, leafletData, mapService) {
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
                                                $rootScope.$emit('quicklinks.call', type, $scope.species);
                                                break
                                            case 'layer':
                                                $rootScope.$emit('quicklinks.call', type, $scope.layer);
                                                break
                                            case 'area':
                                                $rootScope.$emit('quicklinks.call', type, $scope.area);
                                                break;
                                        }

                                        break;
                                    case 'download':
                                        switch (inputs){
                                            case 'speciesarea':
                                                data.selectedQ = mapService.getSpeciesLayerQuery($scope.species)
                                                data.selectedArea = mapService.getAreaLayerQuery($scope.area)
                                                $scope.openModal('exportSample', data)
                                                break;
                                            case 'specieslist':
                                                data.step = 1;
                                                data.selectedArea = mapService.getAreaLayerQuery($scope.area)
                                                $scope.openModal('exportChecklist', data)
                                                break;
                                            case 'area':
                                                data.step = 1;
                                                data.selectedArea = mapService.getAreaLayerQuery($scope.area)
                                                $scope.openModal('exportSample', data)
                                                break;
                                            case 'species':
                                                data.step = 1;
                                                data.selectedQ = mapService.getSpeciesLayerQuery($scope.species)
                                                data.speciesOption = 'selectedSpecies'
                                                data.includeDefaultAreas = true
                                                $scope.openModal('exportSample', data)
                                                break;
                                        }
                                        break;
                                    case 'export':
                                        switch (inputs){
                                            case 'area':
                                                data.step = 1;
                                                data.selectedArea = mapService.getAreaLayerQuery($scope.area)
                                                $scope.openModal('exportArea', data)
                                                break;
                                        }
                                        break;
                                    case 'areareport':
                                        data.selectedArea = mapService.getAreaLayerQuery($scope.area)
                                        $scope.openModal('toolAreaReport', data)
                                        break;
                                    case 'classification':
                                        data  = {opening: true, processName: 'Classification'}
                                        data.selectedArea = mapService.getAreaLayerQuery($scope.area)
                                        $scope.openModal('backgroundProcess', data)
                                        break;
                                    case 'scatterplot':
                                        switch (inputs) {
                                            case 'species':
                                                data = {opening: true, processName: 'ScatterplotCreate' }
                                                data.speciesOption = $scope.species.uid
                                                $scope.openModal('backgroundProcess', data)
                                                break;
                                        }
                                        break;
                                    case 'prediction':
                                        $scope.openModal('backgroundProcess', {opening: true, processName: 'Maxent'})
                                        break
                                    case 'pointstogrid':
                                        $scope.openModal('backgroundProcess', {opening: true, processName: 'PointsToGrid'})
                                        break
                                    case 'gdm':
                                        break
                                    case 'facet':
                                        $('#facet').show().focus().trigger('mousedown')
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
                                    if(selected && (selected.layertype === layers[0].layertype)){
                                        return selected
                                    } else {
                                        return layers[0]
                                    }
                                } else {
                                    if(selected && (selected.layertype === layertype)){
                                        return selected
                                    }
                                }
                            }
                            
                            $rootScope.$on('mapservice.layerchanged', function (event, layer) {
                                var groups = mapService.groupLayersByType()
                                $scope.selectedlayer = layer
                                $scope.area = getSelectedOrFirstLayer($scope.selectedlayer, groups.area, 'area')
                                $scope.layer = getSelectedOrFirstLayer($scope.selectedlayer, groups.contextual, 'contextual')
                                $scope.layer = $scope.layer || getSelectedOrFirstLayer($scope.selectedlayer, groups.grid, 'grid')
                                $scope.species = getSelectedOrFirstLayer($scope.selectedlayer, groups.species, 'species')
                            })

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