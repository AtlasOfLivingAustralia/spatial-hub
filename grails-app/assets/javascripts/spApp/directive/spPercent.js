(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name spPercent
     * @description
     *    ng-model translation between % (0 - 100) display and decimal (0 - 1) value
     */
    angular.module('sp-percent-directive', []).directive('spPercent', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                if(ngModel) {

                    ngModel.$parsers.push(function (value) {
                        return value/100;
                    });

                    ngModel.$formatters.push(function (value) {
                        return value*100;
                    });

                }
            }
        };
    });
})(angular);