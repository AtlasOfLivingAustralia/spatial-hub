(function (angular) {
    'use strict';
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
                                "optional": false
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
