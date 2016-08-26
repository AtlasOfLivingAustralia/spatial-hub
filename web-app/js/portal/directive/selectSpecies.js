(function (angular) {
    'use strict';
    angular.module('select-species-directive', ['map-service'])
        .directive('selectSpecies', ['MapService', '$timeout', '$rootScope',
            function (MapService, $timeout, $rootScope) {

                return {
                    scope: {
                        custom: '&onCustom',
                        selectedQ: '=selectedQ',
                    },
                    templateUrl: 'portal/' + 'selectSpeciesCtrl.html',
                    link: function (scope, element, attrs) {

                        scope.name = 'selectSpecies'

                        scope.spatiallyValid = $rootScope.getValue(scope.name, 'spatiallyValid', true);
                        scope.spatiallySuspect = $rootScope.getValue(scope.name, 'spatiallySuspect', false);
                        scope.useScientificNames = $rootScope.getValue(scope.name, 'useScientificNames', false);
                        scope.includeExpertDistributions = $rootScope.getValue(scope.name, 'includeExpertDistributions', true);
                        scope.speciesOption = $rootScope.getValue(scope.name, 'speciesOption', 'searchSpecies');

                        scope.selectedQ.q = $rootScope.getValue(scope.name, 'q', [])
                        scope.selectedQ.name = $rootScope.getValue(scope.name, 'name', '')

                        $rootScope.addToSave(scope)

                        scope.openSpeciesList = function () {
                            $timeout(function () {
                                $rootScope.openIframe(ListsService.url() + '', 'Import species list', 'Import species list and close this window when successful.')
                            }, 0)
                        }

                        scope.openSandbox = function () {
                            $timeout(function () {
                                $rootScope.openIframe(SpatialPortalConfig.sandboxServiceUrl, 'Import points', 'Use the sandbox to import points and close this window when successful.')
                            }, 0)
                        }


                        scope.setQ = function (query) {
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
                        }

                        scope.clearQ = function () {
                            scope.setQ({q: [], name: ''})
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
                            } else if (scope.speciesOption == 'speciesList') {
                                scope.clearQ()
                            } else if (scope.speciesOption == 'importPoints') {
                                scope.clearQ()
                            } else if (scope.speciesOption == 'sandboxPoints') {
                                scope.clearQ()
                            }
                        }
                    }
                }

            }])
}(angular));