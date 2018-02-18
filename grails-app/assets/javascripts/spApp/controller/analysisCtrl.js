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
 * Created by Temi on 15/09/2016.
 */
(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name AnalysisCtrl
     * @description
     *   Retrieve spatial-service analysis results
     */
    angular.module('analysis-ctrl', ['layout-service'])
        .controller('AnalysisCtrl', ['$scope', '$rootScope', '$uibModalInstance', '$timeout', '$http', 'LayoutService', 'data', 'LoggerService',
            function ($scope, $rootScope, $uibModalInstance, $timeout, $http, LayoutService, inputData, LoggerService) {
                LayoutService.addToSave($scope);

                $scope.taskId = undefined;

                $scope.list = [];
                $scope.downloadImmediately = false;

                $scope.ok = function () {
                    if (angular.isDefined($scope.taskId)) {
                        $http.get($SH.layersServiceUrl + '/tasks/status/' + $scope.taskId).then(function (resp) {
                            $timeout(function () {
                                var processData = {
                                    processName: resp.data.name,
                                    stage: 'output',
                                    taskId: resp.data.id,
                                    downloadImmediately: $scope.downloadImmediately
                                };
                                LayoutService.openModal('tool', processData, false)
                            }, 0)
                        }, function () {
                            alert($i18n('Could not find task - ') + $scope.taskId)
                        })
                    }
                };

                $scope.openUrl = function (url) {
                    LayoutService.openIframe(url, false)
                };

                $scope.getInputChecks = function() {
                    return $scope.taskId == undefined || $scope.taskId == null || $scope.taskId.length == 0
                }

            }])
}(angular));