(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name layerListUpload
     * @description
     *   Control to upload a text file into the client
     */
    angular.module('layer-list-upload-directive', []).directive('layerListUpload', ['$timeout', function ($timeout) {
        return {
            scope: {
                _custom: '&onCustom'
            },
            // TODO: move template to a separate file
            template: '<input type="file" id="file" name="file"/><br/><button class="btn" ng-click="upload()">Upload</button>',
            link: function (scope, element, attrs) {
                scope.upload = function () {
                    var f = element.children()[0].files[0], r = new FileReader();
                    r.onloadend = function (e) {
                        scope.data = e.target.result;

                        $timeout(function () {
                            scope._custom()(scope.data)
                        }, 0)
                    };
                    r.readAsBinaryString(f);
                }
            }
        };
    }])
}(angular));