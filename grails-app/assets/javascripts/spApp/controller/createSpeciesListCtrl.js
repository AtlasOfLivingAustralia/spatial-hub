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
 * Created by Temi on 2/09/2016.
 */
(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name CreateSpeciesListCtrl
     * @description
     *   Create a new species list
     */
    angular.module('create-species-list-ctrl', ['map-service', 'biocache-service', 'layers-service'/*, 'ala.sandbox.preview'*/])
        .controller('CreateSpeciesListCtrl', ['$scope', '$controller', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance',
            'BiocacheService', 'LayersService', 'ListsService', 'data', 'BieService',
            function ($scope, $controller, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, LayersService, ListsService, inputData, BieService) {
                LayoutService.addToSave($scope);

                $scope.step = '1';

                $scope.newListName = $i18n('My species list');
                $scope.newListDescription = '';
                $scope.newItems = '';
                $scope.makePrivate = true;

                $scope.selectedQ = {
                    q: []
                };

                $scope.ok = function () {
                    if ($scope.step === '2') {
                        $scope.addNewSpecies()
                    } else {
                        $scope.step = '2'
                    }
                };

                $scope.$watch('file', function () {
                    $scope.uploadCSV();
                });

                $scope.matchedItems = [];

                $scope.parseList = function () {
                    var names = $scope.newItems.replace('\t', '\n').replace(',', '\n').replace(';', '\n').split('\n');
                    BieService.nameLookup(names).then(function (list) {
                        for (var i in list) {
                            if (list.hasOwnProperty(i)) {
                                $scope.getCount(list[i]);

                                $scope.matchedItems.push(list[i])
                            }
                        }
                    })
                };

                $scope.getCount = function (item) {
                    var q = BiocacheService.newQuery(["lsid:" + item.acceptedConceptGuid]);
                    BiocacheService.count(q).then(function (count) {
                        item.count = count
                    })
                };

                $scope.matchedRemove = function (item) {
                    for (var i in $scope.matchedItems) {
                        if ($scope.matchedItems[i] === item) {
                            $scope.matchedItems.splice(i, 1)
                        }
                    }
                };

                $scope.matchedSearch = function (item) {
                    speciesAutoComplete.value = item.searchTerm;
                    $(speciesAutoComplete).keydown();

                    $scope.matchedRemove(item)
                };

                $scope.addQ = function (query) {
                    BieService.guidLookup([query.q[0].replace('lsid:', '')]).then(function (list) {
                        for (var i in list) {
                            if (list.hasOwnProperty(i)) {
                                $scope.getCount(list[i]);

                                $scope.matchedItems.push(list[i])
                            }
                        }
                    });
                    speciesAutoComplete.value = ''
                };

                $scope.matchedGuids = function () {
                    var list = [];
                    for (var i in $scope.matchedItems) {
                        if ($scope.matchedItems[i].acceptedConceptGuid !== undefined) {
                            list.push($scope.matchedItems[i].acceptedConceptGuid)
                        } else if ($scope.matchedItems[i].guid) {
                            list.push($scope.matchedItems[i].guid)
                        }
                    }
                    return list.join(',')
                };

                $scope.addNewSpecies = function () {
                    ListsService.createList($scope.newListName, $scope.newListDescription, $scope.matchedGuids(), $scope.makePrivate).then(function (resp) {
                        if (resp.status === 200) {
                            var json = JSON.parse(resp.data.text);
                            var druid = json.druid;
                            ListsService.items(druid, {max: 1}).then(function(data) {
                                if (data.length === 0) {
                                    bootbox.alert($i18n("No matching species found."))
                                } else {
                                    ListsService.getItemsQ(druid).then(function (data) {
                                        var listIds = data;
                                        var closeLater = false;

                                        $scope.selectedQ = {q: [listIds], name: $scope.newListName};
                                        if (inputData !== undefined && inputData.setQ !== undefined) {
                                            inputData.setQ($scope.selectedQ)
                                        } else {
                                            closeLater = true;
                                            BiocacheService.newLayer(q, undefined, q.name).then(function (data) {
                                                MapService.add(data);
                                                $scope.$close();
                                            });
                                        }
                                        if (!closeLater)
                                            $scope.$close();
                                    })
                                }
                            })
                        } else {
                            bootbox.alert($i18n("Error in creating new species.<br><br>Status code: ") + resp.status + "<br>" + resp.data.error);
                            $scope.$close();
                        }
                    })
                };

                $scope.uploadCSV = function () {
                    var f = document.getElementById('file').files[0];
                    if (f !== undefined) {
                        $scope.newListName = f.name;

                        var r = new FileReader();
                        r.onloadend = function (e) {
                            $scope.newItems = e.target.result
                        };
                        r.readAsBinaryString(f);
                    }
                };
            }])
}(angular));