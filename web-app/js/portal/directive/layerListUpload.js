(function (angular) {
    'use strict';
    angular.module('layer-list-upload-directive', []).directive('layerListUpload', ['$timeout', function ($timeout) {
        return {
            scope: {
                custom: '&onCustom'
            },
            template: '<input type="file" id="file" name="file"/><br/><button class="btn" ng-click="upload()">Upload</button>',
            link: function (scope, element, attrs) {
                scope.upload = function () {
                    var f = element.children()[0].files[0], r = new FileReader();
                    r.onloadend = function (e) {
                        scope.data = e.target.result;

                        $timeout(function () {
                            scope.custom()(scope.data)
                        }, 0)
                    }
                    r.readAsBinaryString(f);
                }
            }
        };
    }])
}(angular));