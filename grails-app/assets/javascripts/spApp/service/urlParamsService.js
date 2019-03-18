/**
 * Created by koh032 on 19/09/2016.
 */
(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name UrlParamsService
     * @description
     *   Service that alters the map with URL parameters
     */
    angular.module('url-params-service', ['layers-service', 'facet-auto-complete-service', 'biocache-service', 'map-service', "layout-service"])
        .factory("UrlParamsService", ['$rootScope', '$timeout', 'LayersService', 'BiocacheService', 'MapService', "LayoutService", "SessionsService", "$q", "ToolsService",
            function ($rootScope, $timeout, LayersService, BiocacheService, MapService, LayoutService, SessionsService, $q, ToolsService) {
                var _this = {
                    /**
                     * Alter the map with URL parameters
                     *
                     * Valid parameters:
                     * * Settings for all layers added with this method
                     *  - ```ws```: biocache-hub URL for any layers added with this method. e.g. ```ws=https://biocache.ala.org.au```
                     *  - ```bs```: biocache-service URL for any layers added with this method. e.g. ```bs=https://biocache.ala.org.au/ws```
                     * * Global to the whole session
                     *  - ```wmscache```: ON/OFF for the current session (TODO: implement this)
                     * * Map control
                     *  - ```bbox```: zoom to this area with Min Lng, Min Lat, Max Lng, Max Lat. e.g. ```bbox=112,-42,154,-9```
                     * * Open a tool
                     *  - ```tool```: name of tool to open. This can be any client side or spatial-service tool (TODO: support more than phylogeneticdiversity and exportBCCVL). e.g. ```tool=exportBCCVL```
                     *  - ```toolParameters```: JSON Map of inputName:value for 'tool'. e.g. ```toolParameters={}```
                     * * Add one species layer
                     *  - ```qname```: display name for the 'q' layer. e.g. ```qname=My URL layer```
                     *  - ```q```: biocache-service q term for occurrences layer to add. e.g. ```q=state:Queensland```
                     *  - ```species_lsid```: LSID for occurrences layer to add. e.g. ```species_lsid=urn:lsid:biodiversity.org.au:afd.taxon:e6aff6af-ff36-4ad5-95f2-2dfdcca8caff```
                     *  - ```fq```: biocache-service fq term for occurrences layer to add. e.g. ```fq=geospatial_kosher:true```
                     *  - ```qc```: biocache-service fq term for occurrences layer to add. e.g. ```qc=data_hub_uid:dh1```
                     *  - ```wkt```: WKT value for the occurrences layer to add. e.g. ```wkt=POLYGON((...))```
                     *  - ```psize```: integer value specifying the default occurrence layer point size (pixel radius) for
                     *  layer to add. e.g. ```psize=10```
                     *  - ```popacity```: decimal value (0-1) for opacity of the layer to add. ```e.g. popacity=0.5```
                     *  - ```pcolour```: RBG colour of the layer being added. e.g. red ```pcolor=FF0000```
                     *  - ```ptype```: point type of the layer being added. e.g. 'grid' to display as grid values. e.g. ```ptype=grid```
                     *  - ```cm```: occurrence layer colour mode, e.g. a valid biocache-service facet from ```http://biocache.ala.org.au/fields?filter=indexed:true&max=10&sort=name&order=ASC````
                     *  - ```lat```: biocache-service lat/lon/radius terms for occurrences layer to add. e.g. ```lat=-22```
                     *  - ```lon```: biocache-service lat/lon/radius terms for occurrences layer to add. e.g. ```lng=131```
                     *  - ```radius```: biocache-service lat/lon/radius terms for occurrences layer to add. e.g. ```radius=10```
                     *  -  ```includeDistributions```: Add expert distributions that match the species
                     * * Load a previously saved session. Adds layers and changes map state
                     *  - ```ss```: saved session to load. e.g. ```ss=0029233```
                     *  - ```dynamic``: e.g. 'true' to support dynamic (TODO: ?)
                     * * Add one or more areas to the map
                     *  - pid: comma delimited list of area PIDs to add to the map
                     * * Add multiple species layers
                     *  - ```lyN```: (N=1..) name of layer. e.g. ```ly1=My layer```
                     *  - ```lyN.q```: (N=1..) species query for this layer. e.g. ```ly1.q=state:Queensland```
                     *  - ```lyN.s```: (N=1..) layer color. e.g. ```ly1.s=FF0000```
                     * * Add one or more environmental or contextual layers
                     *  - ```layers```: comma delimited list of layers to add. e.g. ```layers=cl1,el2```
                     *
                     * @memberof UrlParamsService
                     * @param {Map} URL parameters
                     */
                    processUrlParams: function (params) {

                        var biocacheServiceUrl = $SH.biocacheServiceUrl;
                        var biocacheUrl = $SH.biocacheUrl;
                        var ws = params.ws;
                        var bs = params.bs;

                        if (!ws || ws === undefined) {
                            ws = biocacheUrl
                        }

                        if (!bs || bs === undefined) {
                            bs = biocacheServiceUrl
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

                                    if (value.match(/^\(/g) != null && value.match(/\)$/g) != null && !value.include(" ")) {
                                        s = value.substring(1, value.length() - 2);
                                    }

                                    if (s && s !== undefined) {
                                        sbList.push(s);
                                    }
                                } else if ("qname" === key) {
                                    qname = value;
                                } else if ("fq" === key) {
                                    if ($.isArray(value)) {
                                        for (var a in value) {
                                            if (value.hasOwnProperty(a)) {
                                                sbList.push(value[a])
                                            }
                                        }
                                    } else {
                                        sbList.push(value)
                                    }
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

                        var promises = [];

                        if (sbList.length > 0 || (s !== null && s !== undefined && s.length > 0)) {
                            var query = {q: sbList, bs: bs, ws: ws};
                            promises.push(BiocacheService.queryTitle(query).then(function (response) {
                                query.name = response;
                                return BiocacheService.newLayer(query, undefined, response).then(function (newLayerResp) {
                                    MapService.add(newLayerResp);
                                });
                            }));
                        }

                        if (savedsession) {
                            promises.push(SessionsService.load(savedsession))
                        }

                        $.each(this.mapMultiQuerySpeciesLayers(params, bs, ws, geospatialKosher), function (it) {
                            promises.push(it);
                        });

                        $.each(this.mapLayerFromParams(params), function (it) {
                            promises.push(it);
                        });

                        $.each(this.mapObjectFromParams(params, bs), function (it) {
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
                            }

                            if (LayoutService.isPanel(tool)) {
                                // is panel
                                LayoutService.openPanel(tool, parameters, false)
                            } else if (ToolsService.isTool(tool)) {
                                // is a tool, local or remote
                                LayoutService.openModal("tool", {"processName": tool})
                            } else {
                                // is controller
                                LayoutService.openModal(tool, parameters);
                            }
                        }
                    },
                    mapObjectFromParams: function (params, bs) {
                        var promises = [];
                        var pids = params["pid"] ? params["pid"].trim() : "";
                        if (pids !== "") {
                            var pidList = params["pid"].split(",");
                            for (var index in pidList) {
                                if (pidList.hasOwnProperty(index)) {
                                    promises.push(LayersService.getObject(pidList[index]).then(function (resp) {
                                        resp.data.layertype = 'area';
                                        MapService.add(resp.data, bs)
                                    }));
                                }
                            }
                        }
                        return promises;
                    },
                    mapMultiQuerySpeciesLayers: function (params, bs, ws, geospatialKosher) {
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

                                        var multiQuery = {q: multiLayerQuery, fq: fqList, bs: bs, ws: ws};

                                        (function () {
                                            var style = params[key + ".s"];
                                            promises.push(BiocacheService.newLayer(multiQuery, undefined, layerName).then(function (newLayerResp) {
                                                newLayerResp.color = style;
                                                MapService.add(newLayerResp)
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
                                MapService.add(resp)
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