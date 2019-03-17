(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name GazAutoCompleteService
     * @description
     *   Service to list gazetteer objects
     */
    angular.module('gaz-auto-complete-service', ['layers-service'])
        .factory("GazAutoCompleteService", ["$http", "LayersService", function ($http, LayersService) {
            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'GazAutoCompleteService';
                httpconfig.method = method;

                return httpconfig;
            };

            return {
                /**
                 * Search gazetteer
                 * @memberof GazAutoCompleteService
                 * @param {string} searchTerm
                 * @returns {List} matched results
                 *
                 * @example
                 * Input:
                 * - searchTerm
                 *  "Creek"
                 *
                 * Output:
                 * [{
                     "pid": "6452999",
                     "fid": "cl2123",
                     "fieldname": "Gazetteer of Australia 2012",
                     "description": "SA, O, -30.57461, 139.43912",
                     "name": "Creek Bore, BORE, SA0016826",
                     "id": "SA0016826"
                     }]
                 */
                search: function (term) {
                    return $http.get(LayersService.url() + "/search?q=" + term + "&exclude=" + $SH.userObjectsFields, _httpDescription('search')).then(function (response) {
                        return response.data;
                    });
                }
            };
        }])
}(angular));