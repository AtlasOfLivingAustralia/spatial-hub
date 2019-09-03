(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name LoggerService
     * @description
     *   Logger for client side tools
     */
    angular.module('logger-service', [])
        .factory('LoggerService', ['$http', function ($http) {

            //TODO: current session history for retrieval of client side tool outputs (stored) and spatial-service outputs
            var history = [];
            var paused = false;

            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'LoggerService';
                httpconfig.method = method;

                return httpconfig;
            };

            var thiz = {
                /**
                 * Log event for this user. e.g. client side tool usage
                 *
                 * @memberof LoggerService
                 * @param {string} category1 top level event category
                 * @param {string} category2 detail level event category
                 * @param {map} data data to log
                 * @returns {Promise}
                 */
                log: function (category1, category2, data) {
                    if (paused) return $q.when()

                    history.push({category1: category1, category2: category2, data: data})

                    var params = '?category1=' + encodeURIComponent(category1) +
                        '&category2=' + encodeURIComponent(category2) +
                        '&sessionId=' + encodeURIComponent($SH.sessionId) +
                        '&userId=' + encodeURIComponent($SH.userId);

                    return $http.post($SH.layersServiceUrl + "/log" + params, data, _httpDescription('log', {
                        withCredentials: true,
                        ignoreErrors: true
                    }))
                },

                /**
                 * Add layerId to the most recent local log event.
                 *
                 * @param layerId
                 */
                addLayerId: function (layerId) {
                    if (!paused && history.length > 0) {
                        var logEvent = history[history.length - 1]
                        if (!logEvent.outputs) {
                            logEvent.outputs = []
                        }
                        logEvent.outputs.push(layerId)
                    }
                },

                pause: function () {
                    paused = true
                },

                resume: function () {
                    paused = false
                },

                /**
                 * Get history events only for the given layerId
                 *
                 * @returns Array of history events
                 */
                get: function (layerId) {
                    var events = []
                    var targetIds = [layerId]
                    for (var i = history.length - 1; i >= 0; i--) {
                        for (var j = targetIds.length; j >= 0; j--) {
                            if (history[i].outputs.indexOf(targetIds[j]) >= 0) {
                                events.push(history[i])

                                // find any input layerIds
                                $.merge(targetIds, thiz._findLayerIds(history[i].data))
                            }
                        }
                    }

                    return events
                },

                _findLayerIds: function (item) {
                    var found = []
                    if (item instanceof Array) {
                        $.each(item, function (idx, i) {
                                $.merge(found, thiz._findLayerIds(i))
                            }
                        )
                    } else if (item instanceof Object) {
                        $.each(item, function (idx, i) {
                                if (idx === 'layerId') {
                                    found.push(item[idx].layerId)
                                }
                                $.merge(found, thiz._findLayerIds(i))
                            }
                        )
                    }

                    // remove any duplicates
                    var unique = []
                    $.map(found, function (v) {
                        if (unique.indexOf(v) < 0) {
                            unique.push(v)
                        }
                    })

                    return unique
                },

                search: function (groupBy, countBy, sessionId, category1, category2, offset, max) {
                    var params = ''
                    if (groupBy) params += '&groupBy=' + encodeURIComponent(groupBy)
                    if (countBy) params += '&countBy=' + encodeURIComponent(countBy)
                    if (sessionId) params += '&sessionId=' + encodeURIComponent(sessionId)
                    if (category1) params += '&category1=' + encodeURIComponent(category1)
                    if (category2) params += '&category2=' + encodeURIComponent(category2)
                    if (offset) params += '&offset=' + encodeURIComponent(offset)
                    if (max) params += '&max=' + encodeURIComponent(max)

                    return $http.get($SH.layersServiceUrl + "/log/search?" + params, _httpDescription('search', {
                        withCredentials: true,
                        ignoreErrors: true,
                        headers: {Accept: "application/json"}
                    }))
                },

                localHistory: function () {
                    return history
                }
            }

            return thiz;
        }])
}(angular));