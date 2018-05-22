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
        .directive('selectSpecies', ['MapService', 'ListsService', '$timeout', 'LayoutService',
            function (MapService, ListsService, $timeout, LayoutService) {

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
                        _absentOption: '=?absentOption'
                    },
                    templateUrl: '/spApp/selectSpeciesCtrl.htm',
                    link: function (scope, element, attrs) {

                        //defaults
                        if (scope._min === undefined) scope._min = 1;
                        if (scope._includeLayers === undefined) scope._includeLayers = true;
                        if (scope._areaIncludes === undefined) scope._areaIncludes = false;
                        if (scope._spatialValidity === undefined) scope._spatialValidity = false;
                        if (scope._speciesOption === undefined) {
                            scope._speciesOptionMandatory = false;
                            scope._speciesOption = 'searchSpecies';
                        } else {
                            //when speciesOption is defined do not replace selection
                            scope._speciesOptionMandatory = true;
                        }
                        if (scope._absentOption === undefined) scope._absentOption = true;

                        scope.spatiallyValid = true;
                        scope.spatiallySuspect = false;
                        scope.includeExpertDistributions = scope._areaIncludes;
                        scope.includeChecklists = scope._areaIncludes;
                        scope.includeAnimalMovement = scope._areaIncludes;

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

                        scope.sandboxName = '';
                        scope.speciesListName = '';

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

                        scope.setMultiQ = function (query, checked) {
                            var q = {name: '', bs: undefined, ws: undefined, q: []};
                            if (query.q.length > 0) {
                                if (checked) {
                                    q.name = query.name;
                                    q.q = query.q;
                                    if (q.bs === undefined) q.bs = $SH.biocacheServiceUrl;
                                    if (q.ws === undefined) q.ws = $SH.biocacheUrl;
                                    scope._selectedQ.push(q);
                                } else {
                                    for (var k in scope._selectedQ) {
                                        if (scope.compareQ(scope._selectedQ.q, query.q)) {
                                            scope._selectedQ.splice(k, 1);
                                            return;

                                        }
                                    }
                                }
                            }
                        };

                        scope.sandboxEnabled = function () {
                            return $SH.sandboxUrl !== '';
                        };

                        scope.addSpecies = function () {
                            LayoutService.openModal('tool', {processName: 'ToolAddSpeciesService'})
                        };

                        scope.compareQ = function (q1, q2) {
                            for (var k in q1) {
                                if (q1[k] !== q2[k]) {
                                    return false;
                                }
                            }
                            return true;
                        };

                        scope.setQ = function (query) {
                            if (query && query.q.length === 0) {
                                scope._selectedQ.name = '';
                                scope._selectedQ.bs = undefined;
                                scope._selectedQ.ws = undefined;
                                scope._selectedQ.q = []
                            } else if (scope._selectedQ) {
                                if (query === undefined) query = scope._selectedQ;
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

                                var absent = ["-occurrence_status_s:absent"];
                                if (scope.includeAbsences) {
                                    absent = []
                                }

                                if (query.species_list) {
                                    scope._selectedQ.species_list = query.species_list
                                }

                                scope._selectedQ.includeAnimalMovement = scope.includeAnimalMovement;
                                scope._selectedQ.includeExpertDistributions = scope.includeExpertDistributions;
                                scope._selectedQ.q = query.q.concat(gs).concat(absent);
                                scope._selectedQ.name = query.name;
                                scope._selectedQ.bs = query.bs;
                                scope._selectedQ.ws = query.ws;
                                if (scope._selectedQ.bs === undefined) scope._selectedQ.bs = $SH.biocacheServiceUrl;
                                if (scope._selectedQ.ws === undefined) scope._selectedQ.ws = $SH.biocacheUrl
                            }
                        };

                        scope.clearQ = function () {
                            scope.setQ({q: [], name: ''});
                            scope.sandboxName = '';
                            scope.speciesListName = ''
                        };

                        scope.changeOption = function (option) {
                            scope.speciesOption = option;
                            if (scope.speciesOption === 'none') {
                                scope.clearQ();
                            } else if (scope.speciesOption === 'allSpecies') {
                                scope.setQ({
                                    q: ["*:*"], name: 'All species', bs: $SH.biocacheServiceUrl,
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
                                var q = [layer.q];
                                if (layer.fq !== undefined && layer.fq != null && layer.fq.length > 0) q = q.concat(layer.fq);
                                scope.setQ({q: q, bs: layer.bs, ws: layer.ws, name: layer.name})
                            }
                        };

                        scope.toggleQ = function (idx) {
                            var item = scope.speciesLayers[idx];
                            var layer = MapService.getFullLayer(item.uid);
                            var q = [layer.q];
                            if (layer.fq !== undefined && layer.fq.length > 0) q = q.concat(layer.fq);
                            scope.setMultiQ({q: q, bs: layer.bs, ws: layer.ws, name: layer.name}, item.checked);
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
                                // select existing layer if selectedQ matches
                                if (scope._selectedQ.q.length > 0) {
                                    for (var i = 0; i < scope.speciesLayers.length; i++) {
                                        var layer = scope.speciesLayers[i];
                                        var q = [layer.q];

                                        if (layer.fq !== undefined && layer.fq.length > 0) q = q.concat(layer.fq);

                                        if (scope.speciesLayers[i].name === scope._selectedQ.name &&
                                            scope.speciesLayers[i].bs === scope._selectedQ.bs &&
                                            q.length === scope._selectedQ.q.length) {
                                            //check q
                                            var match = 0;
                                            for (var j = 0; j < q.length; j++) {
                                                if (q[j] === scope._selectedQ.q[j]) {
                                                    match++
                                                }
                                            }
                                            if (match === q.length) {
                                                scope.speciesOption = scope.speciesLayers[i].uid
                                                scope.changeOption()
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            }])
}(angular));