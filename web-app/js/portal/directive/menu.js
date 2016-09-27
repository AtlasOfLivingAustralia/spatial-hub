(function (angular) {
    'use strict';
    angular.module('sp-menu-directive', []).directive('spMenu',
        ["LayoutService", 'MapService', 'SessionsService', function (LayoutService, MapService, SessionsService) {
            return {
                scope: {
                    custom: '&onCustom'
                },
                templateUrl: 'portal/' + "menuContent.html",
                link: function (scope, element, attrs) {
                    scope.open = function (type, data) {
                        LayoutService.openModal(type, data)
                    };

                    scope.openPanel = function (type, data) {
                        LayoutService.openPanel(type, data)
                    }

                    scope.toggleAnimation = function () {
                        $scope.animationsEnabled = !$scope.animationsEnabled;
                    };

                    scope.hidePanel = function () {
                        $("#left-panel")[0].style.marginLeft="-410px"
                        $("#right-panel")[0].style.marginLeft="0px"
                        $("#restore-left-panel").show()
                        MapService.leafletScope.invalidate()
                    }
                    
                    scope.showPanel = function () {
                        $("#restore-left-panel").hide()
                        $("#left-panel")[0].style.marginLeft="0px"
                        $("#right-panel")[0].style.marginLeft="400px"
                        MapService.leafletScope.invalidate()
                    }

                    scope.saveSession = function () {
                        SessionsService.save({
                            layers: MapService.mappedLayers,
                            extents: MapService.getExtents(),
                            basemap: MapService.leafletScope.getBaseMap()
                        })
                    }

                    scope.loadSession = function (sessionId) {
                        SessionsService.load(sessionId)
                    }
                }
            };
        }])
}(angular));