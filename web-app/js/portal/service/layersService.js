(function (angular) {
    'use strict';
    angular.module('layers-service', ['ngFileUpload'])
        .factory('LayersService', ['$http', 'Upload', function ($http, Upload) {
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
                },
                uploadAreaFile: function(file, type) {
                    var uploadURL = "";
                    if (type == 'importShapefile') {
                        uploadURL = "portal/shp";
                    } else if (type == 'importKML') {
                        uploadURL = "portal/shp";
                    }

                    file.upload = Upload.upload({
                        url: uploadURL,
                        data: {shapeFile: file}
                    });
                    return file.upload.then(function (response) {
                        return response;
                     }, function (response) {
                        return response;
                    }, function (evt) {
                        return evt;
                    });
                },
                createObject: function(name, description, shpId, featureIdx) {
                    var param = {
                        name: name,
                        description: description,
                        shpId: shpId,
                        featureIdx: featureIdx
                    };
                    return $http.post('portal/createObj', param);
                }
            }
        }])
}(angular));