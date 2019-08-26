(function (angular) {
    'use strict';
    /**
     * Directive controlling the workflow annotation (Step 4) of the Export -> Points tool
     */
    angular.module('workflow-annotation-directive', [])
        .directive('workflowAnnotation', ['LayoutService',
            function (LayoutService) {

                return {
                    scope: {
                        value: '=value'
                    },
                    templateUrl: '/spApp/workflowAnnotation.htm',
                    link: function (scope, element, attrs) {

                        if (!scope.value) {
                            scope.value = {
                                dataSetAnnotation: '',
                                workflowAnnotation: '',
                                userDisplayName: $SH.userDisplayName,
                                userOrganisation: $SH.userOrganisation
                            };
                        }

                        LayoutService.addToSave(scope);

                    }
                }

            }])
}(angular));