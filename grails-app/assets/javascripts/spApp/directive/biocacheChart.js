/*
 * Copyright (C) 2019 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * Created by Temi on 2019-06-24.
 */
(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name biocacheChart
     * @description
     *   Radio button list of predefined areas
     */
    angular.module('biocache-chart-directive', ["chart.js"]).directive('biocacheChart',
        function () {
            return {
                link: function (scope, element, attrs) {
                    var config = {
                        biocacheServiceUrl: $SH.biocacheServiceUrl,
                        biocacheWebappUrl: $SH.biocacheUrl,
                        query: scope.qid,
                        queryContext: "",
                        charts: $SH.config.charts,
                        chartControls: false,
                        $i18n: $i18n
                    };

                    // Remove previous chart if exists
                    for (let idx in config.charts) {
                        delete config.charts[idx].chart;
                        delete config.charts[idx].datastructure;
                        delete config.charts[idx].sliderFq;
                        delete config.charts[idx].maxValue;
                        delete config.charts[idx].divId;
                    };

                    ALA.BiocacheCharts('charts', config);
                }
            };
        })
}(angular));
