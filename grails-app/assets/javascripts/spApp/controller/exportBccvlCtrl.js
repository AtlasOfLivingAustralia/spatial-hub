(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name ExportBccvlCtrl
     * @description
     *   Manage export of occurrence layers to BCCVL
     */
    angular.module('export-bccvl-ctrl', ['map-service']).controller('ExportBccvlCtrl', ['$scope', 'MapService',
        '$timeout', 'LayoutService', 'BiocacheService', '$window', '$uibModalInstance', 'SessionsService', '$http',
        '$q', 'LoggerService', 'data',
        function ($scope, MapService, $timeout, LayoutService, BiocacheService, $window, $uibModalInstance,
                  SessionsService, $http, $q, LoggerService, config) {

            $scope.stepNames = ['Select species'];

            $scope.isSpeciesList = false;
            $scope.includeSpeciesList = true;

            $scope._httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'ExportBccvlCtrl';
                httpconfig.method = method;

                return httpconfig;
            };

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

            $scope.setQ = function (query) {
                if (query.species_list) {
                    $scope.isSpeciesList = true;
                }
            };

            $scope.ok = function () {
                if ($scope.step === 1) {
                    $scope.step = $scope.step + 1
                } else if ($scope.step === 2) {
                    var promises = [];
                    var url = $SH.bccvlPostUrl;
                    var data = [];
                    $.each($scope.selectedQs, function (i) {
                        var q = $scope.selectedQs[i];
                        promises.push(BiocacheService.registerQuery(q).then(function (response) {
                            return BiocacheService.facet('taxon_name', response).then(function (facets) {
                                if ($scope.includeSpeciesList && q.species_list) {
                                    var species = [];
                                    facets && facets.forEach(function (facet) {
                                        if (facet && facet.count > 0 && facet.name) {
                                            speices.push(facet.name)
                                        }
                                    });

                                    data.push({
                                        name: q.name,
                                        query: response.qid,
                                        url: q.bs,
                                        trait: q.species_list,
                                        species_list: species
                                    });
                                } else {
                                    data.push({name: q.name, query: response.qid, url: q.bs});
                                }

                                return true
                            })
                        }));
                    });
                    $q.all(promises).then(function () {
                        var authorizationToken = "Bearer " + window.location.hash.split('&')[0].split('=')[1];
                        var config = {headers: {Accept: 'application/json', Authorization: authorizationToken}};

                        $http.post(url, {data: data}, $scope._httpDescription('export', config)).then(function (response) {
                            $scope.bccvlOpenUrl = response.headers('location');

                            LoggerService.log('Export', 'exportBccvl', JSON.stringify({
                                data: data,
                                bccvlOpenUrl: $scope.bccvlOpenUrl
                            }))
                        });
                    });
                    $scope.step = $scope.step + 1
                }
            };

            $scope.isDisabled = function () {
                return $scope.selectedQs.length === 0;
            };

            $scope.bccvlLogin = function () {
                var bccvlExportTool = encodeURIComponent("&tool=exportBccvl&toolParameters=" + encodeURIComponent('{"step":2}'));

                //save session and open BCCVL login page
                SessionsService.saveAndLogin(SessionsService.current(), $SH.bccvlLoginUrl + '$url' + bccvlExportTool, true, true)
            };

            if ($scope.step === 1) {
                $scope.bccvlLogin()
            }
        }])
}(angular));