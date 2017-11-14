(function (angular) {
    'use strict';
    angular.module('tool-area-report-service', [])
        .factory("ToolAreaReportService", ["$http", "$q", "MapService", "LayoutService", function ($http, $q, MapService, LayoutService) {
            return {
                spec: {
                    "input": [
                        {
                            "description": "Select area.",
                            "type": "area",
                            "constraints": {
                                "min": 1,
                                "max": 1,
                                "optional": false
                            }
                        }],
                        "description": "Area Report"
                    },

                execute: function (inputs) {
                    LayoutService.openModal('areaReport', inputs[0][0], false);

                    return $q.when(true)
                }
            };
        }])
}(angular));
