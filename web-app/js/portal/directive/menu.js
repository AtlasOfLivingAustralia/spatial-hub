(function (angular) {
    'use strict';
    angular.module('sp-menu-directive', []).directive('spMenu',
        ["$rootScope", 'MapService', function ($rootScope, MapService) {
            return {
                scope: {
                    custom: '&onCustom'
                },
                templateUrl: 'portal/' + "menuContent.html",
                link: function (scope, element, attrs) {
                    scope.open = function (type, data) {
                        $rootScope.openModal(type, data)
                    };

                    scope.openPanel = function (type, data) {
                        $rootScope.openPanel(type, data)
                    }

                    scope.toggleAnimation = function () {
                        $scope.animationsEnabled = !$scope.animationsEnabled;
                    };

                    scope.setScopeOption = function(data) {
                        $rootScope.importOpt = data;
                    }

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
                }
            };
        }])
}(angular));