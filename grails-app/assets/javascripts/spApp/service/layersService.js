(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name LayersService
     * @description
     *   Access to layer services of spatial-service
     */
    angular.module('layers-service', ['ngFileUpload'])
        .factory('LayersService', ['$http', '$timeout', '$q', 'Upload','gLayers', function ($http, $timeout, $q, Upload, gLayers) {
            var layers = gLayers;

            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'LayersService';
                httpconfig.method = method;

                return httpconfig;
            };

            var thiz = {
                /**
                 * Search a pageable list of field objects
                 * @memberof LayersService
                 * @param {String} field field
                 * @param {integer} offset start index
                 * @param {integer} pageSize page size
                 * @param {String} searchTerm search term
                 * @returns {Promise(List)} list of field objects
                 *
                 * @example
                 * Output:
                 * {
                        "enabled": true,
                        "objects": [{
                            "pid": "3742600",
                            "wmsurl": "https://spatial.ala.org.au/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=ALA:Objects&format=image/png&viewparams=s:3742600",
                            "area_km": 986564.4158071108,
                            "fid": "cl22",
                            "bbox": "POLYGON((128.999924 -38.062248,128.999924 -25.9959109999999,141.001709 -25.9959109999999,141.001709 -38.062248,128.999924 -38.062248))",
                            "centroid": "POINT(135.82719986113 -30.1046824043507)",
                            "fieldname": "Australian States and Territories",
                            "featureType": "MULTIPOLYGON",
                            "description": "South Australia, State",
                            "name": "South Australia",
                            "id": "South Australia"
                            }],
                        "spid": "22",
                        "indb": true,
                        "last_update": 1317906000000,
                        "namesearch": true,
                        "sdesc": "name_1,type_1",
                        "sid": "name_1",
                        "intersect": true,
                        "layerbranch": true,
                        "analysis": true,
                        "addtomap": true,
                        "number_of_objects": 11,
                        "sname": "name_1",
                        "defaultlayer": true,
                        "desc": "Australian States and Territories",
                        "name": "Australian States and Territories",
                        "id": "cl22",
                        "type": "c"
                        }
                 *
                 */
                getField: function (field, start, max, q) {
                    if (q === undefined) q = '';
                    var url = this.url() + "/field/" + field + "?start=" + start + "&pageSize=" + max + "&q=" + encodeURIComponent(q);
                    return $http.get(url, _httpDescription('getField'))
                },
                /**
                 * List all fields. See #searchLayers for output example
                 * @memberof LayersService
                 * @returns {Promise(List)} list of fields
                 */
                getLayers: function () {
                    var url = this.url() + "/fields/search?q=";
                    return $http.get(url, _httpDescription('getField'))
                },
                /**
                 * Search spatial-service layers
                 * @memberof LayersService
                 * @param {String} searchTerm search term
                 * @returns {Promise(List)} list of layers
                 *
                 * @example
                 * Input:
                 *  "capad"
                 *
                 * Output:
                 *  [{
                     "enabled": true,
                     "spid": "2080",
                     "indb": true,
                     "last_update": 1426683600000,
                     "namesearch": true,
                     "sid": "name",
                     "intersect": false,
                     "layerbranch": false,
                     "analysis": true,
                     "addtomap": true,
                     "layer": {
                         "displayname": "CAPAD 2012 Marine",
                         "enabled": true,
                         "pid": "",
                         "displaypath": "https://spatial.ala.org.au/geoserver/gwc/service/wms?service=WMS&version=1.1.0&request=GetMap&layers=ALA:capad_2012_marine&format=image/png&style=cl2080_style",
                         "uid": "2080",
                         "metadatapath": "http://www.environment.gov.au/fed/catalog/search/resource/details.page?uuid=%7B9F45DF80-CB86-440C-98DD-0B206B86D712%7D",
                         "classification1": "Area Management",
                         "classification2": "Biodiversity",
                         "notes": "",
                         "source_link": "http://www.environment.gov.au/fed/catalog/search/resource/downloadData.page?uuid=%7B9F45DF80-CB86-440C-98DD-0B206B86D712%7D",
                         "licence_link": "http://www.environment.gov.au/fed/catalog/search/resource/details.page?uuid=%7B9F45DF80-CB86-440C-98DD-0B206B86D712%7D",
                         "licence_notes": "",
                         "maxlatitude": -8.88189,
                         "minlatitude": -58.44947,
                         "minlongitude": 70.9,
                         "maxlongitude": 170.36667,
                         "shape": true,
                         "path_orig": "shape/capad_2012_marine",
                         "environmentalvalueunits": "",
                         "domain": "marine",
                         "dt_added": 1426683600000,
                         "environmentalvaluemin": "",
                         "lookuptablepath": "",
                         "citation_date": "2012-12-31",
                         "datalang": "eng",
                         "licence_level": "3",
                         "mddatest": "2014-12-05",
                         "mdhrlv": "",
                         "respparty_role": "custodian",
                         "keywords": "IUCN, reserve, park, conservation, wilderness",
                         "path_1km": "",
                         "environmentalvaluemax": "",
                         "description": "CAPAD (Collaborative Australian Protected Area Database) contains information on all protected areas in Australia, including their IUCN management categories.",
                         "source": "http://www.environment.gov.au/land/nrs/science/capad/2012",
                         "scale": "",
                         "name": "capad_2012_marine",
                         "id": 2080,
                         "type": "Contextual",
                         "path": "/data/ala/data/layers/ready/shape"
                         },
                     "sname": "name",
                     "defaultlayer": true,
                     "desc": "capad 2012 marine",
                     "name": "CAPAD 2012 Marine",
                     "id": "cl2080",
                     "type": "c"
                     }]
                 */
                searchLayers: function (q) {
                    var url = this.url() + '/fields/search?q=' + q;
                    return $http.get(url, _httpDescription('searchLayers'))
                },
                /**
                 * Intersect layers with a single point
                 * @memberof LayersService
                 * @param {List} layers list of layers
                 * @param {Number} longitude
                 * @param {Number} latitude
                 * @returns {Promise(List)} intersection results
                 *
                 * @example
                 * Input:
                 * - layers
                 *  ["cl22", "cl23"]
                 * - lng
                 *  131
                 * - lat
                 *  -22
                 *
                 * Output:
                 * [{
                     "field": "cl22",
                     "layername": "Australian States and Territories",
                     "value": ""
                     },
                 {
                 "field": "cl23",
                 "layername": "LGA Boundaries (deprecated)",
                 "value": ""
                 }]
                 */
                intersectLayers: function (layers, lng, lat) {
                    if (layers.length > 0 && layers[0] !== undefined) {
                        return $http.get(this.url() + '/intersect/' + layers.join() + "/" + lat + "/" + lng, _httpDescription('intersectLayers'))
                    } else {
                        return $q.when()
                    }
                },
                /**
                 * Get layer information
                 * @memberof LayersService
                 * @param {string} layer Layer name or field id.
                 * @returns {Map} Layer information. see #getLayers
                 */
                getLayer: function (layer) {
                    for (var i = 0; i < layers.length; i++) {
                        if (layers[i].id === layer || layers[i].layer.name.toLowerCase() === layer.toLowerCase()) {
                            return layers[i];
                        }
                    }
                },
                /**
                 * Get layer information without conflict
                 * @memberof LayersService
                 * @param {string} layer Layer name or field id.
                 * @returns {Map} Layer information. see #getLayers
                 */
                getLayersUrlLoad: function (layer) {
                    //TODO: refactor LayersService, search and 'layers' with promises
                    return this.getLayers().then(function (response) {
                        var layers = response.data;
                        for (var i = 0; i < layers.length; i++) {
                            if (layers[i].id === layer || layers[i].layer.name.toLowerCase() === layer.toLowerCase()) {
                                return layers[i];
                            }
                        }
                    });
                },
                /**
                 * Create layer using WKT
                 * @memberof LayersService
                 * @param {string} WKT
                 * @param {string} name display name
                 * @param {string} description a description
                 * @returns {Promise(Map)} created area information
                 *
                 * @example
                 * { TODO: example }
                 */
                createFromWkt: function (wkt, name, description) {
                    return $http.post($SH.baseUrl + '/portal/postAreaWkt',
                        {
                            wkt: wkt,
                            name: name,
                            description: description,
                            user_id: $SH.userId
                        })
                },
                /**
                 * Get object information
                 * @memberof LayersService
                 * @param {string} pid object id
                 * @returns {Promise(Map)} object information
                 *
                 * @example
                 * { TODO: example }
                 */
                getObject: function (id) {
                    return $http.get(this.url() + '/object/' + id, _httpDescription('getObject'))
                },
                /**
                 * Get objects for a layer (field)
                 * @memberof LayersService
                 * @param {string} object id
                 * @returns {Promise(List)} object information
                 *
                 * @example
                 * { TODO: example }
                 */
                getObjects: function (id) {
                    return $http.get(this.url() + '/objects/' + id, _httpDescription('getObjects'))
                },
                /**
                 * Get object WKT
                 * @memberof LayersService
                 * @param {string} pid object id
                 * @returns {Promise(String)} WKT
                 */
                getWkt: function (id) {
                    return $http.get(this.url() + '/shape/wkt/' + id, _httpDescription('getWkt'))
                },
                /**
                 * Get spatial-service URL
                 * @memberof LayersService
                 * @returns {String} spatial-service URL
                 */
                url: function () {
                    return $SH.layersServiceUrl
                },
                /**
                 * Get the spatial-service gazetteer field id
                 * @memberof LayersService
                 * @returns {String} field id
                 */
                gazField: function () {
                    return $SH.gazField
                },
                /**
                 * Get URL to download an object shapefile, kml or WKT
                 * @memberof LayersService
                 * @param {string} pid object id
                 * @param {string} type download type, one of 'shp', 'kml' or 'wkt'
                 * @param {string} filename the name of the file to download. Note that type == 'shp' produces a .zip
                 * @returns {String} URL
                 */
                getAreaDownloadUrl: function (pid, type, filename) {
                    return $SH.layersServiceUrl + "/shape/" + type + "/" + pid + "?filename=" + encodeURIComponent(filename)
                },
                /**
                 * Get URL to image for an incomplete shapefile upload selection
                 * @memberof LayersService
                 * @param {string} shapeId shape id
                 * @param {string} pid selected area id
                 * @returns {String} URL to selection image
                 */
                getShpImageUrl: function (shapeId, selectedArea) {
                    if (selectedArea.length > 0) {
                        return this.url() + '/shape/upload/shp/image/' + shapeId + "/" + selectedArea;
                    } else {
                        return this.url() + '/shape/upload/shp/image/' + shapeId + "/all";
                    }
                },
                /**
                 * Upload an area file. zip (shapefile) or kml
                 * TODO: support zipped kml
                 * @memberof LayersService
                 * @param {File} file
                 * @param {string} type one of 'shp' or 'kml'
                 * @param {string} name area name
                 * @param {string} description a description
                 * @returns {Promise(Map)} in progress uploaded area info
                 */
                uploadAreaFile: function (file, type, name, desc) {
                    var uploadType = "shp";
                    if (type === 'importKML') {
                        uploadType = "kml";
                    }
                    var uploadURL = $SH.baseUrl + "/portal/postAreaFile/" + uploadType + "?name=" + name + "&description=" + desc;

                    file.upload = Upload.upload({
                        url: uploadURL,
                        data: {shapeFile: file}
                    });

                    return file.upload;
                },
                /**
                 * Create an area from an in progress shapefile upload
                 * @memberof LayersService
                 * @param {string} name area name
                 * @param {string} description a description
                 * @param {string} shapeId shape id for the uploaded file
                 * @param {string} featureIdx comma delimited list of feature ids to merge for the created area
                 * @returns {Promise(Area)} created area
                 */
                createArea: function (name, description, shpId, featureIdx) {
                    var param = {
                        name: name,
                        description: description,
                        shpId: shpId,
                        featureIdx: featureIdx
                    };
                    return $http.post($SH.baseUrl + '/portal/postArea', param, _httpDescription('createArea'));
                },
                /**
                 * Search for areas associated with an LSID.
                 * @param {string} type 'distribution', 'checklist', or 'track'
                 * @param {string} LSID
                 * @returns {Promise}
                 */
                findOtherArea: function (type, lsid, area) {
                    return $http.get(this.url() + '/' + type + '/lsids/' + lsid + '?nowkt=true', _httpDescription('findOtherArea', {ignoreErrors: true}))
                },
                /**
                 * Create Layer for mapping using field data
                 * @param {string} fieldData field data
                 * @param {boolean} isSelected default selection value
                 * @returns {Promise(Layer)} layer for use in MapService#add
                 */
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
                        bbox: [[fieldData.layer.minlatitude, fieldData.layer.minlongitude], [fieldData.layer.maxlatitude, fieldData.layer.maxlongitude]],
                        shortName: fieldData.layer.name,
                        layerType: fieldData.layer.type,
                        analysis: fieldData.analysis
                    }
                },
                /**
                 * Create Layer for mapping using field id
                 * @param {string} fieldId field data
                 * @param {boolean} isSelected default selection value
                 * @returns {Promise(Layer)} layer for use in MapService#add
                 */
                convertFieldIdToMapLayer: function (fieldId, isSelected) {
                    var fieldData = this.getLayer(fieldId);

                    return this.convertFieldDataToMapLayer(fieldData, isSelected)
                },
                /**
                 * Query layers using WMS service getFeatureInfo.
                 *
                 * @param layers
                 * @param latlng
                 * @returns {HttpPromise}
                 */
                getFeatureInfo: function (layers, leafletMap, latlng) {
                    // TODO: support >1 WMS sources
                    var url = layers[0].leaflet.layerOptions.layers[0].url;

                    var layerNames = '';
                    for (var ly in layers) {
                        if (layerNames.length > 0) layerNames += ',';
                        layerNames += layers[ly].leaflet.layerOptions.layers[0].layerOptions.layers
                    }

                    var point = leafletMap.latLngToContainerPoint(latlng, leafletMap.getZoom());
                    var size = leafletMap.getSize();

                    var crs = leafletMap.options.crs;

                    var sw = crs.project(leafletMap.getBounds().getSouthWest());
                    var ne = crs.project(leafletMap.getBounds().getNorthEast());

                    var params = {
                        request: 'GetFeatureInfo',
                        srs: crs.code,
                        bbox: sw.x + ',' + sw.y + ',' + ne.x + ',' + ne.y,
                        height: size.y,
                        width: size.x,
                        layers: layerNames,
                        query_layers: layerNames,
                        feature_count: layers.length * 10,
                        info_format: 'text/plain',
                        x: point.x,
                        i: point.x,
                        y: point.y,
                        j: point.y
                    };

                    var split = url.split('?');
                    var urlBase = split[0] + "?";
                    var existingParams = '';
                    if (split.length > 1) {
                        existingParams = split[1].split('&');
                    }
                    for (var i in existingParams) {
                        if (existingParams[i].match(/^layers=.*/) == null) {
                            urlBase += '&' + existingParams[i];
                        }
                    }

                    url = urlBase.replace("/gwc/service", "") + L.Util.getParamString(params, urlBase, true);

                    return $http.get(url, _httpDescription('getFeatureInfo')).then(function (response) {
                        return thiz.parseGetFeatureInfo(response.data, layers)
                    })
                },
                /**
                 * Test if an area intersects with a coordinate
                 *
                 * @memberOf PopupService
                 * @param {list} pid area id
                 * @param {latlng} latlng coordinate to inspect as {lat:latitude, lng:longitude}
                 * @returns {HttpPromise}
                 *
                 * @example
                 * Input:
                 * - pid
                 *  67620
                 * - latlng
                 *  {lat:-22, lng:131}
                 * Output:
                 * {
                            "name_id": 0,
                            "pid": "67620",
                            "id": "Northern Territory",
                            "fieldname": "Australian States and Territories",
                            "featureType": "MULTIPOLYGON",
                            "area_km": 1395847.4575625565,
                            "description": "null",
                            "bbox": "POLYGON((128.999222 -26.002015,128.999222 -10.902499,137.996094 -10.902499,137.996094 -26.002015,128.999222 -26.002015))",
                            "fid": "cl22",
                            "wmsurl": "https://spatial.ala.org.au/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=ALA:Objects&format=image/png&viewparams=s:67620",
                            "name": "Northern Territory"
                        }
                 */
                getAreaIntersects: function (pid, latlng) {
                    var url = $SH.layersServiceUrl + "/object/intersect/" + pid + "/" + latlng.lat + "/" + latlng.lng;
                    return $http.get(url, _httpDescription('getAreaIntersects'))
                },

                parseGetFeatureInfo: function (plainText, layers) {
                    var result = [];
                    var blockString = "--------------------------------------------";
                    for (var ly in layers) {
                        var layerName = layers[ly].leaflet.layerOptions.layers[0].layerOptions.layers;
                        layerName = layerName.replace("ALA:", "");
                        var field = this.getLayer(layers[ly].id + '');
                        var sname;
                        if (field) {
                            sname = field.sname;
                        }
                        var units = undefined;

                        //start of layer intersect values in response from geoserver is "http.*{{layerName}}':"
                        var start = plainText.indexOf(layerName + "':");
                        var value = '';
                        if (start > 0) {
                            var blockStart = plainText.indexOf(blockString, start);
                            var blockEnd = plainText.indexOf(blockString, blockStart + blockString.length);

                            var properties = plainText.substring(blockStart + blockString.length, blockEnd - 1).trim().split("\n")

                            if (sname) {
                                for (var i in properties) {
                                    if (properties[i].toUpperCase().match('^' + sname.toUpperCase() + ' = .*') != null) {
                                        value = properties[i].substring(properties[i].indexOf('=') + 2, properties[i].length).trim();
                                    }
                                }
                            } else {
                                value = properties[0].substring(properties[0].indexOf('=') + 2, properties[0].length).trim();
                                if (isNaN(value)) {
                                    // use value as-is
                                } else if (field) {
                                    // filter out nodatavalues
                                    units = field.layer.environmentalvalueunits;
                                    if (Number(value) < Number(field.layer.environmentalvaluemin)) {
                                        value = '';
                                    }
                                } else {
                                    // analysis layers have nodatavalue < 0
                                    if (Number(value) < 0) {
                                        value = ''
                                    }
                                }
                            }
                        }
                        // no intersect with this layer
                        if (units) {
                            result.push({
                                layername: layers[ly].name,
                                value: value,
                                units: units
                            })
                        } else {
                            result.push({
                                layername: layers[ly].name,
                                value: value
                            })
                        }
                    }
                    return result;
                }
            }

            return thiz;
        }])
}(angular));
