(function (angular) {
    'use strict';
    /**
     * Directive controlling the workflow annotation (Step 4) of the Export -> Points tool
     */
    angular.module('workflow-annotation-directive', [])
        .directive('workflowAnnotation', ['LayoutService', 'WorkflowService', 'LoggerService',
            function (LayoutService, WorkflowService, LoggerService) {
                var userDisplayName = $SH.userDisplayName || '',
                    userOrganisation = $SH.userOrganisation || '';

                return {
                    scope: {
                        value: '=value'
                    },
                    templateUrl: '/spApp/workflowAnnotation.htm',
                    link: function (scope, element, attrs) {
                        if (!scope.value) {
                            scope.value = {
                                dataSetAnnotation: '',
                                workflowAnnotation: {workflow: [], name: '', private: false},
                                userDisplayName: userDisplayName,
                                userOrganisation: userOrganisation,
                                layerUid: undefined
                            };
                        }

                        scope.$watch('value.layerUid', function (newValue, oldValue, scope) {
                            while (scope.value.workflowAnnotation.workflow.length > 0) scope.value.workflowAnnotation.workflow.pop();

                            var newWorkflow = LoggerService.get(scope.value.layerUid)
                            $.map(newWorkflow, function (i) {
                                scope.value.workflowAnnotation.workflow.push(i)
                            })

                            WorkflowService.initDescriptions(scope.value.workflowAnnotation.workflow)
                        })

                        scope.value.invalid = function () {
                            return !scope.value.dataSetAnnotation || !WorkflowService.isValid(scope.value.workflowAnnotation) || !scope.value.userOrganisation;
                        };

                        LayoutService.addToSave(scope);

                    }
                }

            }])
}(angular));