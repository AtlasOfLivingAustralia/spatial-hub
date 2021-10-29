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
        .controller('SpeciesInfoCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance', 'BiocacheService', 'BieService', 'LoggerService', 'data',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, BieService, LoggerService, data) {

                $scope.speciesCountAll = $i18n(377, "counting...");
                $scope.countAll = $i18n(377, "counting...");
                $scope.speciesList = [];
                $scope.dataProviderList = [{name: $i18n("searching...")}];
                $scope.lsids = [{name: $i18n("searching..."), list: [{scientificName: $i18n("searching...")}]}];
                $scope.collectoryLinkPrefix = $SH.collectionsUrl + "/public/showDataProvider/";
                $scope.chart = $SH.config.charts;

                $scope.init = function (species) {
                    $scope.speciesOrig = {
                        layerId: species.uid,
                        q: species.q,
                        fq: species.fq,
                        wkt: species.wkt,
                        bs: species.bs,
                        ws: species.ws,
                        name: species.name
                    };

                    LoggerService.log("View", "speciesInfo", $scope.speciesOrig)

                    $scope.qid = species.qid;

                    $scope.species = species;

                    BiocacheService.speciesCount($scope.species).then(function (data) {
                        $scope.speciesCountAll = data
                    });

                    BiocacheService.count($scope.species).then(function (data) {
                        $scope.countAll = data
                    });

                    BiocacheService.dataProviderList($scope.speciesOrig).then(function (data) {
                        $scope.dataProviderList = data
                    });

                    BiocacheService.facetGeneral('species_guid', $scope.speciesOrig, 10, 0).then(function (data) {
                        $scope.lsids = [];
                        if (data.length > 0 && data[0].fieldResult !== undefined) {
                            data = data[0].fieldResult;
                            $scope.speciesList = data;

                            for (var i = 0; i < 10 && i < data.length; i++) {
                                if (data[i].label.length > 0 && data[i].fq.indexOf("-") !== 0) {
                                    var item = {name: data[i].label, list: []};
                                    item.list = [{scientificName: $i18n("searching...")}];
                                    $scope.lsids.push(item);
                                    $scope.getClassification(item)
                                }
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