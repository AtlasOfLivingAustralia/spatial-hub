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
        .directive('workflowItem', ['LayoutService', function (LayoutService) {

            return {
                templateUrl: '/spApp/workflowItemCtrl.htm',
                scope: {
                    _workflow: '=?workflow',
                },
                link: function (scope, element, attrs) {
                    console.log(scope._workflow)

                    LayoutService.addToSave(scope);

                    scope.delete = function (item) {
                        for (var i in scope._workflow) {
                            if (scope._workflow[i] === item) {
                                scope._workflow.splice(i, 1)
                            }
                        }
                    }

                    scope.toDate = function (str) {
                        if (str == null) {
                            return ''
                        } else {
                            var date = new Date(str)

                            return date
                        }
                    }
                }
            }

        }])
}(angular));