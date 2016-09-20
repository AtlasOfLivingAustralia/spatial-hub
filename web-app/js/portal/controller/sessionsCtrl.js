(function (angular) {
    'use strict';
    angular.module('sessions-ctrl', ['sessions-service'])
        .controller('SessionsCtrl', ['$scope', 'SessionsService', 'MapService',
            function ($scope, SessionsService, MapService) {

                $scope.sessions = []
                SessionsService.list().then(function (data) {
                    $scope.sessions = data
                })

                $scope.import = function (sessionId) {
                    SessionsService.get(sessionId).then(function (data) {
                        MapService.removeAll()

                        for (var k in data.layers) {
                            MapService.add(data.layers[k])
                        }

                        MapService.leafletScope.zoom(data.extents)

                        data.baseMap || MapService.leafletScope.setBaseMap(data.baseMap)

                        MapService.updateZindex()
                    })
                }
            }])
}(angular));
