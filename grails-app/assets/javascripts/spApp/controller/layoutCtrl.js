(function (angular) {
    'use strict';
    angular.module('layout-ctrl', ['layout-service', 'url-params-service'])
        .controller('LayoutCtrl', ['$scope', 'LayoutService', 'SessionsService', '$timeout', '$location', 'MapService', 'UrlParamsService',
            function ($scope, LayoutService, SessionsService, $timeout, $location, MapService, UrlParamsService) {
                $scope.panelMode = LayoutService.panelMode;
                $scope.showOptions = LayoutService.showOptions;
                $scope.showLegend = LayoutService.showLegend;
                $scope.toOpenStack = LayoutService.toOpenStack;
                $scope.panelData = LayoutService.panelData;

                $scope.$watch('toOpenStack', function () {
                    if (LayoutService.toOpenStack.length > 0) {
                        LayoutService.openFromStack(LayoutService.toOpenStack[0]);
                        LayoutService.toOpenStack.pop()
                    }
                }, true);

                var params = $location.search();
                if (params && Object.keys(params).length !== 0) {
                    UrlParamsService.processUrlParams(params);
                }

                //init a saved session
                $scope.loadSession = function (sessionId) {
                    // if (sessionId) sessionId = sessionId[0].replace('?ss=', '').replace('&ss=', '');
                    //
                    // if (sessionId) {
                    //     SessionsService.load(sessionId)
                    // }
                };

                $timeout(function () {
                    var sessionId = /[\?&]ss=[0-9]*/.exec(window.location.search);
                    $scope.loadSession(sessionId)
                }, 2000)

            }])
}(angular));

