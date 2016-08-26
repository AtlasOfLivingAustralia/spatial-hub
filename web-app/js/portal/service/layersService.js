(function (angular) {
    'use strict';
    angular.module('layers-service', [])
        .factory('LayersService', ['$http', function ($http) {
            var layers = []

            $http.get(SpatialPortalConfig.layersServiceUrl + "/fields/search?q=").then(function (data) {
                layers = data.data;
            })

            return {
                getField: function (field, start, max, q) {
                    return $http.get(this.url() + "/field/" + field + "?start=" + start + "&pageSize=" + max +
                        "&q=" + q)
                },
                getLayers: function () {
                    return $http.get(this.url() + "/fields/search?q=")
                },
                searchLayers: function (q) {
                    return $http.get(this.url() + '/fields/search?q=' + q)
                },
                intersectLayers: function (layers, lng, lat) {
                    return $http.get(this.url() + '/intersect/' + layers.join() + "/" + lat + "/" + lng)
                },
                getLayer: function (layer) {
                    for (var i = 0; i < layers.length; i++) {
                        if (layers[i].id === layer || layers[i].layer.name === layer) {
                            return layers[i];
                        }
                    }
                },
                createFromWkt: function (wkt, name, description) {
                    return $http.post('portal/wkt',
                        {wkt: wkt, name: name, description: description, user_id: SpatialPortalConfig.userId})
                },
                getObject: function (id) {
                    return $http.get(this.url() + '/object/' + id)
                },
                getWkt: function (id) {
                    return $http.get(this.url() + '/shape/wkt/' + id)
                },
                url: function () {
                    return SpatialPortalConfig.layersServiceUrl
                },
                gazField: function () {
                    return SpatialPortalConfig.gazField
                },
                getAreaDownloadUrl: function (pid, type, filename) {
                    return SpatialPortalConfig.layersServiceUrl + "/shape/" + type + "/" + pid + "?filename=" + encodeURIComponent(filename)
                }
            };
        }])
}(angular));