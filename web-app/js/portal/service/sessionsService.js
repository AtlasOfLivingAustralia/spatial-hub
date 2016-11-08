(function (angular) {
    'use strict';
    angular.module('sessions-service', [])
        .factory('SessionsService', ['$http', 'MapService', function ($http, MapService) {

            return {
                list: function () {
                    return $http.get("portal/listSaves").then(function (response) {
                        return response.data
                    });
                },
                save: function (data) {
                    bootbox.prompt({
                        title: "Enter a name to save this session",
                        callback: function (name) {
                            if (name != null) {
                                if (name.length == 0) {
                                    name = 'My saved session'
                                }
                                data.name = name
                                return $http.post("portal/saveData?sessionId=" + SpatialPortalConfig.sessionId, data).then(function (response) {
                                    bootbox.alert('<h3>Session Saved</h3><br/><br/>URL to retrived this saved session<br/><br/><a href="' + response.data.url + '">' + response.data.url + '</a>')
                                });
                            }
                        }
                    });
                },
                saveLogin: function (data) {
                    return $http.post("portal/saveData?sessionId=" + SpatialPortalConfig.sessionId + "&save=false", data).then(function (response) {
                        //Not sure why service is not preserved and the additional / is added. Workaround with /?
                        window.location.href = SpatialPortalConfig.loginUrl + '?service=' + encodeURI(response.data.url.replace("?", "/?"))
                    });
                },
                get: function (sessionId) {
                    return $http.get("portal/getSaved?sessionId=" + sessionId).then(function (response) {
                        console.log(response.data)
                        return response.data
                    });
                },
                delete: function (sessionId) {
                    return $http.get("portal/deleteSaved?sessionId=" + sessionId).then(function (response) {
                        console.log(response.data)
                        return response.data
                    });
                },
                load: function (sessionId) {
                    this.get(sessionId).then(function (data) {
                        MapService.removeAll()

                        MapService.leafletScope.zoom(data.extents)

                        MapService.setBaseMap(data.basemap)

                        //add in index order
                        data.layers.sort(function (a, b) {
                            return a.index - b.index
                        })
                        for (var i = 0; i < data.layers.length; i++) {
                            MapService.add(data.layers[i])
                        }
                    })
                }
            }
        }])
}(angular));