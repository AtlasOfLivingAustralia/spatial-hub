(function (angular) {
    'use strict';
    angular.module('sp-menu-directive', []).directive('spMenu',
        ["LayoutService", 'MapService', 'SessionsService', function (LayoutService, MapService, SessionsService) {
            return {
                scope: {},
                templateUrl: '/spApp/menuContent.htm',
                link: function (scope, element, attrs) {
                    scope.open = function (type, data) {
                        LayoutService.clear();
                        LayoutService.openModal(type, data)
                    };

                    scope.openPanel = function (type, data) {
                        LayoutService.clear();
                        LayoutService.openPanel(type, data, false)
                    };

                    scope.toggleAnimation = function () {
                        $scope.animationsEnabled = !$scope.animationsEnabled;
                    };

                    scope.hidePanel = function () {
                        $("#left-panel")[0].style.marginLeft = "-410px";
                        $("#right-panel")[0].style.marginLeft = "0px";
                        $("#restore-left-panel").show();
                        MapService.leafletScope.invalidate()
                    };

                    scope.showPanel = function () {
                        $("#restore-left-panel").hide();
                        $("#left-panel")[0].style.marginLeft = "0px";
                        $("#right-panel")[0].style.marginLeft = "400px";
                        MapService.leafletScope.invalidate()
                    };

                    scope.saveSession = function () {
                        SessionsService.save(SessionsService.current())
                    };

                    scope.spatialHubLogin = function () {
                        SessionsService.saveAndLogin(SessionsService.current())
                    };

                    scope.loadSession = function (sessionId) {
                        SessionsService.load(sessionId)
                    };

                    scope.isLoggedIn = function () {
                        return $SH.userId !== undefined && $SH.userId !== null && $SH.userId.length > 0
                    }
                }
            };
        }])
}(angular));