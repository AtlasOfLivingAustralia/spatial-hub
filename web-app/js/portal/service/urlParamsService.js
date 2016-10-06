/**
 * Created by koh032 on 19/09/2016.
 */
(function (angular) {
    'use strict';
    angular.module('url-params-service', ['layers-service', 'facet-auto-complete-service', 'biocache-service', 'map-service', "layout-service"])
        .factory("UrlParamsService", ['$rootScope', '$timeout', 'LayersService', 'BiocacheService', 'MapService', "LayoutService",
            function ($rootScope, $timeout, LayersService, BiocacheService, MapService, LayoutService) {
                return {
                    processUrlParams: function (params) {

                        var biocacheServiceUrl = SpatialPortalConfig.biocacheServiceUrl;
                        var biocacheUrl = SpatialPortalConfig.biocacheUrl;
                        if (!params.ws || params.ws == undefined) {
                           // biocacheUrl = params.ws;
                            params.ws = biocacheUrl
                        }

                        if (!params.bs || params.bs == undefined) {
                            params.bs = biocacheServiceUrl
                           // biocacheServiceUrl = params.bs
                        }

                        var useSpeciesWMSCache = "on"
                        var tool
                        var toolParameter
                        var sb = "", s = "";
                        var qname
                        var gk
                        var qc
                        var wkt
                        var size
                        var opacity
                        var colour
                        var pointtype
                        var bb
                        var lat
                        var lon
                        var radius
                        var savedSession
                        var supportDynamic
                        var colourBy
                        var includeDistributions
                        var toolParameters;
                        var geospatialKosher = null;
                        var sbList = [];
                        var savedsession

                        for (var key in params) {

                            var value = params[key]

                            if ("wmscache" == key) {
                                useSpeciesWMSCache = value;
                            }

                            if ("tool" == key) {
                                tool = value;
                            }
                            if ("toolParameters" == key) {
                                toolParameters = value;
                            }

                            //(sb != "")? sb
                            if ("species_lsid" == key) {
                                sbList.push("lsid:" + value);
                            } else if ("q" == key) {
                                s = value

                                if (value.startsWith("(") && value.endsWith(")") && !value.include(" ")) {
                                    s = value.substring(1, value.length() - 2);
                                }
                            } else if ("qname" == key) {
                                qname = value;
                            } else if ("fq" == key) {

                                //flag geospatialKosher filters separately
                               // var gk;
                               // if ((gk = this.parseGeospatialKosher(value)) != null) {
                               //     geospatialKosher = gk;
                               // } else {
                                    //use as-is
                                    //spitonparams (biocachequery) splits these
                                    //sb.append("&").append(key).append("=").append(value);

                                if (value.includes ("geospatial_kosher")) {
                                    geospatialKosher = value
                                }

                                sbList.push(value)
                               // }
                            } else if ("qc" == key) {
                                if (StringUtils.isNotEmpty(qc)) {
                                    qc = "&qc=" + encodeURIComponent(value);
                                }
                                /* } else if ("bs".equals(key)) {
                                 bs = value;
                                 } else if ("ws".equals(key)) {
                                 ws = value;*/
                            } else if ("wkt" == key) {
                                wkt = value;
                            } else if ("psize" == key) {
                                size = parseInt(value);
                            } else if ("popacity" == key) {
                                opacity = parseFloat(value);
                            } else if ("pcolour" == key) {
                                colour = parseInt(value, 16);
                            } else if ("ptype" == key) {
                                pointtype = value;
                            } else if ("bbox" == key) {
                                bb = value;
                            } else if ("lat" == key) {
                                lat = parseFloat(value);
                            } else if ("lon" == key) {
                                lon = parseFloat(value);
                            } else if ("radius" == key) {
                                radius = parseFloat(value);
                            } else if ("ss" == key) {
                                savedsession = value.trim();
                            } else if ("dynamic" == key) {
                                supportDynamic = (value.toLowerCase() === 'true');
                            } else if ("cm"  == key) {
                                colourBy = value.trim();
                            } else if ("includeDistributions" == key) {
                                includeDistributions = (value.toLowerCase() === 'true');
                                /*try {
                                 includeDistributions = Boolean.parseBoolean(value.trim());
                                 } catch (Exception e) {
                                 }*/
                            }
                        }

                        if (lat != null && lon != null && radius != null) {
                            //m to km
                            wkt = this.createCircle(lon, lat, radius * 1000);
                        }

                        var sList = []
                        //if (params.q || params.q != undefined) {
                        if (s && s != undefined) {
                            sList.push(s);
                        }

                        if (sbList.length > 0 || (s != null && s.length > 0)) {
                            var query = {q: sList, fq: sbList, bs: params.bs, ws: params.ws}
                            BiocacheService.queryTitle(query, params.fq).then(function (response) {
                                query.name = response;
                                query.wkt = wkt;
                                BiocacheService.newLayer(query, undefined, response).then(function (newLayerResp) {
                                    MapService.add(newLayerResp);
                                });
                            });
                        }

                        this.mapMultiQuerySpeciesLayers (params, geospatialKosher)

                        this.mapLayerFromParams(params)

                        this.mapObjectFromParams(params)

                        if (tool != null) {
                            this.mapToolParams(tool, toolParameters)
                        }

                    },
                    mapToolParams: function (tool, toolParameters) {
                        var map = {}
                        if (toolParameters != null) {
                            var objList = JSON.parse(toolParameters)
                            var keyList = Object.keys(objList)
                            for (var idx in keyList) {
                                map[keyList[idx]] = objList[keyList[idx]]
                            }
                        }

                        LayoutService.openModal('phylo', map)

                    },
                    mapObjectFromParams: function (params) {
                        var pids = params["pid"]? params["pid"].trim(): ""
                        if (pids != "") {
                            var pidList = params["pid"].split(",")
                            for (var index in pidList) {
                                LayersService.getObject(pidList[index]).then (function(resp) {
                                   // var obj = resp;
                                    resp.data.layertype = 'area'
                                 //   resp.data.q = scope.q
                                    MapService.add(resp.data, params.bs)
                                })
                            }
                        }

                    },
                    mapMultiQuerySpeciesLayers: function (params, geospatialKosher) {
                        var speciesLayerPattern = new RegExp("ly\\.[0-9]{1,}");
                        for (var key in params) {
                            var match = speciesLayerPattern.test(key);
                            if (match) {
                                var str = key.substring(key.length - 2)
                                if ((str != ".q") && (str != ".s")) {
                                    var layerName = params[key]
                                    var multiLayerQuery = params[key + ".q"]
                                    var style = params[key + ".s"]

                                    //format the query
                                    if (multiLayerQuery != null && multiLayerQuery.includes(",")) {
                                        var queryComponents = multiLayerQuery.split(",");
                                        multiLayerQuery = queryComponents.join(" OR ");
                                    }

                                    var fqList = [];
                                    if (geospatialKosher != null) {
                                        fqList.push(geospatialKosher);
                                    }

                                    var multiQuery = {q: multiLayerQuery, fq: fqList, bs: params.bs, ws: params.ws}

                                    BiocacheService.newLayer(multiQuery, undefined, layerName).then(function (newLayerResp) {
                                        newLayerResp.color = style
                                        MapService.add(newLayerResp, params.bs)
                                    });
                                }

                            }
                        }
                    },
                    mapLayerFromParams: function(params) {
                        var layersCSV = params["layers"]? params["layers"].trim().split(",") : []
                        for (var i in layersCSV) {
                            var name = layersCSV[i]
                            //for (var i = 0; i < $scope.selectedLayers.layers.length; i++) {
                           // LayersService.getLayers().then (function(resp) {

                            LayersService.getLayersUrlLoad(name).then (function(resp) {
                                //    var layer = LayersService.getLayersUrlLoad(name)
                                //  if (layer != null && layer != undefined && layer.length > 0) {
                                MapService.add(resp, params.bs)
                                //  }
                            });

                               /* var layersJSONArray = resp.data;
                                for (i in layersJSONArray) {
                                    if (layersJSONArray[i].name && layersJSONArray[i].name.toLowerCase() == name.toLowerCase()) {
                                      //  var selectedLayer = {uid: layersJSONArray[i].uid, name: name}
                                        MapService.add(layersJSONArray[i], params.bs)
                                    }
                                }*/

                        }
                    },
                    parseGeospatialKosher: function (facet) {
                        var geospatialKosher = null;
                        if (facet != null) {
                            var f = facet.replace('"', "").replace("(", "").replace(")", "");
                            if ("geospatial_kosher:true" == f) {
                                geospatialKosher = [true, false, false];
                            } else if ("geospatial_kosher:false" == f) {
                                geospatialKosher = [false, true, false];
                            } else if ("-geospatial_kosher:*" == f) {
                                geospatialKosher = [false, false, true];
                            } else if ("geospatial_kosher:*" == f) {
                                geospatialKosher = [true, true, false];
                            } else if ("-geospatial_kosher:false" == f) {
                                geospatialKosher = [true, false, true];
                            } else if ("-geospatial_kosher:true" == f) {
                                geospatialKosher = [false, true, true];
                            }
                        }
                        return geospatialKosher;
                    },
                    createCircle: function(longitude, latitude, radius) {
                        var belowMinus180 = false;
                        var points = [];
                        for (var i = 0; i < 360; i++) {
                            points[i] = this.computeOffset(latitude, 0, radius, i);
                            if (points[i][0] + longitude < -180) {
                                belowMinus180 = true;
                            }
                        }

                        var dist = ((belowMinus180) ? 360 : 0) + longitude;

                        var s = "POLYGON" + "(("
                        for (var i = 0; i < 360; i++) {
                            s = s + (points[i][0] + dist) + " " + points[i][1] + ","
                            //s.append(points[i][0] + dist).append(" ").append(points[i][1]).append(",");
                        }
                        // append the first point to close the circle
                        s  = s + points[0][0] + dist + " " + points[0][1] + "))"
                       // s.append(points[0][0] + dist).append(" ").append(points[0][1]);
                       // s.append("))");

                        return s;

                    },
                    computeOffset: function(lat, lng, radius, angle) {
                        var b = radius / 6378137.0;
                        var c = angle * (Math.PI / 180.0);
                        var e = lat * (Math.PI / 180.0);
                        var d = Math.cos(b);
                        b = Math.sin(b);
                        var f = Math.sin(e);
                        e = Math.cos(e)
                        var g = d * f + b * e * Math.cos(c);
                        var x = (lng * (Math.PI / 180.0) + Math.atan2(b * e * Math.sin(c), d - f * g)) / (Math.PI / 180.0);
                        var y = Math.asin(g) / (Math.PI / 180.0);
                        return [x, y]
                    }
                }

            }])
}(angular));