(function (angular) {
    'use strict';
    angular.module('add-facet-ctrl', ['map-service', 'biocache-service', 'facet-auto-complete-service'])
        .controller('AddFacetCtrl', ['$scope', 'MapService', '$timeout', '$rootScope', '$uibModalInstance', 'BiocacheService',
            'FacetAutoCompleteService',
            function ($scope, MapService, $timeout, $rootScope, $uibModalInstance, BiocacheService, FacetAutoCompleteService) {

                $scope.name = 'addFacetCtrl'

                $scope.step = $rootScope.getValue($scope.name, 'step', 1);
                $scope.selectedArea = $rootScope.getValue($scope.name, 'selectedArea', {
                    area: {
                        q: [],
                        wkt: '',
                        pid: '',
                        bbox: [],
                        name: '',
                        wms: '',
                        legend: ''
                    }
                })

                $scope.sel = ''

                $scope.selection = []
                $scope.facet = {}
                $scope.facets = []
                $scope.facetList = []
                FacetAutoCompleteService.search("-*:*").then(function (data) {
                    $scope.facets = data
                })

                $scope.pageSize = 10
                $scope.offset = 0
                $scope.max = 0
                $scope.maxPages = 0

                $scope.facetFilter = ''

                $rootScope.addToSave($scope)

                $scope.hide = function () {
                    $uibModalInstance.close({hide: true});
                }

                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };

                $scope.ok = function (data) {
                    if ($scope.step == 2) {
                        $scope.applySelection()
                        $scope.updateSel()
                        var newName = "Facet"
                        if ($scope.selectedArea.name !== undefined) newName += ' (' + $scope.selectedArea.name + ')'
                        BiocacheService.newLayer({
                            q: $scope.sel,
                            bs: SpatialPortalConfig.biocacheServiceUrl,
                            ws: SpatialPortalConfig.biocacheUrl
                        }, $scope.selectedArea.area, newName).then(function (data) {
                            MapService.add(data)
                        })

                        $uibModalInstance.close(data);
                    } else {
                        $scope.step = $scope.step + 1
                    }
                };

                $scope.back = function () {
                    if ($scope.step > 1) {
                        $scope.step = $scope.step - 1
                    }
                };

                $scope.isDisabled = function () {
                    if ($scope.step == 1) {
                        return $scope.selectedArea.area.length == 0
                    } else if ($scope.step == 2) {
                        return false
                    }
                }

                $scope.nextPage = function () {
                    $scope.applySelection()
                    if ($scope.offset + $scope.pageSize < $scope.max) {
                        $scope.offset += $scope.pageSize
                        $scope.updateFacet()
                    }
                }

                $scope.previousPage = function () {
                    $scope.applySelection()
                    if ($scope.offset > 0) {
                        $scope.offset -= $scope.pageSize
                        $scope.updateFacet()
                    }
                }

                $scope.resetFacet = function () {
                    $scope.offset = 0
                    $scope.clearSelection()
                    $scope.updateFacet()
                }

                $scope.clearFilter = function () {
                    $scope.facetFilter = '';
                    $scope.offset = 0
                    $scope.updateFacet()
                }

                $scope.updateFacet = function () {
                    $scope.applySelection()

                    var qid = "*:*"
                    if ($scope.facetFilter.length > 0) {
                        qid = $scope.facet + ":*" + $scope.facetFilter + "*"
                    }
                    var pageSize = 10
                    var offset = $scope.offset
                    BiocacheService.facetGeneral($scope.facet, {
                        qid: qid,
                        bs: SpatialPortalConfig.biocacheServiceUrl
                    }, pageSize, offset).then(function (data) {
                        if (data.length > 0) {
                            $scope.facetList = data[0].fieldResult
                            $scope.max = data[0].count
                            $scope.maxPages = Math.ceil($scope.max / (1.0 * $scope.pageSize))
                        } else {
                            $scope.max = 0
                            $scope.facetList = []
                            $scope.maxPages = 0
                        }
                        $scope.updateSel()
                        $scope.updateCheckmarks()
                    })
                }

                $scope.clearSelection = function () {
                    for (var i = 0; i < $scope.facetList.length; i++) {
                        $scope.facetList[i].selected = false
                    }
                    $scope.selection = []
                    $scope.updateSel()
                }

                $scope.applySelection = function () {
                    for (var i = 0; i < $scope.facetList.length; i++) {
                        if ($scope.facetList[i].selected) {
                            var found = false
                            for (var k in $scope.selection) {
                                if ($scope.selection[k].fq == $scope.facetList[i].fq) {
                                    found = true
                                }
                            }
                            if (!found) $scope.selection.push($scope.facetList[i])
                        } else {
                            for (var k in $scope.selection) {
                                if ($scope.selection[k].fq == $scope.facetList[i].fq) {
                                    $scope.selection.splice(k, 1)
                                }
                            }
                        }
                    }
                }

                $scope.updateCheckmarks = function () {
                    for (var i = 0; i < $scope.facetList.length; i++) {
                        var found = false
                        for (var k in $scope.selection) {
                            if ($scope.selection[k].fq == $scope.facetList[i].fq) {
                                found = true
                            }
                        }
                        if (found) $scope.facetList[i].selected = true
                    }
                }

                $scope.updateSel = function () {
                    var sel = ''
                    var invert = false
                    var count = 0
                    for (var i = 0; i < $scope.selection.length; i++) {
                        var fq = $scope.selection[i].fq
                        if (fq.startsWith('-') && (fq.endsWith(':*') || fq.endsWith('[* TO *]'))) {
                            invert = true
                        }
                        count++
                    }
                    if (count == 1) invert = false
                    for (var i = 0; i < $scope.selection.length; i++) {
                        var fq = $scope.selection[i].fq

                        if (invert) {
                            if (sel.length > 0) sel += " AND "
                            if (fq.startsWith('-') && (fq.endsWith(':*') || fq.endsWith('[* TO *]'))) {
                                sel += fq.substring(1)
                            } else {
                                sel += '-' + fq
                            }
                        } else {
                            if (sel.length > 0) sel += " OR "
                            sel += fq
                        }
                    }
                    if (invert) {
                        sel = '-(' + sel + ')'
                    }

                    if (sel.length == 0) {
                        $scope.sel = ''
                    } else {
                        $scope.sel = sel //encodeURIComponent(sel)
                    }
                }
            }])
}(angular));