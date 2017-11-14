(function (angular) {
    'use strict';
    angular.module('sp-menu-directive', ['layout-service', 'map-service', 'sessions-service', 'menu-service']).directive('spMenu',
        ["LayoutService", 'MapService', 'SessionsService', 'MenuService',
            function (LayoutService, MapService, SessionsService, MenuService) {
            return {
                scope: {},
                templateUrl: '/spApp/menuContent.htm',
                link: function (scope, element, attrs) {
                    scope.menuConfig = [];

                    MenuService.getMenuConfig().then( function (config) {
                        for (var c in config) {
                            scope.menuConfig.push(config[c]);
                        }
                    });

                    scope.open = function (type, data) {
                        LayoutService.clear();
                        LayoutService.openModal(type, data)
                    };

                    scope.run = function (cmd) {
                        var func = scope[cmd[0]];

                        if (cmd.length > 1) {
                            if (cmd.length == 2) {
                                func(cmd[1])
                            } else if (cmd.length == 3) {
                                func(cmd[1], cmd[2])
                            } else if (cmd.length == 4) {
                                func(cmd[1], cmd[2], cmd[3])
                            }
                        } else {
                            func()
                        }
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

                    scope.exportMap = function () {
                        scope.open('tool', {processName: 'ToolExportMapService', overrideValues: { ToolExportMapService: { input: { caption: { constraints: {default: (new Date() ) } } } } } })
                    };

                    scope.isLoggedIn = $SH.userId !== undefined && $SH.userId !== null && $SH.userId.length > 0;
                    scope.isNotLoggedIn = !scope.isLoggedIn;
                }
            };
        }])
}(angular));