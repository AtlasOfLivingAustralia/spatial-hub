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
        .factory('SessionsService', ['$http', '$rootScope', 'MapService', 'BiocacheService',
            function ($http, $rootScope, MapService, BiocacheService) {

            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'SessionsService';
                httpconfig.method = method;

                return httpconfig;
            };

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
                        var layers = [];
                        for (var idx in MapService.mappedLayers) {
                            var src = MapService.mappedLayers[idx];

                            // Take a copy of the display parameters
                            var leaflet = Util.deepCopy(src.leaflet);

                            // Copy layer state
                            var lyr = {
                                // mapService info
                                uid: src.uid,
                                id: src.id,

                                // general info
                                visible: src.visible,
                                layertype: src.layertype,
                                legendurl: src.legendurl,
                                name: src.name,
                                type: src.type,
                                displaypath: src.displaypath,
                                metadata: src.metadata,
                                bbox: src.bbox,
                                legend: src.legend,

                                // species list info
                                species_list: src.species_list,

                                // wms layer info
                                url: src.url,

                                // area layer info
                                area_km: src.area_km,
                                pid: src.pid,
                                wkt: (src.pid === undefined ? src.wkt : undefined),

                                // biocache query info
                                ws: src.ws,
                                fq: src.fq,
                                q: src.q,
                                qid: src.qid,
                                bs: src.bs,

                                // legend state info
                                hidelegend: src.hidelegend,
                                displayname: src.displayname,
                                color: src.color,
                                colorType: src.colorType,
                                facet: src.facet,
                                size: src.size,
                                opacity: src.opacity,
                                uncertainty: src.uncertainty,
                                contextualSelection: src.contextualSelection,
                                contextualFilter: src.contextualFilter,
                                facetSelectionCount: src.facetSelectionCount,

                                facets: src.facets ? $.map(src.facets, function (v) {
                                    // Session only needs to store the list of selected items.
                                    // Only the fq is required. It will be deleted after facet.data is reloaded.
                                    var copy = $.merge({}, v);

                                    delete copy.data;

                                    if (copy._fq === undefined && v.data && v.data.length > 0) {
                                        copy._fq = []
                                        $.map(v.data, function (d) {
                                            copy._fq.push(BiocacheService.facetToFq(v.data, false))
                                        })
                                    }

                                    return copy;
                                }) : undefined,

                                index: src.index,

                                // layer display info
                                leaflet: leaflet,

                                // scatterplot info
                                scatterplotFq: src.scatterplotFq,
                                scatterplotDataUrl: src.scatterplotDataUrl,
                                scatterplotUrl: src.scatterplotUrl,
                                scatterplotUpdating: src.scatterplotUpdating,
                                scatterplotSelection: src.scatterplotSelection,
                                highlightWkt: src.highlightWkt,
                                scatterplotSelectionExtents: src.scatterplotSelectionExtents,
                                scatterplotSelectionCount: src.scatterplotSelectionCount,
                                scatterplotLabel1: src.scatterplotLabel1,
                                scatterplotLabel2: src.scatterplotLabel2,

                                // adhoc group info
                                inAdhocQ: src.inAdhocQ,
                                outAdhocQ: src.outAdhocQ,
                                adhocGroup: src.adhocGroup,
                                adhocGroupSize: src.adhocGroupSize,
                                adhocBBoxes: src.adhocBBoxes,
                                isSelectedFacetsOnly: src.isSelectedFacetsOnly,
                                isWithoutSelectedFacetsOnly: src.isWithoutSelectedFacetsOnly,

                                // expert distribution info
                                metadataUrl: src.metadataUrl,
                                geom_idx: src.geom_idx,
                                query: src.query
                            };
                            layers.push(lyr);
                        }

                        return {
                            layers: layers,
                            extents: MapService.getExtents(),
                            basemap: MapService.leafletScope.getBaseMap(),
                            projection: $SH.projection
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
                    return $http.get($SH.baseUrl + "/portal/sessions", _httpDescription('list')).then(function (response) {
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
                        title: $i18n(350, "Enter a name to save this session"),
                        value: $i18n(351, "My session") + " " + new Date().toLocaleString(),
                        callback: function (name) {
                            if (name !== null) {
                                if (name.length === 0) {
                                    name = $i18n(403, "My saved session")
                                }
                                data.name = name;
                                return $http.post($SH.baseUrl + "/portal/session/" + $SH.sessionId, data, _httpDescription('save')).then(function (response) {
                                    bootbox.alert('<h3>' + $i18n(404, "Session Saved") + '</h3><br/><br/>' + $i18n(405, "URL to retrived this saved session") + '<br/><br/><a target="_blank" href="' + response.data.url + '">' + response.data.url + '</a>')
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
                    return $http.post($SH.baseUrl + "/portal/sessionCache/" + $SH.sessionId + "?save=false", data, _httpDescription('saveAndLogin')).success(function (response) {
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
                    return $http.get($SH.baseUrl + "/portal/session/" + sessionId, _httpDescription('get')).then(function (response) {
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
                    return $http.delete($SH.baseUrl + "/portal/session/" + sessionId, _httpDescription('delete')).then(function (response) {
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
                        _this._load(data, sessionId);
                    })
                },

                _load: function (sessionData, sessionId) {
                    if (sessionData && sessionData.extents) {
                        MapService.removeAll();

                        $SH.projection = sessionData.projection;
                        MapService.leafletScope.updateCRS();

                        MapService.leafletScope.zoom(sessionData.extents);

                        MapService.setBaseMap(sessionData.basemap);

                        LoggerService.log('Map', 'Session', {sessionId: sessionId})

                        //add in index order
                        sessionData.layers.sort(function (a, b) {
                            return a.index - b.index
                        });
                        var uidOffset = MapService.uid + 1;
                        for (var i = 0; i < sessionData.layers.length; i++) {
                            sessionData.layers[i].fromSave = true;
                            sessionData.layers[i].uid += uidOffset;
                            sessionData.layers[i].log = false
                            MapService.add(sessionData.layers[i])
                        }
                    }
                }
            };

            $rootScope.$on('loadSession', function (event, data) {
                _this._load(data)
            });

            return _this;
        }])
}(angular));