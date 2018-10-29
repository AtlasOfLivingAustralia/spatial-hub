(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name ToolsService
     * @description
     *   List of spatial-hub tools. Includes client side tools with names matching Tool*Service. Includes
     * tools from spatial-service/capabilities.
     */
    angular.module('tools-service', [])
        .factory('ToolsService', ['$injector', '$q', '$http', '$timeout', 'MapService', 'LayersService', 'LoggerService', 'LayoutService',
            function ($injector, $q, $http, $timeout, MapService, LayersService, LoggerService, LayoutService) {
                var cap = $SH.layersServiceCapabilities;
                var viewConfig = $SH.viewConfig;
                var localToolServices = {};
                var promises = [];

                initLocalTools();

                /*
                uiScope is ToolCtrl
                 */
                function executeRemote(uiScope, inputs) {
                    var m = {};
                    m['input'] = inputs;
                    m['name'] = uiScope.toolName;

                    var url = $SH.baseUrl + '/portal/postTask?sessionId=' + $SH.sessionId;
                    $http.post(url, m).then(function (response) {
                        uiScope.externalTaskId = response.data.id;
                        uiScope.statusUrl = LayersService.url() + '/tasks/status/' + response.data.id;
                        $timeout(function () {
                            _checkStatus(uiScope);
                        }, 5000)
                    });

                    return $q.when(false)
                }

                /*
                uiScope is ToolCtrl
                 */
                function _checkStatus(uiScope) {
                    if (uiScope.cancelled) {
                        return;
                    }
                    return $http.get(uiScope.statusUrl + "?last=" + uiScope.last).then(function (response) {
                        uiScope.status = response.data.message;

                        var keys = [];
                        var k;
                        for (k in response.data.history) {
                            if (response.data.history.hasOwnProperty(k)) {
                                keys.push(k)
                            }
                        }
                        keys.sort();
                        for (k in keys) {
                            uiScope.log[keys[k]] = response.data.history[keys[k]];
                            uiScope.logText = response.data.history[keys[k]] + '\r\n' + uiScope.logText;
                            uiScope.last = keys[k]
                        }

                        if (response.data.status < 2) {
                            uiScope.checkStatusTimeout = $timeout(function () {
                                _checkStatus(uiScope);
                            }, 5000)
                        } else if (response.data.status === 2) {
                            uiScope.status = 'cancelled';
                            uiScope.finished = true
                        } else if (response.data.status === 3) {
                            uiScope.status = 'error';
                            uiScope.finished = true
                        } else if (response.data.status === 4) {
                            uiScope.status = 'successful';
                            uiScope.finishedData = response.data;
                            return _executeResult(uiScope)
                        }
                    })
                }

                function _executeResult(uiScope) {
                    var layers = [];
                    var nextprocess;

                    for (k in uiScope.finishedData.output) {
                        if (uiScope.finishedData.output.hasOwnProperty(k)) {
                            var d = uiScope.finishedData.output[k];
                            if (d.file && d.file.match(/\.zip$/g)) {
                                var filename = uiScope.toolName + " (" + uiScope.externalTaskId + ").zip";
                                uiScope.downloadUrl = LayersService.url() + '/tasks/output/' + uiScope.finishedData.id + '/' + encodeURI(filename) + '?filename=' + d.file;

                                if (uiScope.downloadImmediately && uiScope.spec.download !== false) {
                                    Util.download(uiScope.downloadUrl);
                                }
                            } else if (d.downloadUrl) {
                                uiScope.downloadUrl = d.downloadUrl;

                                if (uiScope.downloadImmediately && uiScope.spec.download !== false) {
                                    Util.download(uiScope.downloadUrl);
                                }
                            }
                        }
                    }

                    for (k in uiScope.finishedData.output) {
                        if (uiScope.finishedData.output.hasOwnProperty(k)) {
                            var csvFile = '';
                            var d = uiScope.finishedData.output[k];
                            if (d.openUrl) {
                                uiScope.metadataUrl = d.openUrl
                            } else if (d.file && d.file.match(/\.zip$/g)) {
                                //processed earlier
                            } else if (d.file && d.file.match(/\.html$/g)) {
                                uiScope.metadataUrl = LayersService.url() + '/tasks/output/' + uiScope.finishedData.id + '/' + d.file
                            } else if (d.file && d.file.match(/\.csv/g)) {
                                //can only display one csv file
                                var url = LayersService.url() + '/tasks/output/' + uiScope.finishedData.id + '/' + d.file;
                                csvFile = d.file;
                                $http.get(url).then(function (data) {
                                    LayoutService.openModal('csv', {
                                        title: uiScope.toolName + " (" + csvFile + ")",
                                        csv: data.data,
                                        info: '',
                                        filename: csvFile,
                                        display: {size: 'full'}
                                    }, false)
                                });
                            } else if (d.file && d.file.match(/\.tif$/g)) {
                                var name = d.file.replace('/layer/', '').replace('.tif', '');
                                layers.push({
                                    id: name,
                                    displaypath: $SH.geoserverUrl + '/wms?layers=ALA:' + name,
                                    type: 'e',
                                    name: name,
                                    displayname: name,
                                    layer: {
                                        id: name,
                                        displaypath: $SH.geoserverUrl + '/wms?layers=ALA:' + name,
                                        type: 'e',
                                        name: name,
                                        displayname: name
                                    }
                                });
                            } else if (d.name === 'area') {
                                if (d.file.indexOf("{") === 0) {
                                    // parse JSON response
                                    // ENVELOPE is the only output of this type
                                    var json = JSON.parse(d.file);
                                    layers.push({
                                        id: json.id,
                                        displaypath: json.wmsurl,
                                        type: 'envelope',
                                        layertype: 'area',
                                        q: json.q,
                                        name: json.name,
                                        area_km: json.area_km,
                                        bbox: json.bbox,
                                        wkt: json.bbox,
                                        pid: 'ENVELOPE' + json.id
                                    });
                                } else {
                                    //might be an area pid
                                    promises.push(LayersService.getObject(d.file).then(function (data) {
                                        data.data.layertype = 'area';
                                        return MapService.add(data.data)
                                    }))
                                }
                            } else if (d.name === 'species') {
                                var q = jQuery.parseJSON(d.file);

                                if (!q.qid) q.qid = q.q;
                                q.opacity = 60;

                                q.scatterplotDataUrl = uiScope.downloadUrl;

                                promises.push(MapService.add(q))
                            } else if (d.name === 'nextprocess') {
                                var nextinput = jQuery.parseJSON(d.file);

                                // format 'nextprocess' output for LayoutService.openModal
                                nextprocess = {
                                    processName: nextinput.process,
                                    overrideValues: {}
                                };
                                nextprocess.overrideValues[nextinput.process] = {input: nextinput.input};
                            }
                        }
                    }

                    if (layers.length > 0) {
                        $.each(layers, function () {
                            var layer = this;
                            if (uiScope.metadataUrl !== null) layer.metadataUrl = uiScope.metadataUrl;
                            layer.name = uiScope.toolName + " (" + layer.name + ")";
                            promises.push(MapService.add(layer));
                        })
                    }

                    if (uiScope.metadataUrl !== null) {
                        LoggerService.log('Tools', uiScope.toolName,
                            '{ "taskId": "' + uiScope.finishedData.id + '", "metadataUrl": "' + uiScope.metadataUrl + '"}')
                    } else {
                        LoggerService.log('Tools', uiScope.toolName, '{ "taskId": "' + uiScope.finishedData.id + '"}')
                    }

                    if (uiScope.metadataUrl !== null) uiScope.openUrl(uiScope.metadataUrl);

                    return $q.all(promises).then(function () {
                        uiScope.finished = true;
                        uiScope.$close();

                        if (nextprocess) {
                            $timeout(function () {
                                LayoutService.openModal('tool', nextprocess, false);
                            }, 0)
                        }
                    })
                }

                function registerService(toolName, service) {
                    localToolServices[toolName] = service;
                    cap[toolName] = service.spec
                }

                function executeLocal(uiScope, toolName, inputs) {
                    var result = localToolServices[toolName].execute(inputs)

                    if (result && result.then) {
                        result.then(function (response) {
                            uiScope.finishedData = response;
                            _executeResult(uiScope);
                            uiScope.$close();
                        })
                    } else {
                        uiScope.$close();
                    }
                }

                function refreshLocal(uiScope, toolName, inputs) {
                    if (typeof localToolServices[toolName].refresh === "function")
                        localToolServices[toolName].refresh(inputs, uiScope.spec)
                }

                function initLocalTools() {
                    //inject all Tools into ToolsService
                    $.each(spApp.requires, function (x) {
                        var v = spApp.requires[x];
                        if (v.match(/-service$/g) && v.match(/^tool-/g)) {
                            var name = v.replace(/-.|^./g, function (match) {
                                return match.toUpperCase().replace('-', '')
                            });
                            var tool = $injector.get(name);

                            //is this a valid tool service?
                            if (tool && tool.spec && tool.execute) {
                                registerService(name, tool);
                            }
                        }
                    });
                }

                return {
                    /**
                     * Initialize client side tool
                     * @memberof ToolsService
                     * @param {string} name of client side tool
                     * @return {Promise}
                     */
                    init: function (toolName) {
                        if (localToolServices[toolName] && localToolServices[toolName].init) {
                            localToolServices[toolName].init();
                        }
                        return $q.when($SH.layersServiceCapabilities);
                    },
                    /**
                     * Test if a tool name is a client side tool
                     * @memberof ToolsService
                     * @param {string} name of tool
                     * @return {boolean} true when it is a client side tool
                     */
                    isLocalTask: function (toolName) {
                        return localToolServices[toolName] !== undefined;
                    },
                    /**
                     * Test if a tool name is a client side or remote tool
                     * @memberof ToolsService
                     * @param {string} name of tool
                     * @return {boolean} true when it is a client side or remote tool
                     */
                    isTool: function (toolName) {
                        return localToolServices[toolName] !== undefined || cap[toolName] !== undefined;
                    },
                    /**
                     * Run a tool
                     * @memberof ToolsService
                     * @param {Scope} interface scope
                     * @param {string} tool name
                     * @param {Map} input parameters
                     * @return {Promise(Boolean)} true the tool is successful
                     */
                    execute: function (uiScope, toolName, inputs) {
                        if (localToolServices[toolName]) {
                            return executeLocal(uiScope, toolName, inputs)
                        } else {
                            return executeRemote(uiScope, inputs)
                        }
                    },

                    /**
                     * Run a tool
                     * @memberof ToolsService
                     * @param {Scope} interface scope
                     * @param {string} tool name
                     * @param {Map} input parameters
                     * @return {Promise(Boolean)} true the tool is successful
                     */
                    refresh: function (uiScope, toolName, inputs) {
                        if (localToolServices[toolName]) {
                            refreshLocal(uiScope, toolName, inputs)
                        }
                    },

                    /**
                     * Get tool capabilities (info including inputs/outputs)
                     * @memberof ToolsService
                     * @param {string} tool name
                     * @return {Map} capabilities information
                     */
                    getCap: function (toolName) {
                        return cap[toolName]
                    },
                    /**
                     * Get spatial-hub view config for a tool. View config overrides capabilities to control display
                     * and defaults.
                     * @memberof ToolsService
                     * @param {string} tool name
                     * @return {Map} view config including capabilities override information
                     */
                    getViewConfig: function (toolName) {
                        return viewConfig[toolName]
                    },
                    /**
                     * Begin tool status monitoring.
                     *
                     * Monitoring will repeat until execution is finished.
                     *
                     * When successful #executeResult is called.
                     *
                     * @memberof ToolsService
                     * @param {Scope} interface scope
                     */
                    checkStatus: function (uiScope) {
                        _checkStatus(uiScope)
                    },
                    /**
                     * Process tool output. Does download, display and/or add to the map as defined by
                     * capabilities and view config.
                     *
                     * @memberof ToolsService
                     * @param {Scope} interface scope
                     */
                    executeResult: function (uiScope) {
                        _executeResult(uiScope)
                    }
                }
            }])
}(angular));
