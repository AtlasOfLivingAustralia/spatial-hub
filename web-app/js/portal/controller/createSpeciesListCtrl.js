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
    angular.module('create-species-list-ctrl', ['map-service', 'biocache-service', 'layers-service', 'ala.sandbox.preview'])
        .controller('CreateSpeciesListCtrl', ['$scope', '$controller', 'MapService', '$timeout', '$rootScope', '$uibModalInstance',
            'BiocacheService', 'LayersService', 'ListsService', 'data',
            function ($scope, $controller, MapService, $timeout, $rootScope, $uibModalInstance, BiocacheService, LayersService, ListsService, inputData) {
                $scope.name = 'createSpeciesListCtrl'

                $scope.step = '1';

                $scope.newListName = 'My species list'
                $scope.newListDescription = ''
                $scope.newItems = ''
                $scope.makePrivate = true

                $scope.selectedQ = {
                    q: []
                }
                
                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };

                $scope.ok = function (data) {
                    if ($scope.step == '2') {
                        $scope.addNewSpecies()
                    } else {
                        $scope.step = '2'
                    }
                };

                $scope.addNewSpecies = function () {
                    $scope.newItems = $scope.newItems.replace('\t','\n').replace(',','\n').replace(';','\n').split('\n');
                    ListsService.createList($scope.newListName, $scope.newListDescription, $scope.newItems, $scope.makePrivate).then(function (resp) {
                        if (resp.status == 200) {
                            ListsService.getItemsQ(resp.data.druid).then(function(data){
                                var listIds = data;
                                if (listIds.length == 0) {
                                    bootbox.alert("No matching species found.")
                                } else {
                                    $scope.selectedQ = {q: [listIds], name: $scope.newListName}
                                    if (inputData != undefined && inputData.setQ != undefined) {
                                        inputData.setQ($scope.selectedQ)
                                    } else {
                                        BiocacheService.newLayer(q, undefined, datasetName).then(function (data) {
                                            MapService.add(data)
                                        });
                                    }
                                }
                                $scope.cancel();
                            })
                        } else {
                            bootbox.alert("Error in creating new species.<br><br>Status code: " + resp.status + "<br>" +  resp.data.error)
                            $scope.cancel();
                        }
                    })
                };

                $scope.uploadCSV = function(){
                    var f = document.getElementById('file').files[0]
                    if (f !== undefined) {
                        $scope.newListName = f.name

                        var r = new FileReader();
                        r.onloadend = function (e) {
                            $scope.newItems = e.target.result
                        }
                        r.readAsBinaryString(f);
                    }
                };
            }])
}(angular));