(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name AddWMSCtrl
     * @description
     *   Add an WMS to the map
     */
    angular.module('add-w-m-s-ctrl', ['map-service', 'layers-service', 'predefined-areas-service'])
        .controller('AddWMSCtrl', ['LayoutService', '$scope', '$http', 'MapService',
            function (LayoutService, $scope, $http, MapService) {

                $scope.loading = false;
                $scope.warning = '';

                $scope.selectedLayerLabel = '';
                $scope.isAutomatic = true;
                $scope.version = "";
                $scope.availableLayers = [];
                $scope.selectedServer = "";
                $scope.moreInfo = false;

                $scope.presetServers = $SH.presetWMSServers;

                $scope.getMapExamples = $SH.getMapExamples;

                $scope.getCapabilities = function () {
                    var url = $scope.selectedServer + ($scope.version ? "&version=" + $scope.version : "");
                    $scope.warning = '';
                    $scope.loading = true;

                    $http.get($SH.baseUrl + "/portal/proxy?url=" + url)
                        .success(function (resp) {
                            $scope.availableLayers = [];
                            var x2js = new X2JS({attributePrefix: []});
                            var xml = x2js.xml_str2json(resp);
                            var version = xml.WMS_Capabilities._version;
                            var layers = xml.WMS_Capabilities.Capability.Layer.Layer;

                            for (var i in layers) {
                                if (layers[i].Style !== undefined && layers[i].Style.LegendURL !== undefined) {
                                    var styles = layers[i].Style;
                                    var legendurl = '';
                                    if (Array.isArray(styles)) {
                                        legendurl = styles[0].LegendURL.OnlineResource['xlink:href'];
                                    } else {
                                        legendurl = styles.LegendURL.OnlineResource['xlink:href'];
                                    }

                                    $scope.availableLayers.push({
                                        displayname: layers[i].Name,
                                        name: layers[i].Name,
                                        title: layers[i].Title,
                                        version: version,
                                        legendurl: legendurl
                                    })
                                }
                            }

                        })
                        .error(function (resp) {
                            if (resp.error) {
                                $scope.warning = resp.error;
                                $scope.warning += '[' + url + ' may not in proxy list!]'
                            } else
                                $scope.warning = resp;

                        })
                        .finally(function () {
                            $scope.loading = false;
                        });

                };


                $scope.addLayer = function () {
                    var serverUrl = $scope.selectedServer.substr(0, $scope.selectedServer.lastIndexOf('/') + 1) + 'wms';
                    var layer = Object.assign({url: serverUrl, layertype: "wms"}, $scope.selectedLayer);

                    MapService.add(layer).then(function (data) {
                        //layer added successfully
                    }).catch(function (err) {
                        $scope.warning = err;
                    })
                };

                $scope.addLayerFromGetMapRequest = function () {
                    //parsing
                    if (!validateURL($scope.selectedGetMapExample)) {
                        $scope.warning = $i18n(406, "Invalid URL") + ": " + url;
                        return;
                    }

                    var result = {};
                    var sepIndex = $scope.selectedGetMapExample.indexOf('?');

                    result['URL'] = $scope.selectedGetMapExample.substr(0, sepIndex);

                    var queryString = $scope.selectedGetMapExample.substr(sepIndex + 1, $scope.selectedGetMapExample.length - sepIndex);
                    queryString.split("&").forEach(function (part) {
                        if (!part) return;
                        part = part.split("+").join(" "); // replace every + with space, regexp-free version
                        var eq = part.indexOf("=");
                        var key = eq > -1 ? part.substr(0, eq) : part;
                        var val = eq > -1 ? decodeURIComponent(part.substr(eq + 1)) : "";
                        var from = key.indexOf("[");
                        if (from === -1) result[decodeURIComponent(key)] = val;
                        else {
                            var to = key.indexOf("]", from);
                            var index = decodeURIComponent(key.substring(from + 1, to));
                            key = decodeURIComponent(key.substring(0, from));
                            if (!result[key]) result[key] = [];
                            if (!index) result[key].push(val);
                            else result[key][index] = val;
                        }
                    });

                    if (!result.LAYERS || /^\s*$/.test(result.LAYERS)) {
                        $scope.warning = $i18n(407, "No layer selected");
                        return;
                    }
                    if (result.REQUEST.toUpperCase() !== "GETMAP") {
                        $scope.warning = $i18n(408, "URL must be a valid 'GetMap' request");
                        return;
                    }

                    var layer = {
                        url: result.URL,
                        type: 'wms',
                        layertype: 'wms',
                        version: result.VERSION,
                        name: result.LAYERS,
                        // legend url here is not valid for all
                        legendurl: $scope.selectedGetMapExample.replace("GetMap", "GetLegendGraphic").replace("LAYERS=", "LAYER=")
                    };

                    MapService.add(layer).then(function (data) {
                        $scope.$close();
                    }).catch(function (err) {
                        $scope.warning = err;
                    })
                };

                var validateURL = function (str) {
                    var pattern = new RegExp('((([A-Za-z]{3,9}:(?:\\/\\/)?)(?:[-;:&=\\+\\$,\\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\\+\\$,\\w]+@)[A-Za-z0-9.-]+)((?:\\/[\\+~%\\/.\\w-_]*)?\\??(?:[-\\+=&;%@.\\w_]*)#?(?:[\\w]*))?)'); // fragment locater
                    return pattern.test(str)
                };

                $scope.addToMapEnabled = function () {
                    return !(($scope.selectedLayer !== undefined && $scope.selectedServer !== '' && $scope.isAutomatic) ||
                        ($scope.selectedGetMapExample !== undefined && !$scope.isAutomatic))
                };

                $scope.addToMap = function () {
                    if ($scope.isAutomatic) {
                        $scope.addLayer()
                    } else {
                        $scope.addLayerFromGetMapRequest()
                    }
                }
            }])
}(angular));