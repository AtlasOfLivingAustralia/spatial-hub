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
            'BiocacheService', '$http', 'LayersService',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, $http, LayersService) {
                LayoutService.addToSave($scope);

                $scope.tlayers = [];
                $scope.tabulations = [];

                $scope.loading = true;

                //$http.get($SH.proxyUrl + "?url=" + encodeURIComponent(LayersService.url() + '/tabulations.json')).then(function (response) {
                $http.get(LayersService.url() + '/tabulations.json').then(function (response) {
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

                        LayoutService.openIframe(url, false)
                    }
                };

                $scope.isDisabled = function () {
                    if ($scope.step === 1) {
                        return !($scope.layer1 !== $scope.layer2 && $scope.layer1.length > 0 && $scope.layer2.length > 0)
                    }
                }
            }])
}(angular));