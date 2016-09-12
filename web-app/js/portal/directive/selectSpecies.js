(function (angular) {
    'use strict';
    angular.module('select-species-directive', ['map-service', 'lists-service'])
        .directive('selectSpecies', ['MapService', 'ListsService', '$timeout', '$rootScope',
            function (MapService, ListsService, $timeout, $rootScope) {

                return {
                    scope: {
                        custom: '&onCustom',
                        selectedQ: '=selectedQ',
                        inputData: '=inputData'
                    },
                    templateUrl: 'portal/' + 'selectSpeciesCtrl.html',
                    link: function (scope, element, attrs) {

                        scope.name = 'selectSpecies'

                        scope.spatiallyValid = $rootScope.getValue(scope.name, 'spatiallyValid', true);
                        scope.spatiallySuspect = $rootScope.getValue(scope.name, 'spatiallySuspect', false);
                        scope.useScientificNames = $rootScope.getValue(scope.name, 'useScientificNames', false);
                        scope.includeExpertDistributions = $rootScope.getValue(scope.name, 'includeExpertDistributions', true);

                        if (scope.inputData !== undefined && scope.inputData.speciesOption !== undefined) {
                            scope.speciesOption = $rootScope.getValue(scope.name, 'speciesOption', scope.inputData.speciesOption);
                        } else {
                            scope.speciesOption = $rootScope.getValue(scope.name, 'speciesOption', 'searchSpecies');
                        }

                        if (scope.selectedQ === undefined) {
                            scope.selectedQ = {q:[], bs: null, ws: null, name: $rootScope.getValue(scope.name, 'name', '')}
                        }
                        scope.sandboxName = ''
                        scope.speciesListName = ''

                        $rootScope.addToSave(scope);

                        scope.speciesLayers = MapService.speciesLayers()

                        //select existing layer if selectedQ matches
                        if (scope.selectedQ.q.length > 0) {
                            for (var i=0;i<scope.speciesLayers.length;i++) {
                                var layer = scope.speciesLayers[i]
                                var q = [layer.q]
                                if (layer.fq !== undefined && layer.fq.length > 0) q = q.concat(layer.fq)

                                if (scope.speciesLayers[i].name == scope.selectedQ.name &&
                                    scope.speciesLayers[i].bs == scope.selectedQ.bs &&
                                    q.length == scope.selectedQ.q.length) {
                                    //check q
                                    var match = 0
                                    for (var j=0;j<q.length;j++) {
                                        if (q[j] == scope.selectedQ.q[j]) {
                                            match++
                                        }
                                    }
                                    if (match == q.length) {
                                        scope.speciesOption = scope.speciesLayers[i].uid
                                    }
                                }
                            }
                        }

                        scope.openSandbox = function () {
                            $timeout(function () {
                                $rootScope.openModal('sandBox', {setQ: scope.setSandboxQ})
                            }, 0)
                        };

                        scope.setSandboxQ = function (query) {
                            scope.setQ(query)

                            scope.sandboxName = query.name
                        }

                        scope.openSpeciesList = function () {
                            $timeout(function () {
                                $rootScope.openModal('createSpeciesList', {setQ: scope.setSpeciesListQ})
                            }, 0)
                        }

                        scope.setSpeciesListQ = function (query) {
                            scope.setQ(query)

                            scope.speciesListName = query.name
                        }

                        scope.setQ = function (query) {
                            if (query.q.length == 0) {
                                scope.selectedQ.q = []
                                scope.selectedQ.name = ''
                                scope.selectedQ.bs = undefined
                                scope.selectedQ.ws = undefined
                            } else {
                                var includeTrue = scope.spatiallyValid
                                var includeFalse = scope.spatiallySuspect
                                var gs = ["-*:*"]
                                if (includeTrue && !includeFalse) {
                                    gs = ["geospatial_kosher:true"]
                                } else if (!includeTrue && includeFalse) {
                                    gs = ["geospatial_kosher:false"]
                                } else if (includeTrue && includeFalse) {
                                    gs = ["geospatial_kosher:*"]
                                }

                                scope.selectedQ.q = query.q.concat(gs)
                                scope.selectedQ.name = query.name
                                scope.selectedQ.bs = query.bs
                                scope.selectedQ.ws = query.ws
                                if (scope.selectedQ.bs === undefined) scope.selectedQ.bs = SpatialPortalConfig.biocacheServiceUrl
                                if (scope.selectedQ.ws === undefined) scope.selectedQ.ws = SpatialPortalConfig.biocacheUrl
                            }
                        }

                        scope.clearQ = function () {
                            scope.setQ({q: [], name: ''})
                            scope.sandboxName = ''
                            scope.speciesListName = ''
                        }

                        scope.changeOption = function () {
                            if (scope.speciesOption == 'allSpecies') {
                                scope.setQ({
                                    q: ["*:*"], name: 'All species', bs: SpatialPortalConfig.biocacheServiceUrl,
                                    ws: SpatialPortalConfig.biocacheUrl
                                })
                            } else if (scope.speciesOption == 'searchSpecies') {
                                scope.clearQ()
                            } else if (scope.speciesOption == 'importList') {
                                scope.clearQ()
                                scope.openSpeciesList()
                            } else if (scope.speciesOption == 'speciesList') {
                                scope.clearQ()
                            } else if (scope.speciesOption == 'importPoints') {
                                scope.clearQ()
                                scope.openSandbox()
                            } else if (scope.speciesOption == 'sandboxPoints') {
                                scope.clearQ()
                            } else if (MapService.getLayer(scope.speciesOption)) {
                                scope.clearQ()
                                var layer = MapService.getFullLayer(scope.speciesOption)
                                var q = [layer.q]
                                if (layer.fq !== undefined && layer.fq.length > 0) q = q.concat(layer.fq)
                                scope.setQ({q: q, bs: layer.bs, ws: layer.ws, name: layer.name})
                            }


                        }
                    }
                }

            }])
}(angular));