(function (angular) {
    'use strict';
    angular.module('export-bccvl-ctrl', ['map-service']).controller('ExportBCCVLCtrl', ['$scope', 'MapService',
        '$timeout', 'LayoutService', 'BiocacheService', '$window', '$uibModalInstance', 'SessionsService', '$http', 'data',
        function ($scope, MapService, $timeout, LayoutService, BiocacheService, $window, $uibModalInstance,
                  SessionsService, $http, config) {

            $scope.stepNames = ['select species'];

            if (config && config.selectedQ) {
                $scope.selectedQs = config.selectedQs
            } else {
                $scope.selectedQs = []
            }

            if (config && config.step) {
                $scope.step = config.step
            } else {
                $scope.step = 1
            }

            $scope.bccvlOpenUrl = '';

            LayoutService.addToSave($scope);

            $scope.ok = function () {
                if ($scope.step === 1) {
                    $scope.step = $scope.step + 1
                } else if ($scope.step === 2) {
                    var promises = [];
                    var url = $SH.bccvlPostUrl;
                    var data = [];
                    $.each($scope.selectedQs, function (q) {
                        promises.push(BiocacheService.registerQuery(q).then(function (response) {
                            data.push({name: q.name, query: response.qid, url: q.bs})
                        }));
                    });
                    $q.all(promises).then(function () {
                        $http.post(url, data).then(function (response) {
                            $scope.bccvlOpenUrl = response.headers('location');
                        });
                    });
                    $scope.step = $scope.step + 1
                }
            };

            $scope.isDisabled = function () {
                return $scope.selectedQs.length === 0;
            };

            $scope.bccvlLogin = function () {
                var bccvlExportTool = encodeURI("&tool=exportBCCVL&toolparameters=" + encodeURIComponent("{step:2}"));

                //save session and open BCCVL login page
                SessionsService.saveAndLogin(SessionsService.current(), $SH.bccvlLoginUrl + '$url' + bccvlExportTool, true, true)
            }

            if ($scope.step === 1) {
                $scope.bccvlLogin()
            }
        }])
}(angular));