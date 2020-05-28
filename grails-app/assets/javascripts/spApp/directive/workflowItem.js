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
                    _workflow: '=?workflow'
                },
                link: function (scope, element, attrs) {
                    LayoutService.addToSave(scope);

                    scope.delete = function (item) {
                        for (var i in scope._workflow.workflow) {
                            if (scope._workflow.workflow[i] === item) {
                                scope._workflow.workflow.splice(i, 1)
                            }
                        }
                    }

                    scope.hasSubitems = function (item) {
                        if (!item.data) return false
                        return $.isArray(item.data.data)
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