(function (angular) {
    'use strict';
    angular.module('export-map-ctrl', ['map-service', 'layers-service']).controller('ExportMapCtrl',
        ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance) {
                LayoutService.addToSave($scope);


                var leafletmap = $('.angular-leaflet-map');

                $scope.outputType = "png";
                $scope.resolution = "0.05";
                $scope.bbox = MapService.getExtents();
                $scope.windowSize = [leafletmap.width(), leafletmap.height()];
                $scope.comment = new Date();
                $scope.baseMap = $SH.baseLayers[MapService.leafletScope.baseMap].exportType;
                $scope.mapLayers = [];

                for (var k in MapService.leafletLayers) {
                    if (MapService.leafletLayers.hasOwnProperty(k)) {
                        if (k !== 'draw') {
                            var i = MapService.leafletLayers[k];
                            var url = i.url;
                            if (url.indexOf('?') < 0) url += '?';
                            url += "&opacity=" + (i.opacity);
                            for (var j in i.layerParams) {
                                if (i.layerParams.hasOwnProperty(j)) {
                                    url += '&' + j + '=' + encodeURIComponent(i.layerParams[j])
                                }
                            }
                            $scope.mapLayers.push(url)
                        }
                    }
                }

                $scope.ok = function () {
                    var data = {processName: 'MapImage'};
                    data.overrideValues = {
                        MapImage: {
                            input: {
                                outputType: {constraints: {'default': $scope.outputType}},
                                resolution: {constraints: {'default': $scope.resolution}},
                                bbox: {constraints: {'default': $scope.bbox}},
                                windowSize: {constraints: {'default': $scope.windowSize}},
                                comment: {constraints: {'default': $scope.comment}},
                                baseMap: {constraints: {'default': $scope.baseMap}},
                                mapLayers: {constraints: {'default': $scope.mapLayers}}
                            }
                        },
                        'step': 8
                    };
                    LayoutService.openModal('tool', data, false);
                };
            }])
}(angular));