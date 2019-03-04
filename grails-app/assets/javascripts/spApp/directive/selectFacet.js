(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name selectFacet
     * @description
     *   Facet selection controls
     */
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
                        scope.exportUrl = null;


                        FacetAutoCompleteService.search(BiocacheService.newQuery(["-*:*"])).then(function (data) {
                            scope.facets = data
                        });

                        scope.pageSize = 10;
                        scope.offset = 0;
                        scope.max = 0;
                        scope.maxPages = 0;

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
                            scope.updatingPage = true;

                            var config = {
                                eventHandlers: {
                                    progress: function (c) {
                                        scope.downloadSize = c.loaded
                                    }
                                }
                            };

                            scope.applySelection();

                            var qid = ["*:*"];
                            var pageSize = 10;
                            var offset = scope.offset;
                            BiocacheService.facetGeneral(scope.facet, {
                                qid: qid,
                                bs: $SH.biocacheServiceUrl
                            }, pageSize, offset, scope.facetFilter, config).then(function (data) {
                                if (data.length > 0) {
                                    scope.facetList = data[0].fieldResult;
                                    scope.exportUrl = BiocacheService.facetDownload(scope.facet);
                                    scope.max = data[0].count;
                                    scope.maxPages = Math.ceil(scope.max / scope.pageSize)
                                } else {
                                    scope.max = 0;
                                    scope.facetList = [];
                                    scope.maxPages = 0
                                }
                                scope.updateSel();
                                scope.updateCheckmarks();

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
                                if (fq.match(/^-/g) != null && (fq.match(/:\*$/g) != null || fq.match(/\[\* TO \*\]$/g) != null)) {
                                    invert = true
                                }
                                count++
                            }
                            if (count === 1) invert = false;
                            for (i = 0; i < scope.selection.length; i++) {
                                fq = scope.selection[i].fq;

                                if (invert) {
                                    if (sel.length > 0) sel += " AND ";
                                    if (fq.match(/^-/g) != null && (fq.match(/:\*$/g) != null || fq.match(/\[\* TO \*\]$/g) != null)) {
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