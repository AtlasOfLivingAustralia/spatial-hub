(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name TabulateCtrl
     * @description
     *   Choose an available tabulation
     */
    angular.module('tabulate-ctrl', ['map-service', 'biocache-service', 'layers-service'])
        .controller('TabulateCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance',
            'BiocacheService', '$http', 'LayersService', 'LoggerService', 'data',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, $http, LayersService, LoggerService, data) {
                LayoutService.addToSave($scope);

                $scope._httpDescription = function (method, httpconfig) {
                    if (httpconfig === undefined) {
                        httpconfig = {};
                    }
                    httpconfig.service = 'TabulationCtrl';
                    httpconfig.method = method;

                    return httpconfig;
                };

                $scope.tlayers = [];
                $scope.tabulations = [];

                $scope.loading = true;

                $http.get(LayersService.url() + '/tabulations.json', $scope._httpDescription('get')).then(function (response) {
                    $scope.tabulations = response.data;
                    var unique = {};
                    var k;
                    for (k in $scope.tabulations) {
                        if ($scope.tabulations.hasOwnProperty(k)) {
                            unique[$scope.tabulations[k].name1] = $scope.tabulations[k].fid1;
                            unique[$scope.tabulations[k].name2] = $scope.tabulations[k].fid2;
                        }
                    }
                    for (k in unique) {
                        if (unique.hasOwnProperty(k)) {
                            $scope.tlayers.push({name: k, id: unique[k]});
                        }
                    }
                    $scope.loading = false;
                });

                $scope.type = 'area';
                $scope.types = ['area', 'species', 'occurrences'];

                $scope.step = 1;
                $scope.layer1 = '';
                $scope.layer2 = '';

                $scope.ok = function () {
                    if ($scope.step === 1) {

                        var url = LayersService.url() + '/tabulation/' + $scope.type + '/' + $scope.layer1 + '/' + $scope.layer2 + '/tabulation.html';

                        LoggerService.log("View", "tabulation", {
                            type: $scope.type,
                            layer1: $scope.layer1,
                            layer2: $scope.layer2
                        })

                        LayoutService.openIframe(url, false)
                    }
                };

                $scope.isDisabled = function () {
                    if ($scope.step === 1) {
                        return !($scope.layer1 !== $scope.layer2 && $scope.layer1.length > 0 && $scope.layer2.length > 0)
                    }
                }

                /* init */
                if (data.type) {
                    $scope.type = data.type
                    $scope.layer1 = data.layer1
                    $scope.layer2 = data.layer2

                    $scope.ok()
                }
            }])
}(angular));