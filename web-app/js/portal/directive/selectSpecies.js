(function (angular) {
    'use strict';
    angular.module('select-species-directive', ['map-service', 'lists-service'])
        .directive('selectSpecies', ['MapService', 'ListsService', '$timeout', '$rootScope',
            function (MapService, ListsService, $timeout, $rootScope, dialogConfig) {

                return {
                    scope: {
                        custom: '&onCustom',
                        selectedQ: '=selectedQ',
                        preselectedSpeciesOption: '=preselectedSpeciesOption'
                    },
                    templateUrl: 'portal/' + 'selectSpeciesCtrl.html',
                    link: function (scope, element, attrs) {

                        scope.name = 'selectSpecies'
                        scope.showAutoComplete = true
                        scope.spatiallyValid = $rootScope.getValue(scope.name, 'spatiallyValid', true);
                        scope.spatiallySuspect = $rootScope.getValue(scope.name, 'spatiallySuspect', false);
                        scope.useScientificNames = $rootScope.getValue(scope.name, 'useScientificNames', false);
                        scope.includeExpertDistributions = $rootScope.getValue(scope.name, 'includeExpertDistributions', true);

                        if(!scope.preselectedSpeciesOption){
                            if ($rootScope.importOpt == 'importSpecies') {
                                scope.speciesOption = $rootScope.getValue(scope.name, 'speciesOption', 'importList');
                            } else {
                                scope.speciesOption = $rootScope.getValue(scope.name, 'speciesOption', 'searchSpecies');
                            }
                        } else {
                            scope.speciesOption = scope.preselectedSpeciesOption
                        }

                        if(scope.selectedQ && scope.selectedQ.name && scope.selectedQ.q){
                            scope.predefinedQ = scope.selectedQ
                            scope.showAutoComplete = false
                        } else {
                            scope.selectedQ.q = $rootScope.getValue(scope.name, 'q', []);
                            scope.selectedQ.name = $rootScope.getValue(scope.name, 'name', '');

                        }

                        $rootScope.addToSave(scope);

                        scope.importOpt = $rootScope.importOpt;

                        scope.importUseListOpt = "false";

                        if (scope.importOpt == 'importSpecies') {
                            scope.importUseListOpt = "true";
                        }

                        scope.addNewSpecies = function (newListName, newListDescription, newItems, makePrivate) {
                            ListsService.newSpecies(newListName, newListDescription, newItems, makePrivate).then(function (resp) {
                                if (resp.status == 200) {
                                    //bootbox.alert("Successfully created new species list.<br><br>Status code:" + resp.status + "<br>" + resp.data.message)
                                    if (scope.importOpt == 'importSpecies') {
                                       // var selectedItems = ListsService.items(resp.data.druid);
                                       // ListsService.setCache(selectedItems)
                                        ListsService.setCache(resp.data.druid);
                                        scope.importUseListOpt = false;
                                      //  scope.selectedQ.q = setQ(q)
                                    }
                                    scope.speciesOption = 'speciesList';
                                    scope.changeOption();

                                } else {
                                    bootbox.alert("Error in creating new species.<br><br>Status code: " + resp.status + "<br>" +  resp.data.error)
                                }
                            })
                        };

                        scope.uploadCSV = function(newListName, newListDescription, makePrivate){
                            var f = document.getElementById('file').files[0],
                              r = new FileReader();
                            r.onloadend = function(e){
                                var data = e.target.result;
                                var items = data.split('\n');
                                var filteredItems = items.filter(function(e){return e})
                                scope.addNewSpecies(newListName, newListDescription, filteredItems, makePrivate)
                            }
                            r.readAsBinaryString(f);
                        };

                        scope.openSandbox = function () {
                            $timeout(function () {
                                $rootScope.openIframe(SpatialPortalConfig.sandboxServiceUrl, 'Import points', 'Use the sandbox to import points and close this window when successful.')
                            }, 0)
                        };


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
                            } else if(scope.speciesOption == 'selectedSpecies'){
                                scope.setQ(scope.predefinedQ)
                            }
                        }
                    }
                }

            }])
}(angular));