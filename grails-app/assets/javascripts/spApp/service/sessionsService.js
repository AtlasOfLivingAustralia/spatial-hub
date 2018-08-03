(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name SessionsService
     * @description
     *   Access to spatial-hub sessions
     */
    angular.module('sessions-service', [])
        .factory('SessionsService', ['$http', 'MapService', function ($http, MapService) {

            var _this = {
                /**
                 * Retrieve the current session state
                 * @memberof SessionsService
                 * @returns {SessionState}
                 *
                 * @example
                 * Output:
                 *  {TODO: example}
                 */
                current: function () {
                    if (MapService.leafletScope) {
                        //TODO: remove temporary information from output
                        return {
                            layers: MapService.mappedLayers,
                            extents: MapService.getExtents(),
                            basemap: MapService.leafletScope.getBaseMap()
                        }
                    } else {
                        return {}
                    }
                },
                /**
                 * Retrieve saved sessions for the logged in user
                 * @memberof SessionsService
                 * @returns {Promise(List(SessionState))} list of sessions
                 *
                 * @example
                 * Output:
                 *  {TODO: example}
                 */
                list: function () {
                    return $http.get($SH.baseUrl + "/portal/sessions").then(function (response) {
                        return response.data
                    });
                },
                /**
                 * UI prompt to name and save the current session
                 * @memberof SessionsService
                 *
                 */
                save: function (data) {
                    bootbox.prompt({
                        title: $i18n("Enter a name to save this session"),
                        value: $i18n("My session") + " " + new Date().toLocaleString(),
                        callback: function (name) {
                            if (name !== null) {
                                if (name.length === 0) {
                                    name = $i18n('My saved session')
                                }
                                data.name = name;
                                return $http.post($SH.baseUrl + "/portal/session/" + $SH.sessionId, data).then(function (response) {
                                    bootbox.alert('<h3>' + $i18n('Session Saved') + '</h3><br/><br/>' + $i18n('URL to retrived this saved session') + '<br/><br/><a target="_blank" href="' + response.data.url + '">' + response.data.url + '</a>')
                                });
                            }
                        }
                    });
                },
                /**
                 * Do temporary save session and redirect so that a login is prompted and the session is not lost
                 * @memberof SessionsService
                 * @param {SessionState} session data
                 * @param {string} (optional) login template to use instead of the default login URL
                 * @param {boolean} true to encode the return URL
                 * @param {boolean} TODO: login not required
                 */
                saveAndLogin: function (data, urlTemplate, encode, skipALALoskipALALoginUrlginUrl) {
                    //this is not a permanent save
                    return $http.post($SH.baseUrl + "/portal/sessionCache/" + $SH.sessionId + "?save=false", data).success(function (response) {
                        //Not sure why service is not preserved and the additional / is added. Workaround with /?
                        var url;
                        if (response.data) {
                            url = response.data.url.replace("?", "/?");
                        } else if (response.url) {
                            url = response.url.replace("?", "/?");
                        }

                        if (url) {

                            if (urlTemplate) {
                                if (encode)
                                    url = encodeURIComponent(url);
                                window.location.href = urlTemplate.replace("$url", url);
                            } else if (skipALALoskipALALoginUrlginUrl) {
                                window.location.href = url
                            } else
                                window.location.href = $SH.loginUrl + encodeURIComponent(url)
                        }

                    }).error(function (err) {          //second function "error"
                        return false;
                    })
                },
                /**
                 * Retrieve saved session state
                 * @memberof SessionsService
                 * @param {string} session id
                 * @return {Promise(SessionState)} saved session state
                 */
                get: function (sessionId) {
                    return $http.get($SH.baseUrl + "/portal/session/" + sessionId).then(function (response) {
                        return response.data
                    });
                },
                /**
                 * Delete a saved session. Must be the same user or ADMIN
                 * @memberof SessionsService
                 * @param {string} session id
                 * @return {Promise}
                 */
                'delete': function (sessionId) {
                    return $http.delete($SH.baseUrl + "/portal/session/" + sessionId).then(function (response) {
                        return response.data
                    });
                },
                /**
                 * Load a saved session. This adds layers, changes the basemap and sets the zoom/extents of the
                 * current session.
                 *
                 * Note: map layers are not removed.
                 *
                 * @memberof SessionsService
                 * @param {string} session id
                 */
                load: function (sessionId) {
                    return this.get(sessionId).then(function (data) {
                        MapService.removeAll();

                        MapService.leafletScope.zoom(data.extents);

                        MapService.setBaseMap(data.basemap);

                        //add in index order
                        data.layers.sort(function (a, b) {
                            return a.index - b.index
                        });
                        for (var i = 0; i < data.layers.length; i++) {
                            MapService.add(data.layers[i])
                        }
                    })
                }
            };

            return _this;
        }])
}(angular));