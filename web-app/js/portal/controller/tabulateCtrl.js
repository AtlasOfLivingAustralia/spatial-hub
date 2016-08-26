(function (angular) {
    'use strict';
    angular.module('tabulate-ctrl', ['map-service', 'biocache-service', 'layers-service'])
        .controller('TabulateCtrl', ['$scope', 'MapService', '$timeout', '$rootScope', '$uibModalInstance',
            'BiocacheService', '$http', 'LayersService',
            function ($scope, MapService, $timeout, $rootScope, $uibModalInstance, BiocacheService, $http, LayersService) {

                $scope.tlayers = []
                $scope.tabulations = []

                $http.get(LayersService.url() + '/tabulations.json').then(function (response) {
                    $scope.tabulations = response.data
                    var k
                    for (k in $scope.tabulations) {
                        $scope.tlayers.push({name: $scope.tabulations[k].name1, id: $scope.tabulations[k].fid1})
                        $scope.tlayers.push({name: $scope.tabulations[k].name2, id: $scope.tabulations[k].fid2})
                    }
                });

                $scope.type = 'area'
                $scope.types = ['area', 'species', 'occurrences']

                $scope.step = 1
                $scope.layer1 = ''
                $scope.layer2 = ''

                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };

                $scope.ok = function (data) {
                    if ($scope.step == 1) {

                        var url = LayersService.url() + '/tabulation/' + $scope.type + '/' + $scope.layer1 + '/' + $scope.layer2 + '/tabulation.html'

                        console.log(url)

                        $scope.cancel({noOpen: true})
                        $rootScope.openIframe(url)
                    }
                };

                $scope.isDisabled = function () {
                    if ($scope.step == 1) {
                        return !($scope.layer1 != $scope.layer2 && $scope.layer1.length > 0 && $scope.layer2.length > 0)
                    }
                }
            }])
}(angular));