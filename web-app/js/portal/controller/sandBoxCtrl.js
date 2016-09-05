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
    angular.module('sand-box-ctrl', ['map-service', 'biocache-service', 'layers-service', 'ala.sandbox.preview'])
        .controller('SandBoxCtrl', ['$scope', '$controller', 'MapService', '$timeout', '$rootScope', '$uibModalInstance',
            'BiocacheService', 'LayersService',
            function ($scope, $controller, MapService, $timeout, $rootScope, $uibModalInstance, BiocacheService, LayersService) {
                var setWatchFlag = false
                $scope.name = 'sandBoxCtrl'
                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };

                $scope.watchStatus = function (sandbox) {
                    var child = $scope.$$childHead
                    while(child){
                        if(child.preview && !setWatchFlag){
                            var dataResourceUid, datasetName
                            child.$watch('preview.dataResourceUid', function (newValue) {
                                dataResourceUid = newValue
                            });

                            child.$watch('preview.datasetName', function (newValue) {
                                datasetName = newValue
                            });

                            child.$watch('preview.uploadStatus', function (newValue) {
                                if(newValue == 'COMPLETE'){
                                    BiocacheService.newLayer({
                                        q: 'data_resource_uid:"' + dataResourceUid + '"',
                                        bs: SpatialPortalConfig.sandboxServiceUrl,
                                        ws: SpatialPortalConfig.sandboxUrl
                                    }, undefined, datasetName).then(function (data) {
                                        MapService.add(data, SpatialPortalConfig.sandboxServiceUrl)
                                    });
                                    
                                    $scope.cancel();
                                }
                            });

                            setWatchFlag = true;
                        }

                        child = child.$$nextSibling
                    }
                }
            }])
}(angular));