/**
 * Created by koh032 on 19/09/2016.
 */
(function (angular) {
    'use strict';
    angular.module('url-params-service', ['layers-service', 'facet-auto-complete-service', 'biocache-service', 'map-service', "layout-service"])
        .factory("UrlParamsService", ['$rootScope', '$timeout', 'LayersService', 'BiocacheService', 'MapService', "LayoutService", "SessionsService", "$q",
            function ($rootScope, $timeout, LayersService, BiocacheService, MapService, LayoutService, SessionsService, $q) {
                var _this = {
                    processUrlParams: function (params) {

                        var biocacheServiceUrl = $SH.biocacheServiceUrl;
                        var biocacheUrl = $SH.biocacheUrl;
                        if (!params.ws || params.ws === undefined) {
                            params.ws = biocacheUrl
                        }

                        if (!params.bs || params.bs === undefined) {
                            params.bs = biocacheServiceUrl
                        }

                        var useSpeciesWMSCache = "on";
                        var tool;
                        var s = "";
                        var qname;
                        var qc;
                        var wkt;
                        var size;
                        var opacity;
                        var colour;
                        var pointtype;
                        var bb;
                        var lat;
                        var lon;
                        var radius;
                        var supportDynamic;
                        var colourBy;
                        var includeDistributions;
                        var toolParameters;
                        var geospatialKosher = null;
                        var sbList = [];
                        var savedsession;

                        for (var key in params) {
                            if (params.hasOwnProperty(key)) {

                                var value = params[key];

                                if ("wmscache" === key) {
                                    useSpeciesWMSCache = value;
                                }

                                if ("tool" === key) {
                                    tool = value;
                                }
                                if ("toolParameters" === key) {
                                    toolParameters = value;
                                }

                                if ("species_lsid" === key) {
                                    sbList.push("lsid:" + value);
                                } else if ("q" === key) {
                                    s = value;

                                    if (value.startsWith("(") && value.endsWith(")") && !value.include(" ")) {
                                        s = value.substring(1, value.length() - 2);
                                    }
                                } else if ("qname" === key) {
                                    qname = value;
                                } else if ("fq" === key) {
                                    sbList.push(value)
                                } else if ("qc" === key) {
                                    qc = "&qc=" + encodeURIComponent(value);
                                } else if ("wkt" === key) {
                                    wkt = value;
                                } else if ("psize" === key) {
                                    size = parseInt(value);
                                } else if ("popacity" === key) {
                                    opacity = parseFloat(value);
                                } else if ("pcolour" === key) {
                                    colour = parseInt(value, 16);
                                } else if ("ptype" === key) {
                                    pointtype = value;
                                } else if ("bbox" === key) {
                                    bb = value;
                                } else if ("lat" === key) {
                                    lat = parseFloat(value);
                                } else if ("lon" === key) {
                                    lon = parseFloat(value);
                                } else if ("radius" === key) {
                                    radius = parseFloat(value);
                                } else if ("ss" === key) {
                                    savedsession = value.trim();
                                } else if ("dynamic" === key) {
                                    supportDynamic = (value.toLowerCase() === 'true');
                                } else if ("cm" === key) {
                                    colourBy = value.trim();
                                } else if ("includeDistributions" === key) {
                                    includeDistributions = (value.toLowerCase() === 'true');
                                }
                            }
                        }

                        if (lat !== null && lon !== null && radius !== null &&
                            lat !== undefined && lon !== undefined && radius !== undefined) {
                            //m to km
                            wkt = this.createCircle(lon, lat, radius * 1000);
                        }

                        var sList = [];

                        if (s && s !== undefined) {
                            sList.push(s);
                        }

                        var promises = [];

                        if (sbList.length > 0 || (s !== null && s !== undefined && s.length > 0)) {
                            var query = {q: sList, fq: sbList, bs: params.bs, ws: params.ws};
                            promises.push(BiocacheService.queryTitle(query, params.fq).then(function (response) {
                                query.name = response;
                                query.wkt = wkt;
                                return BiocacheService.newLayer(query, undefined, response).then(function (newLayerResp) {
                                    MapService.add(newLayerResp);
                                });
                            }));
                        }

                        if (savedsession) {
                            promises.push(SessionsService.load(savedsession))
                        }

                        $.each(this.mapMultiQuerySpeciesLayers(params, geospatialKosher), function (it) {
                            promises.push(it);
                        });

                        $.each(this.mapLayerFromParams(params), function (it) {
                            promises.push(it);
                        });

                        $.each(this.mapObjectFromParams(params), function (it) {
                            promises.push(it);
                        });

                        if (tool !== null && tool !== undefined) {
                            $q.all(promises).then(function (data) {
                                _this.mapToolParams(tool, toolParameters)
                            });
                        }
                    },
                    mapToolParams: function (tool, toolParameters) {
                        var map = {};
                        if (tool) {
                            var parameters = {};
                            if (toolParameters)
                                parameters = JSON.parse(toolParameters);
                            if (tool === 'phylogeneticdiversity') {
                                //TODO: translate SpatialPortal phylogenetic diversity input parameters to SpatialHub format
                                var input = {};
                                // for (var k in parameters) {
                                // }
                                LayoutService.openModal('tool', {processName: tool, input: input}, false)
                            } else if (tool === 'exportBCCVL') {
                                LayoutService.openModal(tool, parameters, false)
                            } else {
                                LayoutService.openModal('tool', {processName: tool}, false)
                            }
                        }
                    },
                    mapObjectFromParams: function (params) {
                        var promises = [];
                        var pids = params["pid"] ? params["pid"].trim() : "";
                        if (pids !== "") {
                            var pidList = params["pid"].split(",");
                            for (var index in pidList) {
                                if (pidList.hasOwnProperty(index)) {
                                    promises.push(LayersService.getObject(pidList[index]).then(function (resp) {
                                        resp.data.layertype = 'area';
                                        MapService.add(resp.data, params.bs)
                                    }));
                                }
                            }
                        }
                        return promises;
                    },
                    mapMultiQuerySpeciesLayers: function (params, geospatialKosher) {
                        var promises = [];
                        var speciesLayerPattern = new RegExp("ly\\.[0-9]{1,}");
                        for (var key in params) {
                            if (params.hasOwnProperty(key)) {
                                var match = speciesLayerPattern.test(key);
                                if (match) {
                                    var str = key.substring(key.length - 2);
                                    if ((str !== ".q") && (str !== ".s")) {
                                        var layerName = params[key];
                                        var multiLayerQuery = params[key + ".q"];

                                        //format the query
                                        if (multiLayerQuery !== null && multiLayerQuery !== undefined && multiLayerQuery.includes(",")) {
                                            var queryComponents = multiLayerQuery.split(",");
                                            multiLayerQuery = queryComponents.join(" OR ");
                                        }

                                        var fqList = [];
                                        if (geospatialKosher !== null && geospatialKosher !== undefined) {
                                            fqList.push(geospatialKosher);
                                        }

                                        var multiQuery = {q: multiLayerQuery, fq: fqList, bs: params.bs, ws: params.ws};

                                        (function () {
                                            var style = params[key + ".s"];
                                            promises.push(BiocacheService.newLayer(multiQuery, undefined, layerName).then(function (newLayerResp) {
                                                newLayerResp.color = style;
                                                MapService.add(newLayerResp, params.bs)
                                            }));
                                        })()
                                    }
                                }

                            }
                        }
                        return promises;
                    },
                    mapLayerFromParams: function (params) {
                        var promises = [];
                        var layersCSV = params["layers"] ? params["layers"].trim().split(",") : [];
                        for (var i in layersCSV) {
                            var name = layersCSV[i];

                            promises.push(LayersService.getLayersUrlLoad(name).then(function (resp) {
                                MapService.add(resp, params.bs)
                            }));
                        }
                        return promises;
                    },
                    parseGeospatialKosher: function (facet) {
                        var geospatialKosher = null;
                        if (facet !== null && facet !== undefined) {
                            var f = facet.replace('"', "").replace("(", "").replace(")", "");
                            if ("geospatial_kosher:true" === f) {
                                geospatialKosher = [true, false, false];
                            } else if ("geospatial_kosher:false" === f) {
                                geospatialKosher = [false, true, false];
                            } else if ("-geospatial_kosher:*" === f) {
                                geospatialKosher = [false, false, true];
                            } else if ("geospatial_kosher:*" === f) {
                                geospatialKosher = [true, true, false];
                            } else if ("-geospatial_kosher:false" === f) {
                                geospatialKosher = [true, false, true];
                            } else if ("-geospatial_kosher:true" === f) {
                                geospatialKosher = [false, true, true];
                            }
                        }
                        return geospatialKosher;
                    },
                    createCircle: function (longitude, latitude, radius) {
                        var belowMinus180 = false;
                        var points = [];
                        for (var i = 0; i < 360; i++) {
                            points[i] = this.computeOffset(latitude, 0, radius, i);
                            if (points[i][0] + longitude < -180) {
                                belowMinus180 = true;
                            }
                        }

                        var dist = ((belowMinus180) ? 360 : 0) + longitude;

                        var s = "POLYGON" + "((";
                        for (i = 0; i < 360; i++) {
                            s = s + (points[i][0] + dist) + " " + points[i][1] + ","
                        }
                        // append the first point to close the circle
                        s = s + points[0][0] + dist + " " + points[0][1] + "))";

                        return s;
                    },
                    computeOffset: function (lat, lng, radius, angle) {
                        var b = radius / 6378137.0;
                        var c = angle * (Math.PI / 180.0);
                        var e = lat * (Math.PI / 180.0);
                        var d = Math.cos(b);
                        b = Math.sin(b);
                        var f = Math.sin(e);
                        e = Math.cos(e);
                        var g = d * f + b * e * Math.cos(c);
                        var x = (lng * (Math.PI / 180.0) + Math.atan2(b * e * Math.sin(c), d - f * g)) / (Math.PI / 180.0);
                        var y = Math.asin(g) / (Math.PI / 180.0);
                        return [x, y]
                    }
                };

                return _this;
            }])
}(angular));