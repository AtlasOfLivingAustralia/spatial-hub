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
     * @name SandBoxCtrl
     * @description
     *   Import occurrences to the sandbox
     */
    angular.module('sand-box-ctrl', ['map-service', 'biocache-service', 'layers-service', 'ala.sandbox.preview'])
        .controller('SandBoxCtrl', ['$scope', '$controller', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance',
            'BiocacheService', 'LayersService', 'data',
            function ($scope, $controller, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, LayersService, inputData) {
                var setWatchFlag = false;

                //workaround for logging in to sandbox
                if ($SH.userId !== '' && $('#loginWorkaround')[0].children.length === 0) {
                    $('#loginWorkaround').append('<iframe src="' + $SH.sandboxUiUrl + '/dataCheck/ping"></iframe>')
                }

                $scope.watchStatus = function () {
                    var child = $scope.$$childHead;
                    while (child) {
                        if (child.preview && !setWatchFlag) {
                            (function () {
                                var dataResourceUid, datasetName;
                                child.$watch('preview.dataResourceUid', function (newValue) {
                                    dataResourceUid = newValue
                                });

                                child.$watch('preview.datasetName', function (newValue) {
                                    datasetName = newValue
                                });

                                child.$watch('preview.uploadStatus', function (newValue) {
                                    var closeLater = false;
                                    if (newValue === 'COMPLETE') {
                                        var q = {
                                            q: ['data_resource_uid:"' + dataResourceUid + '"'],
                                            name: datasetName,
                                            bs: $SH.sandboxServiceUrl,
                                            ws: $SH.sandboxUrl
                                        };
                                        if (inputData !== undefined && inputData.setQ !== undefined) {
                                            inputData.setQ(q)
                                        } else {
                                            closeLater = true;
                                            BiocacheService.newLayer(q, undefined, q.name).then(function (data) {
                                                MapService.add(data, $SH.sandboxServiceUrl);
                                                $scope.$close();
                                            });
                                        }
                                        if (!closeLater)
                                            $scope.$close();
                                    } else if (newValue === 'FAILED') {
                                        alert($i18n('failed to import'));
                                    }
                                });

                                setWatchFlag = true;
                            })()
                        }

                        child = child.$$nextSibling
                    }
                }
            }])
}(angular));