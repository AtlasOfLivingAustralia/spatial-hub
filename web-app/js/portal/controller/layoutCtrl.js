(function (angular) {
    'use strict';
    angular.module('layout-ctrl', ['layout-service'])
        .controller('LayoutCtrl', ['$scope', 'LayoutService', 'SessionsService', '$timeout', 'MapService',
            function ($scope, LayoutService, SessionsService, $timeout, MapService) {
                $scope.panelMode = LayoutService.panelMode
                $scope.showOptions = LayoutService.showOptions
                $scope.showLegend = LayoutService.showLegend
                $scope.toOpenStack = LayoutService.toOpenStack
                $scope.panelData = LayoutService.panelData

                $scope.$watch('toOpenStack', function () {
                    if (LayoutService.toOpenStack.length > 0) {
                        LayoutService.openFromStack(LayoutService.toOpenStack[0])
                        LayoutService.toOpenStack.pop()
                    }
                }, true)

                $scope.$watch('panelMode', function () {
                    console.log($scope.panelMode)
                })

                //init a saved session
                $scope.loadSession = function () {
                    var sessionId = /[\?&]ss=[0-9]*/.exec(window.location.search)
                    if (sessionId) sessionId = sessionId[0].replace('?ss=', '').replace('&ss=', '')

                    if (sessionId) {
                        SessionsService.get(sessionId).then(function (data) {

                            MapService.removeAll()

                            //TODO: verify layer order
                            for (var k in data.layers) {
                                MapService.add(data.layers[k])
                            }

                            MapService.setBaseMap(data.basemap)

                            MapService.leafletScope.zoom(data.extents)

                        })
                    }
                }

                $timeout(function () {
                    $scope.loadSession()
                }, 2000)

            }])
}(angular));

