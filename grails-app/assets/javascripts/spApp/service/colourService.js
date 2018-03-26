(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name ColourService
     * @description
     *   Default layer colour service
     */
    angular.module('colour-service', [])
        .factory("ColourService", [function () {
            var colours = ['3366CC', 'DC3912', 'FF9900', '109618', '990099', '0099C6', 'DD4477', '66AA00', 'B82E2E', '316395', '994499', '22AA99', 'AAAA11', '6633CC', 'E67300', '8B0707', '651067', '329262', '5574A6', '3B3EAC', 'B77322', '16D620', 'B91383', 'F4359E', '9C5935', 'A9C413', '2A778D', '668D1C', 'BEA413', '0C5922', '743411'];
            var index = 0;

            return {
                /**
                 * Get the next colour
                 * @memberof ColourService
                 * @returns {String} RGB, e.g. '3366CC'
                 */
                nextColour: function () {
                    var colour = colours[index % colours.length];

                    index++;

                    return colour;
                }
            };
        }])
}(angular));
