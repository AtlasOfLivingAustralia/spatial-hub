(function (angular) {
    'use strict';
    angular.module('species-info-ctrl', ['map-service', 'biocache-service'])
        .controller('SpeciesInfoCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance', 'BiocacheService', 'BieService', 'data',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, BieService, data) {

                $scope.speciesCountKosher = 'counting...'
                $scope.speciesCountKosherAny = 'counting...'
                $scope.speciesCountAll = 'counting...'
                $scope.countKosher = 'counting...'
                $scope.countKosherAny = 'counting...'
                $scope.countAll = 'counting...'
                $scope.speciesList = []
                $scope.dataProviderList = []
                $scope.lsids = []

                $scope.init = function (species) {
                    $scope.speciesOrig = { q: species.q, fq: species.fq, wkt: species.wkt, bs: species.bs, ws: species.ws }

                    //remove geospatial_kosher
                    var fq = [species.q]
                    for (var i = 0; i < species.fq.length; i++) {
                        if (species.fq[i] !== 'geospatial_kosher:true' &&
                            species.fq[i] !== 'geospatial_kosher:false' &&
                            species.fq[i] !== 'geospatial_kosher:*') {
                            fq.push(species.fq[i])
                        }
                    }
                    var q = fq
                    $scope.species = { q: q, wkt: species.wkt, bs: species.bs, ws: species.ws }

                    BiocacheService.speciesCount($scope.species, ['geospatial_kosher:true']).then(function (data) {
                        $scope.speciesCountKosher = data
                    })

                    BiocacheService.speciesCount($scope.species, ['geospatial_kosher:*']).then(function (data) {
                        $scope.speciesCountKosherAny = data
                    })

                    BiocacheService.speciesCount($scope.species).then(function (data) {
                        $scope.speciesCountAll = data
                    })

                    BiocacheService.count($scope.species, ['geospatial_kosher:true']).then(function (data) {
                        $scope.countKosher = data
                    })

                    BiocacheService.count($scope.species, ['geospatial_kosher:*']).then(function (data) {
                        $scope.countKosherAny = data
                    })

                    BiocacheService.count($scope.species).then(function (data) {
                        $scope.countAll = data
                    })

                    BiocacheService.dataProviderList($scope.speciesOrig).then(function (data) {
                        $scope.dataProviderList = data
                    })

                    BiocacheService.facet('species_guid', $scope.speciesOrig).then(function (data) {
                        $scope.speciesList = data

                        var i = 0
                        for (i = 0; i < 10 && i < data.length; i++) {
                            if (data[i].name.length > 0) {
                                var item = {name: data[i].name, list: []}
                                $scope.lsids.push(item)
                                $scope.getClassification(item)
                            }
                        }

                    })
                };

                $scope.getClassification = function (item) {
                    BieService.classification(item.name).then(function (data) {
                        item.list = data
                    })
                }

                $scope.init(data)

                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };
            }])
}(angular));