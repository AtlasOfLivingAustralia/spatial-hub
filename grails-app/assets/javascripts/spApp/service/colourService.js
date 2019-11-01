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
            var linearColours = ['0506df', '0072ff','00f1ff', '00ff06', 'f6ff01', 'ff8a00', 'fe1c00'];
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
                },

                /**
                 * Get colour at index as
                 * @memberof ColourService
                 * @returns {Object} red, green, blue. e.g. 'red: 255, green: 255, blue: 0'
                 */
                getColour: function (pos) {
                    var c = colours[pos % colours.length];
                    return this.parseHexToRGB(c);
                },
                /**
                 * Get linear colour at index as
                 * @memberof ColourService
                 * @returns {Object} red, green, blue. e.g. 'red: 255, green: 255, blue: 0'
                 */
                getLinearColour: function (pos) {
                    if (pos >= linearColours.length)
                        pos = linearColours.length - 1;
                    var c = linearColours[pos % linearColours.length];
                    return this.parseHexToRGB(c);
                },
                parseHexToRGB: function (c) {
                    return {
                        red: parseInt(c.substr(0, 2), 16),
                        green: parseInt(c.substr(2, 2), 16),
                        blue: parseInt(c.substr(4, 2), 16)
                    }
                }

            };
        }])
}(angular));
