(function (angular) {
    'use strict';
    angular.module('select-facet-directive', ['map-service', 'predefined-areas-service'])
        .directive('selectFacet', ['$http', 'MapService', 'PredefinedAreasService', '$timeout', 'FacetAutoCompleteService', 'BiocacheService',
            'LayoutService', function ($http, MapService, PredefinedAreasService, $timeout, FacetAutoCompleteService, BiocacheService, LayoutService) {

                return {
                    templateUrl: '/spApp/selectFacetCtrl.htm',
                    scope: {
                        _selectedFacet: '=selectedFacet',
                        _uniqueId: '=uniqueId'
                    },
                    link: function (scope, element, attrs) {

                        scope.facet = {};
                        scope.facets = [];
                        scope.facetList = [];

                        FacetAutoCompleteService.search("-*:*").then(function (data) {
                            scope.facets = data
                        });

                        scope.pageSize = 10;
                        scope.offset = 0;
                        scope.max = 0;
                        scope.maxPages = 0;

                        scope.updating = false;
                        scope.updatingPage = false;
                        scope.downloadSize = 0;

                        scope.facetFilter = '';

                        LayoutService.addToSave(scope);

                        scope.ok = function (data) {
                            if (scope.step === 2) {
                                scope.applySelection();
                                scope.updateSel();

                            } else {
                                scope.step = scope.step + 1
                            }
                        };

                        scope.nextPage = function () {
                            scope.applySelection();
                            if (scope.offset + scope.pageSize < scope.max) {
                                scope.offset += scope.pageSize;
                                scope.updatePage()
                            }
                        };

                        scope.previousPage = function () {
                            scope.applySelection();
                            if (scope.offset > 0) {
                                scope.offset -= scope.pageSize;
                                scope.updatePage()
                            }
                        };

                        scope.resetFacet = function () {
                            scope.offset = 0;
                            scope.clearSelection();
                            scope.updateFacet()
                        };

                        scope.clearFilter = function () {
                            scope.facetFilter = '';
                            scope.offset = 0;
                            scope.updatePage()
                        };


                        scope.updateFacet = function () {
                            scope.update(true);
                        };

                        scope.updatePage = function () {
                            scope.update(false);
                        };

                        scope.update = function (updateAll) {
                            if (updateAll) {
                                scope.updating = true;
                            } else {
                                scope.updatingPage = true;
                            }

                            var config = {
                                eventHandlers: {
                                    progress: function (c) {
                                        scope.downloadSize = c.loaded
                                    }
                                }
                            };

                            scope.applySelection();

                            var qid = "*:*";
                            if (scope.facetFilter.length > 0) {
                                qid = scope.facet + ":*" + scope.facetFilter + "*"
                            }
                            var pageSize = 10;
                            var offset = scope.offset;
                            BiocacheService.facetGeneral(scope.facet, {
                                qid: qid,
                                bs: $SH.biocacheServiceUrl
                            }, pageSize, offset, config).then(function (data) {
                                if (data.length > 0) {
                                    scope.facetList = data[0].fieldResult;
                                    scope.max = data[0].count;
                                    scope.maxPages = Math.ceil(scope.max / scope.pageSize)
                                } else {
                                    scope.max = 0;
                                    scope.facetList = [];
                                    scope.maxPages = 0
                                }
                                scope.updateSel();
                                scope.updateCheckmarks();

                                scope.updating = false;
                                scope.updatingPage = false;
                            })
                        };

                        scope.clearSelection = function () {
                            for (var i = 0; i < scope.facetList.length; i++) {
                                scope.facetList[i].selected = false
                            }
                            scope.selection = [];
                            scope.updateSel()
                        };

                        scope.applySelection = function () {
                            for (var i = 0; i < scope.facetList.length; i++) {
                                if (scope.facetList[i].selected) {
                                    var found = false;
                                    for (var k in scope.selection) {
                                        if (scope.selection[k].fq === scope.facetList[i].fq) {
                                            found = true
                                        }
                                    }
                                    if (!found) scope.selection.push(scope.facetList[i])
                                } else {
                                    for (k in scope.selection) {
                                        if (scope.selection[k].fq === scope.facetList[i].fq) {
                                            scope.selection.splice(Number(k), 1)
                                        }
                                    }
                                }
                            }

                            scope.updateSel()
                        };

                        scope.updateCheckmarks = function () {
                            for (var i = 0; i < scope.facetList.length; i++) {
                                var found = false;
                                for (var k in scope.selection) {
                                    if (scope.selection[k].fq === scope.facetList[i].fq) {
                                        found = true
                                    }
                                }
                                if (found) scope.facetList[i].selected = true
                            }
                        };

                        scope.updateSel = function () {
                            var sel = '';
                            var invert = false;
                            var count = 0;
                            for (var i = 0; i < scope.selection.length; i++) {
                                var fq = scope.selection[i].fq;
                                if (fq.startsWith('-') && (fq.endsWith(':*') || fq.endsWith('[* TO *]'))) {
                                    invert = true
                                }
                                count++
                            }
                            if (count === 1) invert = false;
                            for (i = 0; i < scope.selection.length; i++) {
                                fq = scope.selection[i].fq;

                                if (invert) {
                                    if (sel.length > 0) sel += " AND ";
                                    if (fq.startsWith('-') && (fq.endsWith(':*') || fq.endsWith('[* TO *]'))) {
                                        sel += fq.substring(1)
                                    } else {
                                        sel += '-' + fq
                                    }
                                } else {
                                    if (sel.length > 0) sel += " OR ";
                                    sel += fq
                                }
                            }
                            if (invert) {
                                sel = '-(' + sel + ')'
                            }

                            if (sel.length === 0) {
                                scope._selectedFacet = ''
                            } else {
                                scope._selectedFacet = sel
                            }
                        }
                    }
                }

            }])
}(angular));