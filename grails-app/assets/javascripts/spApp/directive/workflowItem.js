(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name workflowItem
     * @description
     *   workflowItem contents for view, save
     */
    angular.module('workflow-item-directive', [])
        .directive('workflowItem', [function () {

            return {
                templateUrl: '/spApp/worflowItemCtrl.htm',
                scope: {
                    _workflow: '=?workflow',
                },
                link: function (scope, element, attrs) {

                    LayoutService.addToSave(scope);

                    scope.delete = function (item) {
                        for (var i in scope._workflow) {
                            if (scope._workflow[i] === item) {
                                scope._workflow.splice(i, 1)
                            }
                        }
                    }
                }
            }

        }])
}(angular));