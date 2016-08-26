(function (angular) {
    'use strict';
    angular.module('export-map-ctrl', ['map-service', 'layers-service']).
    controller('ExportMapCtrl', ['$scope', 'MapService', '$timeout', '$rootScope', '$uibModalInstance', '$http', 'LayersService',
        function ($scope, MapService, $timeout, $rootScope, $uibModalInstance, $http, LayersService) {

            $scope.name = 'ExportMapCtrl'

            $scope.outputType = "png";
            $scope.resolution = "0.05";
            $scope.bbox = MapService.getExtents()
            $scope.windowSize = [$('.angular-leaflet-map').width(), $('.angular-leaflet-map').height()]
            $scope.comment = ""
            $scope.baseMap = "normal"
            $scope.mapLayers = []

            for (var k in MapService.leafletLayers) {
                if (k != 'draw') {
                    var i = MapService.leafletLayers[k]
                    var url = i.url
                    if (url.indexOf('?') < 0) url += '?'
                    url += "&opacity=" + (i.opacity / 100.0)
                    for (var j in i.layerParams) {
                        url += '&' + j + '=' + encodeURIComponent(i.layerParams[j])
                    }
                    $scope.mapLayers.push(url)
                }
            }

            $scope.hide = function () {
                $uibModalInstance.close({hide: true});
            }

            $scope.cancel = function () {
                $uibModalInstance.close(null);
            };

            $scope.ok = function (data) {
                var task = {
                    name: 'MapImage',
                    input: {
                        outputType: $scope.outputType,
                        resolution: $scope.resolution,
                        bbox: $scope.bbox,
                        windowSize: $scope.windowSize,
                        comment: $scope.comment,
                        baseMap: $scope.baseMap,
                        mapLayers: $scope.mapLayers
                    }
                }
                $http.post("portal/createTask", task).then(function (response) {
                    $timeout(function () {
                        $scope.checkStatus(LayersService.url() + '/tasks/status/' + response.data.id)
                    }, 5000)
                })
            };

            $scope.checkStatus = function (url) {
                $http.get(url).then(function (response) {
                    $scope.status = response.data.message

                    if (response.data.status < 2) {
                        $timeout(function () {
                            $scope.checkStatus(url)
                        }, 5000)
                    } else if (response.data.status == 2) {
                        $scope.status = 'cancelled'
                        $scope.finished = true
                    } else if (response.data.status == 3) {
                        $scope.status = 'error'
                        $scope.finished = true
                    } else if (response.data.status == 4) {
                        $scope.status = 'successful'
                        $scope.finished = true

                        console.log(response.data)

                        for (var k in response.data.output) {
                            var d = response.data.output[k]
                            if (d.file.endsWith('.zip')) {
                                $scope.downloadUrl = LayersService.url() + '/tasks/output/' + response.data.id + '/' + d.file

                                var link = document.createElement("a");
                                link.href = $scope.downloadUrl;
                                link.click();
                            }
                        }

                        $scope.cancel({noOpen: true})
                    }
                })
            }
        }])
}(angular));