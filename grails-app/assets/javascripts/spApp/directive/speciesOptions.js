(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name speciesOptions
     * @description
     *    General occurrence layer filter toggles
     */
    angular.module('species-options-directive', ['map-service', 'lists-service'])
        .directive('speciesOptions', ['MapService', 'ListsService', '$timeout', 'LayoutService', '$rootScope',
            function (MapService, ListsService, $timeout, LayoutService, $rootScope) {

                return {
                    scope: {
                        _value: '=value',
                        _areaIncludes: '=?areaIncludes',
                        _spatialValidity: '=?spatialValidity',
                        _absentOption: '=?absentOption',
                        _endemicIncludes: '=?endemicIncludes',
                        _disabled: "=?disableCheck"
                    },

                    templateUrl: '/spApp/speciesOptionsContent.htm',
                    link: function (scope, element, attrs) {

                        //defaults
                        if (scope._areaIncludes === undefined) scope._areaIncludes = false;
                        if (scope._spatialValidity === undefined) scope._spatialValidity = true;
                        if (scope._absentOption === undefined) scope._absentOption = false;
                        if (scope._endemicIncludes === undefined) scope._endemicIncludes = false;

                        //kosher includes
                        if (scope._value.spatiallyValid === undefined) scope._value.spatiallyValid = true;
                        if (scope._value.spatiallySuspect === undefined) scope._value.spatiallySuspect = false;
                        if (scope._value.spatiallyUnknown === undefined) scope._value.spatiallyUnknown = false;

                        //absences
                        if (scope._value.includeAbsences === undefined) scope._value.includeAbsences = false;

                        //area includes
                        if (scope._value.includeExpertDistributions === undefined) scope._value.includeExpertDistributions = false;
                        if (scope._value.includeChecklists === undefined) scope._value.includeChecklists = false;
                        if (scope._value.includeAnimalMovement === undefined) scope._value.includeAnimalMovement = false;

                        //endemic includes
                        if (scope._value.includeEndemic === undefined) scope._value.includeEndemic = false;

                        //Broadcast selected species options,  e.g selectFacets watch the changes and update the query.
                        scope.$watch('_value', function(newValue, oldValue) {
                            if (!newValue.spatiallyValid && !newValue.spatiallySuspect && !newValue.spatiallyUnknown) {
                                alert("Select at least one spatial related options!")
                                scope._value.spatiallyValid = oldValue.spatiallyValid;
                                scope._value.spatiallySuspect = oldValue.spatiallySuspect;
                                scope._value.spatiallyUnknown = oldValue.spatiallyUnknown;
                            } else {
                                $rootScope.$broadcast('speciesOptionsChange', scope._value);
                            }
                        }, true);

                        scope.showWarning = true;
                        LayoutService.addToSave(scope);
                        //TODO: include _value.fq
                    }
                }

            }])
}(angular));