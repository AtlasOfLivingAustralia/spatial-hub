(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name selectSpecies
     * @description
     *    Species selection control
     */
    angular.module('select-species-directive', ['map-service', 'lists-service'])
        .directive('selectSpecies', ['MapService', 'ListsService', '$timeout', 'LayoutService', 'DoiService', 'UrlParamsService',
            function (MapService, ListsService, $timeout, LayoutService, DoiService, UrlParamsService) {

                return {
                    scope: {
                        _custom: '&onCustom',
                        _selectedQ: '=selectedQ',
                        _inputData: '=inputData',
                        _uniqueId: '=uniqueId',
                        _includeLayers: '=?includeLayers',
                        _min: '=?min',
                        _areaIncludes: '=?areaIncludes',
                        _spatialValidity: '=?spatialValidity',
                        _speciesOption: '=?speciesOption',
                        _absentOption: '=?absentOption',
                        _canAddSpecies: '=?canAddSpecies',
                        _dateRangeOption: '=?dateRangeOption'
                    },
                    templateUrl: '/spApp/selectSpeciesCtrl.htm',
                    link: function (scope, element, attrs) {

                        //defaults
                        if (scope._min === undefined) scope._min = 1;
                        if (scope._includeLayers === undefined) scope._includeLayers = true;
                        if (scope._areaIncludes === undefined) scope._areaIncludes = false;
                        if (scope._spatialValidity === undefined) scope._spatialValidity = false;
                        if (scope._dateRangeOption === undefined) scope._dateRangeOption = true;
                        if (scope._speciesOption === undefined) {
                            scope._speciesOptionMandatory = false;
                            scope._speciesOption = 'searchSpecies';
                        } else {
                            //when speciesOption is defined do not replace selection
                            scope._speciesOptionMandatory = true;
                        }
                        if (scope._absentOption === undefined) scope._absentOption = true;
                        if (scope._canAddSpecies === undefined) scope._canAddSpecies = true;

                        scope.spatiallyValid = true;
                        scope.spatiallySuspect = false;
                        scope.includeExpertDistributions = scope._areaIncludes;
                        scope.includeChecklists = scope._areaIncludes;
                        scope.includeAnimalMovement = scope._areaIncludes;

                        scope.dateRange = {fq: []};
                        scope.prevDateRange = [];

                        scope.includeAbsences = false;

                        if (scope._inputData !== undefined && scope._inputData.speciesOption !== undefined) {
                            scope.speciesOption = scope._inputData.speciesOption
                        } else {
                            scope.speciesOption = scope._speciesOption;
                        }

                        scope.multiselect = false;
                        if (scope._selectedQ === undefined) {
                            scope._selectedQ = {q: [], bs: null, ws: null, name: ''}
                        } else if (scope._selectedQ instanceof Array) {
                            scope.multiselect = true;
                        }

                        scope.lifeformQ = {q: [], name: ''};

                        scope.multiNewQ = {q: [], name: ''};

                        scope.sandboxName = '';
                        scope.speciesListName = '';
                        scope.doiEnabled = DoiService.isEnabled();

                        LayoutService.addToSave(scope);

                        scope.speciesLayers = scope._includeLayers ? MapService.speciesLayers() : [];
                        if (!scope._speciesOptionMandatory &&
                            (scope._inputData === undefined || scope._inputData.speciesOption === undefined) &&
                            scope.speciesOption === 'searchSpecies' && scope.speciesLayers.length > 0) {
                            scope.speciesOption = scope.speciesLayers[0].uid;
                        }

                        scope.openSandbox = function () {
                            $timeout(function () {
                                LayoutService.openModal('sandBox', {
                                    setQ: scope.setSandboxQ,
                                    display: {size: 'full'}
                                }, true, true)
                            }, 0)
                        };

                        scope.setSandboxQ = function (query) {
                            scope.setQ(query);

                            scope.sandboxName = query.name
                        };

                        scope.openSpeciesList = function () {
                            $timeout(function () {
                                LayoutService.openModal('createSpeciesList', {setQ: scope.setSpeciesListQ}, true)
                            }, 0)
                        };

                        scope.setSpeciesListQ = function (query) {
                            scope.setQ(query);

                            scope.speciesListName = query.name
                        };

                        scope.sandboxEnabled = function () {
                            return $SH.sandboxUrl !== '';
                        };

                        scope.listsEnabled = function () {
                            return $SH.listsUrl !== '';
                        };

                        scope.addSpecies = function () {
                            LayoutService.openModal('tool', {processName: 'ToolAddSpeciesService'})
                        };

                        scope.setQ = function (query) {
                            var selection = scope._selectedQ;

                            if (query && query.q && query.q.length === 0) {
                                // clear the selection
                                if (!scope.multiselect) {
                                    selection.name = '';
                                    selection.bs = undefined;
                                    selection.ws = undefined;
                                    selection.q = [];
                                    selection.wkt = undefined;
                                    selection.qid = undefined;
                                    selection.species_list = undefined;
                                    selection.layerUid = undefined;
                                } else {
                                    scope.clearQ();
                                }
                            } else if (selection) {
                                // set the selection

                                if (query === undefined || query.q === undefined) {
                                    // input query is missing, try with the _selectedQ
                                    if (scope.multiselect) {
                                        scope.clearQ();
                                    } else if (scope._selectedQ !== undefined) {
                                        scope.setQ(scope._selectedQ)
                                    } else {
                                        scope.clearQ()
                                    }
                                    return
                                }

                                // only update multiNewQ when this is a multiselect
                                if (scope.multiselect) {
                                    selection = scope.multiNewQ;
                                }

                                // apply spatial validity options
                                var includeTrue = scope.spatiallyValid;
                                var includeFalse = scope.spatiallySuspect;
                                var gs = ["-*:*"];
                                if (includeTrue && !includeFalse) {
                                    gs = ["geospatial_kosher:true"]
                                } else if (!includeTrue && includeFalse) {
                                    gs = ["geospatial_kosher:false"]
                                } else if (includeTrue && includeFalse) {
                                    gs = ["geospatial_kosher:*"]
                                }
                                // exclude duplicates
                                if (query.q.indexOf(gs[0]) >= 0) gs = []

                                // apply exclude absent option
                                var absent = [$SH.fqExcludeAbsent];
                                if (scope.includeAbsences || query.q.indexOf(absent[0]) >= 0) {
                                    // exclude duplicates
                                    absent = []
                                }

                                // remove previous date range option
                                for (var dr in scope.prevDateRange) {
                                    var pos = query.q.indexOf(scope.prevDateRange[dr])
                                    if (pos >= 0) query.q.splice(pos, 1)
                                }
                                // apply date range option
                                var dateRange = angular.merge([], scope.dateRange.fq);
                                // exclude duplicates
                                for (var dr in dateRange) {
                                    if (query.q.indexOf(dateRange[dr]) >= 0) dateRange.splice(dr, 1)
                                }
                                scope.prevDateRange = angular.merge([], dateRange);

                                selection.species_list = query.species_list;
                                selection.wkt = query.wkt;

                                selection.includeAnimalMovement = scope.includeAnimalMovement;
                                selection.includeExpertDistributions = scope.includeExpertDistributions;
                                selection.q = query.q.concat(gs).concat(absent).concat(dateRange);

                                if (absent.length == 0 && gs.length == 0 && dateRange.length == 0) {
                                    // qid did not change
                                    selection.qid = query.qid
                                } else {
                                    // qid changed
                                    selection.qid = undefined
                                }

                                selection.name = query.name;
                                selection.bs = query.bs;
                                selection.ws = query.ws;
                                if (selection.bs === undefined) scope._selectedQ.bs = $SH.biocacheServiceUrl;
                                if (selection.ws === undefined) scope._selectedQ.ws = $SH.biocacheUrl;

                                selection.layerUid = query.layerUid;

                                // update the total selection when this is a multiselect
                                if (scope.multiselect) {
                                    scope.updateMultiSelection()
                                }
                            }
                        };

                        scope.setLifeformQ = function (query) {
                            scope.lifeformQ = query;
                            scope.setQ(query)

                        };

                        scope.clearQ = function () {
                            if (scope.multiselect) {
                                scope.multiNewQ = {q: [], name: ''};
                                scope.updateMultiSelection();
                            } else {
                                scope.setQ({q: [], name: ''});
                                scope.sandboxName = '';
                                scope.speciesListName = ''
                            }
                        };

                        scope.changeOption = function (option) {
                            scope.speciesOption = option;
                            if (scope.speciesOption === 'none') {
                                scope.clearQ();
                            } else if (scope.speciesOption === 'lifeform') {
                                scope.setQ(scope.lifeformQ)
                            } else if (scope.speciesOption === 'allSpecies') {
                                scope.setQ({
                                    q: ["*:*"], name: $i18n(244, "All species"), bs: $SH.biocacheServiceUrl,
                                    ws: $SH.biocacheUrl
                                })
                            } else if (scope.speciesOption === 'searchSpecies') {
                                scope.clearQ();

                            } else if (scope.speciesOption === 'importList') {
                                scope.clearQ();
                                scope.openSpeciesList()
                            } else if (scope.speciesOption === 'speciesList') {
                                scope.clearQ()

                            } else if (scope.speciesOption === 'importPoints') {
                                scope.clearQ();
                                scope.openSandbox()
                            } else if (scope.speciesOption === 'sandboxPoints') {
                                scope.clearQ()

                            } else if (MapService.getLayer(scope.speciesOption)) {
                                scope.clearQ();
                                var layer = MapService.getFullLayer(scope.speciesOption);
                                scope.setQ(scope.layerToQuery(layer))
                            }
                        };

                        /**
                         * update _selectedQ to reflect any checked layer as well as the new species selection
                         */
                        scope.updateMultiSelection = function () {
                            if (scope._selectedQ.length > 0) {
                                scope._selectedQ.splice(0, scope._selectedQ.length)
                            }
                            $.each(scope.speciesLayers, function (i, item) {
                                if (item.checked) {
                                    var layer = MapService.getFullLayer(item.uid);

                                    scope._selectedQ.push(scope.layerToQuery(layer))
                                }
                            });
                            if (scope.multiNewQ.q.length > 0) {
                                scope._selectedQ.push(scope.multiNewQ)
                            }
                        };

                        scope.layerToQuery = function (layer) {
                            var q = layer.q;
                            if (!(q instanceof Array)) q = [q]

                            var query = {
                                name: layer.name,
                                bs: layer.bs,
                                ws: layer.ws,
                                q: q,
                                species_list: layer.species_list,
                                wkt: layer.wkt,
                                qid: layer.qid,
                                layerUid: layer.uid
                            };

                            if (query.bs === undefined) query.bs = $SH.biocacheServiceUrl;
                            if (query.ws === undefined) query.ws = $SH.biocacheUrl;

                            return query;
                        };

                        scope.doiSelected = function(doi) {
                            var url = DoiService.getQueryUrl(doi);
                            if (url) {
                                var searchParams = UrlParamsService.parseSearchParams(url);
                                var queryParams = DoiService.buildQueryFromDoi(doi, searchParams);
                                scope.setQ(queryParams);
                            }
                            else {
                                // This shouldn't happen as dois without a URL will be filtered out by the search process.
                                bootbox.alert("No data was able to be extracted from the selected DOI");
                            }
                        };

                        scope.isLoggedIn = $SH.userId !== undefined && $SH.userId !== null && $SH.userId.length > 0;
                        scope.isNotLoggedIn = !scope.isLoggedIn;

                        if (!scope.multiselect) {
                            if (scope._selectedQ.selectOption) {
                                scope.changeOption(scope._selectedQ.selectOption)
                            } else if (scope._min === 0) {
                                scope.speciesOption = 'none'
                            } else if (!scope._speciesOptionMandatory &&
                                (scope._inputData === undefined || scope._inputData.speciesOption === undefined) &&
                                scope.speciesLayers.length > 0) {
                                scope.changeOption(scope.speciesLayers[0].uid)
                            } else if (scope._min > 0) {
                                // select existing layer if layerUid matches and return immediately
                                if (scope._selectedQ.layerUid !== undefined) {
                                    for (var i = 0; i < scope.speciesLayers.length; i++) {
                                        // not all species layers must have a qid
                                        if (scope.speciesLayers[i].uid === scope._selectedQ.layerUid) {
                                            scope.speciesOption = scope.speciesLayers[i].uid;
                                            scope.changeOption()
                                            return;
                                        }
                                    }
                                }

                                // select existing layer if selectedQ matches
                                if (scope._selectedQ.q.length > 0) {
                                    for (var i = 0; i < scope.speciesLayers.length; i++) {
                                        var layer = scope.speciesLayers[i];

                                        var selectThis = false;

                                        // not all species layers must have a qid
                                        if (layer.qid !== undefined && layer.qid == scope._selectedQ.qid) {
                                            selectThis = true
                                        } else {
                                            var query = scope.layerToQuery(layer)

                                            if (scope.speciesLayers[i].name === scope._selectedQ.name &&
                                                scope.speciesLayers[i].bs === scope._selectedQ.bs &&
                                                query.q.length === scope._selectedQ.q.length) {
                                                //check q
                                                var match = 0;
                                                for (var j = 0; j < q.length; j++) {
                                                    if (q[j] === scope._selectedQ.q[j]) {
                                                        match++
                                                    }
                                                }
                                                if (match === q.length &&
                                                    layer.wkt === scope._selectedQ.wkt) {
                                                    selectThis = true
                                                }
                                            }
                                        }

                                        if (selectThis) {
                                            scope.speciesOption = scope.speciesLayers[i].uid;
                                            scope.changeOption()
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            }])
}(angular));