(function (angular) {
    'use strict';
    angular.module('sp-menu-directive', []).directive('spMenu',
        ["$rootScope", function ($rootScope) {
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

                }
            };
        }])
}(angular));