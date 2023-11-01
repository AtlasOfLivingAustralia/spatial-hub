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
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name leafletQuickLinks
     * @description
     *   Quicklinks panel
     */
    angular.module('leaflet-quick-links-directive', ['leaflet-directive'])
        .directive('leafletQuickLinks', [
            function () {
                return {
                    transclude: true,
                    controller: ['$scope', '$compile', '$templateRequest', '$timeout', '$rootScope', 'leafletData', 'MapService', 'LayoutService',
                        function ($scope, $compile, $templateRequest, $timeout, $rootScope, leafletData, MapService, LayoutService) {
                            $scope.expanded = true;
                            $scope.showMainMenu = true;
                            $scope.species = undefined;
                            $scope.layer = undefined;
                            $scope.area = undefined;
                            $scope.toggle = function () {
                                $scope.expanded = !$scope.expanded;
                                event.stopPropagation()
                            };

                            $scope.setDefault = function (data, key, value) {
                                if (data.overrideValues === undefined) data.overrideValues = {};
                                if (data.overrideValues.input === undefined) data.overrideValues.input = {};
                                if (data.overrideValues.input[key] === undefined) data.overrideValues.input[key] = {};
                                if (data.overrideValues.input[key].constraints === undefined) data.overrideValues.input[key].constraints = {};
                                data.overrideValues.input[key].constraints['defaultValue'] = value;
                            };

                            $scope.open = function (name, data, includeSpecies, includeArea) {
                                if ($scope.species && (includeSpecies === undefined || includeSpecies !== false)) {
                                    var species = MapService.getSpeciesLayerQuery($scope.species);
                                    if (includeSpecies === undefined || includeSpecies === true) {
                                        $scope.setDefault(data, 'species', species);
                                    } else {
                                        $scope.setDefault(data, includeSpecies, species);
                                    }
                                }
                                if ($scope.area && (includeArea === undefined || includeArea !== false)) {
                                    var area = MapService.getAreaLayerQuery($scope.area);
                                    if (includeArea === undefined || includeArea === true) {
                                        $scope.setDefault(data, 'area', area);
                                    } else {
                                        $scope.setDefault(data, includeArea, area);
                                    }
                                }
                                data.processName = name;

                                LayoutService.clear();
                                LayoutService.openModal('tool', data)
                            };

                            $scope.delegateCall = function (type, inputs) {
                                var data = {};
                                switch (type) {
                                    case 'metadata':
                                        switch (inputs) {
                                            case 'species':
                                                LayoutService.info($scope.species);
                                                break;
                                            case 'layer':
                                                LayoutService.info($scope.layer);
                                                break;
                                            case 'area':
                                                LayoutService.info($scope.area);
                                                break;
                                        }

                                        break;
                                    case 'download':
                                        switch (inputs) {
                                            case 'speciesarea':
                                                $scope.open("ToolExportSampleService", data);
                                                break;
                                            case 'specieslist':
                                                $scope.open("ToolExportChecklistService", data);
                                                break;
                                            case 'area':
                                                $scope.open("ToolExportSampleService", data, false);
                                                break;
                                            case 'species':
                                                $scope.open("ToolExportSampleService", data, true, false);
                                                break;
                                        }
                                        break;
                                    case 'export':
                                        switch (inputs) {
                                            case 'area':
                                                $scope.open("ToolExportAreaService", data);
                                                break;
                                        }
                                        break;
                                    case 'areareport':
                                        $scope.open("ToolAreaReportService", data, inputs.includeSpecies, inputs.includeArea);
                                        break;
                                    case 'classification':
                                        $scope.open("Classification", {opening: true});
                                        break;
                                    case 'scatterplot':
                                        switch (inputs) {
                                            case 'species':
                                                $scope.open("ScatterplotCreate", {opening: true}, "species1", false);
                                                break;
                                            case 'speciesarea':
                                                $scope.open("ScatterplotCreate", {opening: true}, "species1", "area");
                                                break;
                                        }
                                        break;
                                    case 'prediction':
                                        switch (inputs) {
                                            case 'species':
                                                $scope.open("Maxent", {opening: true}, "species", false);
                                                break;
                                            case 'speciesarea':
                                                $scope.open("Maxent", {opening: true}, "species", "area");
                                                break;
                                        }
                                        break;
                                    case 'pointstogrid':
                                        switch (inputs) {
                                            case 'species':
                                                $scope.open("PointsToGrid", {opening: true}, true, false);
                                                break;
                                            case 'speciesarea':
                                                $scope.open("PointsToGrid", {opening: true}, true, true);
                                        }

                                        break;
                                    case 'gdm':
                                        // todo
                                        break;
                                    case 'facet':
                                        // cannot consistently drop down a select box programmatically in all browsers
                                        break;
                                    case '':
                                        break
                                }

                                event.stopPropagation()
                            };

                            $scope.controlVisibility = function (linkOfType) {
                                if (linkOfType === 'speciesarea') {
                                    return !!($scope.species && $scope.area)
                                } else if (linkOfType === 'species') {
                                    return !!$scope.species && !$scope.area
                                } else if (linkOfType === 'area') {
                                    return !!$scope.area
                                } else if (linkOfType === 'layer') {

                                    return !!$scope.layer
                                } else {
                                    return true
                                }
                            };

                            function getSelectedOrFirstLayer(selected, layers, layertype) {
                                if (layers && layers.length) {
                                    var i = 0;
                                    while (i < layers.length && !layers[i].visible) i++;

                                    if (selected && (i >= layers.length || selected.layertype === layers[i].layertype)) {
                                        return selected
                                    } else if (i < layers.length) {
                                        return layers[i]
                                    }
                                } else {
                                    if (selected && (selected.layertype === layertype)) {
                                        return selected
                                    }
                                }
                            }

                            $scope.mappedLayers = MapService.mappedLayers;
                            $scope.$watch('mappedLayers', function () {
                                var groups = MapService.groupLayersByType();
                                $scope.area = getSelectedOrFirstLayer($scope.selectedlayer, groups.area, 'area');
                                $scope.layer = getSelectedOrFirstLayer($scope.selectedlayer, groups.contextual, 'contextual');
                                $scope.layer = $scope.layer || getSelectedOrFirstLayer($scope.selectedlayer, groups.grid, 'grid');
                                $scope.species = getSelectedOrFirstLayer($scope.selectedlayer, groups.species, 'species')
                            }, true);

                            $scope.selectedLayer = MapService.selected;
                            $scope.$watch('selectedLayer', function () {
                                $scope.selectedlayer = MapService.selected
                            });

                            $scope.openModal = function (type, data) {
                                LayoutService.clear();
                                LayoutService.openModal(type, data)
                            };
                            $scope.openTool = function (type) {
                                $scope.openModal('tool', {processName: type})
                            };

                            $timeout(function () {
                                $templateRequest('/spApp/quickLinksContent.htm').then(function (content) {
                                    var html = $compile(content)($scope);
                                    if ($SH.config.quicklinks) {
                                        leafletData.getMap().then(function (map) {
                                            new L.Control.QuickLinks({template: html[0]}).addTo(map)
                                        });
                                    }
                                })
                            }, 500);
                        }]
                }
            }])
}(angular));
