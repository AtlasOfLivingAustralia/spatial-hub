(function (angular) {
    'use strict';
    /**
     * Directive controlling the workflow annotation (Step 4) of the Export -> Points tool
     */
    angular.module('workflow-annotation-directive', [])
        .directive('workflowAnnotation', ['LayoutService',
            function (LayoutService) {
                var userDisplayName = $SH.userDisplayName || '',
                    userOrganisation = $SH.userOrganisation || '';

                return {
                    scope: {
                        value: '=value'
                    },
                    templateUrl: '/spApp/workflowAnnotation.htm',
                    link: function (scope, element, attrs) {
                        console.log(scope);
                        if (!scope.value) {
                            scope.value = {
                                dataSetAnnotation: '',
                                workflowAnnotation: {},
                                userDisplayName: userDisplayName,
                                userOrganisation: userOrganisation,
                            };
                        }

                        scope.value.invalid = function() {
                            return !scope.value.dataSetAnnotation || !scope.value.workflowAnnotation || !scope.value.userOrganisation;
                        };

                        LayoutService.addToSave(scope);

                    }
                }

            }])
}(angular));