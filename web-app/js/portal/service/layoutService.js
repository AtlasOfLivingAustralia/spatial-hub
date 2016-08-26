(function (angular) {
    'use strict';
    angular.module('layout-service', [])
        .factory("LayoutService", [function () {

            var showLegend = true
            var showOptions = false
            return {
                settings: function () {
                    return {
                        showLegend: showLegend,
                        showOptions: showOptions
                    }
                },
                enable: function (type) {
                    if (type === 'legend') {
                        showLegend = true;
                        showOptions = false;
                    } else if (type === 'options') {
                        showLegend = false;
                        showOptions = true;
                    }
                }
            };
        }])
}(angular));