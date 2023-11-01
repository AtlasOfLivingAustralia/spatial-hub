(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name ToolAreaReportService
     * @description
     *   Client side tool to generate and display an area report
     */
    angular.module('tool-area-report-service', [])
        .factory("ToolAreaReportService", ["$http", "$q", "MapService", "LayoutService", function ($http, $q, MapService, LayoutService) {
            return {

                // Override text with view-config.json
                spec: {
                    "input": [
                        {
                            "description": $i18n("Select area."),
                            "type": "area",
                            "constraints": {
                                "min": 1,
                                "max": 1,
                                "optional": false,
                                "excludeWorld": true
                            }
                        }],
                    "description": $i18n("Area Report")
                },

                execute: function (inputs) {
                    LayoutService.openModal('areaReport', inputs[0][0], false);

                    return $q.when(true)
                }
            };
        }])
}(angular));
