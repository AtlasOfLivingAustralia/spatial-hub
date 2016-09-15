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
    angular.module('analysis-ctrl', [])
        .controller('AnalysisCtrl', ['$scope', '$rootScope', '$uibModalInstance', '$timeout', 'data',
            function ($scope, $rootScope, $uibModalInstance, $timeout, inputData) {
                $scope.name = 'AnalysisCtrl'
                $scope.taskId = undefined
                $scope.cancel = function () {
                    $uibModalInstance.close({noOpen: true})
                };

                $scope.ok = function (data) {
                    $uibModalInstance.close({noOpen: true})

                    if(angular.isDefined($scope.taskId)){
                        $timeout(function () {
                            var processData = {opening: true, processName: 'PointsToGrid', stage: 'output', taskId: 1}
                            $scope.openModal('backgroundProcess', processData)
                        }, 50)
                    }
                };

            }])
}(angular));