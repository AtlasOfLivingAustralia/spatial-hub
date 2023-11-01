(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name spMenu
     * @description
     *    Panel displaying the spatial-hub menu
     */
    angular.module('sp-menu-directive', ['layout-service', 'map-service', 'sessions-service', 'menu-service']).directive('spMenu',
        ["LayoutService", 'MapService', 'SessionsService', 'MenuService', 'ToolsService',
            function (LayoutService, MapService, SessionsService, MenuService, ToolsService) {
                return {
                    scope: {},
                    templateUrl: '/spApp/menuContent.htm',
                    link: function (scope, element, attrs) {
                        scope.menuConfig = [];

                        MenuService.getMenuConfig().then(function (config) {
                            for (var c in config) {
                                scope.menuConfig.push(config[c]);
                            }
                        });

                        scope.open = function (type, data) {
                            LayoutService.clear();
                            LayoutService.openModal(type, data)
                        };

                        scope.run = function (cmd) {
                            if (scope[cmd.open] !== undefined) {
                                scope[cmd.open]()
                            } else if (LayoutService.isPanel(cmd.open)) {
                                // is panel
                                scope.openPanel(cmd.open, cmd.params)
                            } else if (ToolsService.isTool(cmd.open)) {
                                // is a tool, local or remote
                                scope.open("tool", {"processName": cmd.open})
                            } else {
                                // is controller
                                scope.open(cmd.open, cmd.params)
                            }
                        };

                        scope.openPanel = function (type, data) {
                            LayoutService.clear();
                            LayoutService.openPanel(type, data, false)
                        };

                        scope.toggleAnimation = function () {
                            $scope.animationsEnabled = !$scope.animationsEnabled;
                        };

                        scope.saveSession = function () {
                            SessionsService.save(SessionsService.current())
                        };

                        scope.workflows = function () {
                            scope.open('workflow')
                        }

                        scope.spatialHubLogin = function () {
                            SessionsService.saveAndLogin(SessionsService.current())
                        };

                        scope.loadSession = function (sessionId) {
                            SessionsService.load(sessionId)
                        };

                        scope.exportMap = function () {
                            scope.open('tool', {
                                processName: 'ToolExportMapService',
                                overrideValues: {ToolExportMapService: {input: {caption: {constraints: {defaultValue: (new Date())}}}}}
                            })
                        };

                        scope.isLoggedIn = $SH.userId !== undefined && $SH.userId !== null && $SH.userId.length > 0;
                        scope.isNotLoggedIn = !scope.isLoggedIn;
                    }
                };
            }])
}(angular));
