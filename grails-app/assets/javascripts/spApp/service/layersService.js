(function (angular) {
    'use strict';
    angular.module('layers-service', ['ngFileUpload'])
        .factory('LayersService', ['$http', '$timeout', 'Upload', function ($http, $timeout, Upload) {
            var layers = [];

            var url = $SH.layersServiceUrl + "/fields/search?q=";
            $http.get($SH.proxyUrl + "?url=" + encodeURIComponent(url)).then(function (data) {
                layers = data.data;
            });

            return {
                getField: function (field, start, max, q) {
                    var url = this.url() + "/field/" + field + "?start=" + start + "&pageSize=" + max + "&q=" + q;
                    return $http.get($SH.proxyUrl + "?url=" + encodeURIComponent(url))
                },
                getLayers: function () {
                    var url = this.url() + "/fields/search?q=";
                    return $http.get($SH.proxyUrl + "?url=" + encodeURIComponent(url))
                },
                searchLayers: function (q) {
                    var url = this.url() + '/fields/search?q=' + q;
                    return $http.get($SH.proxyUrl + "?url=" + encodeURIComponent(url))
                },
                intersectLayers: function (layers, lng, lat) {
                    return $http.get(this.url() + '/intersect/' + layers.join() + "/" + lat + "/" + lng)
                },
                getLayer: function (layer) {
                    for (var i = 0; i < layers.length; i++) {
                        if (layers[i].id === layer || layers[i].layer.name.toLowerCase() === layer.toLowerCase()) {
                            return layers[i];
                        }
                    }
                },
                getLayersUrlLoad: function (layer) {
                    var layerService = this;
                    return $timeout(function () {
                        return layerService.getLayer(layer)
                    }, 1000);
                },
                createFromWkt: function (wkt, name, description) {
                    return $http.post('portal/postAreaWkt',
                        {wkt: wkt, name: name, description: description, user_id: $SH.userId})
                },
                getObject: function (id) {
                    return $http.get(this.url() + '/object/' + id)
                },
                getObjects: function (id) {
                    return $http.get(this.url() + '/objects/' + id)
                },
                getWkt: function (id) {
                    return $http.get(this.url() + '/shape/wkt/' + id)
                },
                url: function () {
                    return $SH.layersServiceUrl
                },
                gazField: function () {
                    return $SH.gazField
                },
                getAreaDownloadUrl: function (pid, type, filename) {
                    return $SH.layersServiceUrl + "/shape/" + type + "/" + pid + "?filename=" + encodeURIComponent(filename)
                },
                getShpImageUrl: function (shapeId, selectedArea) {
                    if (selectedArea.length > 0) {
                        return this.url() + '/shape/upload/shp/image/' + shapeId + "/" + selectedArea;
                    } else {
                        return this.url() + '/shape/upload/shp/image/' + shapeId + "/all";
                    }
                },
                uploadAreaFile: function (file, type, name, desc) {
                    var uploadType = "shp";
                    if (type === 'importKML') {
                        uploadType = "kml";
                    }
                    var uploadURL = "portal/postAreaFile/" + uploadType + "?name=" + name + "&description=" + desc;

                    file.upload = Upload.upload({
                        url: uploadURL,
                        data: {shapeFile: file}
                    });

                    return file.upload;
                },
                createArea: function (name, description, shpId, featureIdx) {
                    var param = {
                        name: name,
                        description: description,
                        shpId: shpId,
                        featureIdx: featureIdx
                    };
                    return $http.post('portal/postArea', param);
                },
                /**
                 *
                 * @param type. 'distribution', 'checklist', or 'track'
                 * @param lsid
                 * @returns {HttpPromise}
                 */
                findOtherArea: function(type, lsid, area) {
                    return $http.get(this.url() + '/' + type + '/lsid/' + lsid + '?nowkt=true')
                },
                convertFieldDataToMapLayer: function (fieldData, isSelected) {
                    return {
                        id: fieldData.id,
                        classification1: fieldData.layer.classification1,
                        classification2: fieldData.layer.classification2,
                        classification: fieldData.layer.classification1 + ' / ' + fieldData.layer.classification2,
                        name: fieldData.name,
                        type: fieldData.type,
                        dist: 2,
                        selected: isSelected,
                        layerId: fieldData.layer.id,
                        bbox: [[fieldData.layer.minlatitude, fieldData.layer.minlongitude], [fieldData.layer.maxlatitude, fieldData.layer.maxlongitude]]
                    }
                },
                convertFieldIdToMapLayer: function (fieldId, isSelected) {
                    var fieldData = this.getLayer(fieldId);

                    return {
                        id: fieldData.id,
                        classification1: fieldData.layer.classification1,
                        classification2: fieldData.layer.classification2,
                        classification: fieldData.layer.classification1 + ' / ' + fieldData.layer.classification2,
                        name: fieldData.name,
                        type: fieldData.type,
                        dist: 2,
                        selected: isSelected,
                        layerId: fieldData.layer.id,
                        bbox: [[fieldData.layer.minlatitude, fieldData.layer.minlongitude], [fieldData.layer.maxlatitude, fieldData.layer.maxlongitude]]
                    }
                }
            }
        }])
}(angular));