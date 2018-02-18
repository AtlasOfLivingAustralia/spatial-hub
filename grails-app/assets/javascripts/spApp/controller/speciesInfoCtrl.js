(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name SpeciesInfoCtrl
     * @description
     *   Display occurrence layer information
     */
    angular.module('species-info-ctrl', ['map-service', 'biocache-service'])
        .controller('SpeciesInfoCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance', 'BiocacheService', 'BieService', 'data',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, BieService, data) {

                $scope.speciesCountKosher = $i18n('counting...');
                $scope.speciesCountKosherAny = $i18n('counting...')
                $scope.speciesCountAll = $i18n('counting...')
                $scope.countKosher = $i18n('counting...')
                $scope.countKosherAny = $i18n('counting...')
                $scope.countAll = $i18n('counting...')
                $scope.speciesList = [];
                $scope.dataProviderList = [];
                $scope.lsids = [];

                $scope.init = function (species) {
                    $scope.speciesOrig = {
                        q: species.q,
                        fq: species.fq,
                        wkt: species.wkt,
                        bs: species.bs,
                        ws: species.ws
                    };

                    //remove geospatial_kosher
                    var fq = [species.q];
                    if (species.fq) {
                        for (var i = 0; i < species.fq.length; i++) {
                            if (species.fq[i] !== 'geospatial_kosher:true' &&
                                species.fq[i] !== 'geospatial_kosher:false' &&
                                species.fq[i] !== 'geospatial_kosher:*') {
                                fq.push(species.fq[i])
                            }
                        }
                    }
                    $scope.species = {q: fq, wkt: species.wkt, bs: species.bs, ws: species.ws};

                    BiocacheService.speciesCount($scope.species, ['geospatial_kosher:true']).then(function (data) {
                        $scope.speciesCountKosher = data
                    });

                    BiocacheService.speciesCount($scope.species, ['geospatial_kosher:*']).then(function (data) {
                        $scope.speciesCountKosherAny = data
                    });

                    BiocacheService.speciesCount($scope.species).then(function (data) {
                        $scope.speciesCountAll = data
                    });

                    BiocacheService.count($scope.species, ['geospatial_kosher:true']).then(function (data) {
                        $scope.countKosher = data
                    });

                    BiocacheService.count($scope.species, ['geospatial_kosher:*']).then(function (data) {
                        $scope.countKosherAny = data
                    });

                    BiocacheService.count($scope.species).then(function (data) {
                        $scope.countAll = data
                    });

                    BiocacheService.dataProviderList($scope.speciesOrig).then(function (data) {
                        $scope.dataProviderList = data
                    });

                    BiocacheService.facet('species_guid', $scope.speciesOrig).then(function (data) {
                        $scope.speciesList = data;

                        for (var i = 0; i < 10 && i < data.length; i++) {
                            if (data[i].name.length > 0) {
                                var item = {name: data[i].name, list: []};
                                $scope.lsids.push(item);
                                $scope.getClassification(item)
                            }
                        }

                    })
                };

                $scope.getClassification = function (item) {
                    BieService.classification(item.name).then(function (data) {
                        item.list = data
                    })
                };

                $scope.init(data);
            }])
}(angular));