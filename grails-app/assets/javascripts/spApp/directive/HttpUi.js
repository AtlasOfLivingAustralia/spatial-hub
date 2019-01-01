(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name selectArea
     * @description
     *   Area selection controls
     */
    angular.module('http-ui-directive', [])
        .directive('httpUi', ['HttpService', 'LayoutService', function (HttpService, LayoutService) {

            return {
                templateUrl: '/spApp/HttpUi.htm',
                scope: {},
                link: function (scope, element, attrs) {

                    scope.requests = HttpService._requests;
                    scope.errors = HttpService._errors;

                    scope.retry = function (error) {
                        LayoutService.restoreCheckpoint(error.layout)
                    };

                    scope.failNext = function () {
                        HttpService.forceFail()
                    }
                }
            }

        }])
}(angular));