(function (angular) {
    'use strict';
    angular.module('sessions-service', [])
        .factory('SessionsService', ['$http', 'MapService', function ($http, MapService) {

            var _this = {
                current: function () {
                    if (MapService.leafletScope) {
                        return {
                            layers: MapService.mappedLayers,
                            extents: MapService.getExtents(),
                            basemap: MapService.leafletScope.getBaseMap()
                        }
                    } else {
                        return {}
                    }
                },
                list: function () {
                    return $http.get("portal/listSaves").then(function (response) {
                        return response.data
                    });
                },
                save: function (data) {
                    bootbox.prompt({
                        title: "Enter a name to save this session",
                        value: "My session " + new Date().toLocaleString(),
                        callback: function (name) {
                            if (name !== null) {
                                if (name.length === 0) {
                                    name = 'My saved session'
                                }
                                data.name = name;
                                return $http.post("portal/saveData?sessionId=" + $SH.sessionId, data).then(function (response) {
                                    bootbox.alert('<h3>Session Saved</h3><br/><br/>URL to retrived this saved session<br/><br/><a target="_blank" href="' + response.data.url + '">' + response.data.url + '</a>')
                                });
                            }
                        }
                    });
                },
                saveAndLogin: function (data, urlTemplate, encode, skipALALoginUrl) {
                    //this is not a permanent save
                    return $http.post("portal/saveAny?sessionId=" + $SH.sessionId + "&save=false", data).then(function (response) {
                        //Not sure why service is not preserved and the additional / is added. Workaround with /?
                        var url = response.data.url.replace("?", "/?");

                        if (urlTemplate) {
                            if (encode)
                                url = encodeURIComponent(url);
                            window.location.href = urlTemplate.replace("$url", url);
                        } else {
                            window.location.href = $SH.loginUrl + encodeURIComponent(url)
                        }
                    });
                },
                get: function (sessionId) {
                    return $http.get("portal/getSaved?sessionId=" + sessionId).then(function (response) {
                        return response.data
                    });
                },
                'delete': function (sessionId) {
                    return $http.get("portal/deleteSaved?sessionId=" + sessionId).then(function (response) {
                        return response.data
                    });
                },
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