(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name i18nService
     * @description
     *   Service to override template and javascript text
     */
    angular.module('i18n-service', [])
        .factory("i18nService", ["$http", "gMessages", function ($http, gMessages) {
            var map = gMessages;

            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'i18nService';
                httpconfig.method = method;

                return httpconfig;
            };

            var object = {
                map: map,
                /**
                 * Get substituted value
                 * @memberof i18nService
                 * @param {string} key integer index of or default of string replace
                 * @returns {string} replaced value, or the input
                 *
                 * @example
                 * Input:
                 * - k
                 *  "1"
                 *
                 * Output:
                 *  "one"
                 */
                v: function (k) {
                    var key = ("" + k).replace(" ", "_");
                    if (map[key] !== undefined) {
                        return map[key]
                    } else {
                        return k
                    }
                },
                /**
                 * Set the substituted value in the client
                 * @memberof i18nService
                 * @param {string} key index of or default value
                 * @param {string} value replacement text
                 */
                set: function (k, v) {
                    k = ('' + k).replace(" ", "_");

                    map[k] = v;
                },
                /**
                 * Save the substituted value on the server
                 * @memberof i18nService
                 * @param {string} key index of or default value
                 * @param {string} value replacement text
                 */
                commit: function (k, v) {
                    let browser_lang = window.navigator.language;
                    if(browser_lang == "en" || browser_lang == "en-US") {
                        browser_lang = "default";
                    }
                    k = ('' + k).replace(" ", "_");

                    map[k] = v;

                    $http.post($SH.baseUrl + "/portal/i18n?lang=" + browser_lang + "&hub=" + $SH.hub, {
                        key: k,
                        value: v
                    }, _httpDescription('commit'))
                }
            };

            return object;
        }])
}(angular));
