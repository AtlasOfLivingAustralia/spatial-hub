(function (angular) {
    'use strict';
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