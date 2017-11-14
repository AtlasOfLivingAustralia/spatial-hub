(function (angular) {
    'use strict';
    angular.module('tools-service', [])
        .factory('ToolsService', ['$injector', '$q', '$http', '$timeout', 'MapService', 'LayersService', 'LoggerService',
            function ($injector, $q, $http, $timeout, MapService, LayersService, LoggerService) {
            var cap = {};
            var viewConfig = {};

            var url = LayersService.url() + '/capabilities';
            var setup = $http.get('portal/config/view').then(function (data) {
                viewConfig = data.data;
                return $http.get($SH.proxyUrl + "?url=" + encodeURIComponent(url)).then(function (data) {
                    var k, merged;
                    for (k in data.data) {
                        if (data.data.hasOwnProperty(k)) {
                            merged = data.data[k];

                            // merge spec input values from with view-config.json
                            if (viewConfig[k]) {
                                angular.merge(merged, viewConfig[k]);
                                angular.merge(merged.input, viewConfig[k].input)
                            }

                            cap[data.data[k].name] = merged
                        }
                    }

                    initLocalTools();

                    return $q.when(cap)
                });
            });

            /*
            uiScope is ToolCtrl
             */
            function executeRemote (uiScope, inputs) {
                var m = {};
                m['input'] = inputs;
                m['name'] = uiScope.toolName;

                var url = 'portal/postTask?sessionId=' + $SH.sessionId;
                $http.post(url, m).then(function (response) {
                    uiScope.statusUrl = LayersService.url() + '/tasks/status/' + response.data.id;
                    $timeout(function () {
                        this._checkStatus(uiScope)
                    }, 5000)
                });

                return $q.when(false)
            }

            /*
            uiScope is ToolCtrl
             */
            function _checkStatus (uiScope) {
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
                            this.checkStatus(uiScope)
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
                for (k in uiScope.finishedData.output) {
                    if (uiScope.finishedData.output.hasOwnProperty(k)) {
                        var d = uiScope.finishedData.output[k];
                        if (d.file.endsWith('.zip')) {
                            uiScope.downloadUrl = LayersService.url() + '/tasks/output/' + uiScope.finishedData.id + '/' + d.file;

                            if (uiScope.downloadImmediately) {
                                Util.download(uiScope.downloadUrl);
                            }
                        } else if (d.downloadUrl) {
                            uiScope.downloadUrl = d.downloadUrl;

                            if (uiScope.downloadImmediately) {
                                Util.download(uiScope.downloadUrl);
                            }
                        }
                    }
                }

                var promises = [];

                for (k in uiScope.finishedData.output) {
                    if (uiScope.finishedData.output.hasOwnProperty(k)) {
                        var d = uiScope.finishedData.output[k];
                        if (d.openUrl) {
                            uiScope.metadataUrl = openUrl
                        } else if (d.file.endsWith('.zip')) {
                            //processed earlier
                        } else if (d.file.endsWith('.html')) {
                            uiScope.metadataUrl = LayersService.url() + '/tasks/output/' + uiScope.finishedData.id + '/' + d.file

                        } else if (d.file.endsWith('.tif')) {
                            var name = d.file.replace('/layer/', '').replace('.tif', '');
                            var layer = {
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
                            };
                        } else if (d.name === 'area') {
                            //might be an area pid
                            promises.push(LayersService.getObject(d.file).then(function (data) {
                                data.data.layertype = 'area';
                                return MapService.add(data.data)
                            }))
                        } else if (d.name === 'species') {
                            var q = jQuery.parseJSON(d.file);

                            if (!q.qid) q.qid = q.q;
                            q.opacity = 60;

                            q.scatterplotDataUrl = uiScope.downloadUrl;

                            promises.push(MapService.add(q))
                        }
                    }
                }

                if (layer !== null && layer !== undefined) {
                    if (uiScope.metadataUrl !== null) layer.metadataUrl = uiScope.metadataUrl;
                    promises.push(MapService.add(layer))
                }

                if (uiScope.metadataUrl !== null) {
                    LoggerService.log('Tools', uiScope.toolName,
                        '{ "taskId": "' + uiScope.finishedData.id + '", "metadataUrl": "' + uiScope.metadataUrl + '"}')
                } else {
                    LoggerService.log('Tools', uiScope.toolName, '{ "taskId": "' + uiScope.finishedData.id + '"}')
                }

                if (uiScope.metadataUrl !== null) uiScope.openUrl(uiScope.metadataUrl);

                return $q.all(promises).then(function() {
                    uiScope.finished = true;
                })
            }

            var localToolServices = {};

            function registerService(toolName, service) {
                localToolServices[toolName] = service;
                cap[toolName] = service.spec
            }

            function executeLocal(uiScope, toolName, inputs) {
                var result = localToolServices[toolName].execute(inputs)

                if (result && result.then) {
                    result.then(function (response) {
                        uiScope.$close();
                    })
                } else {
                    uiScope.$close();
                }
            }

            function initLocalTools() {
                //inject all Tools into ToolsService
                $.each(spApp.requires, function (x) {
                    var v = spApp.requires[x];
                    if (v.endsWith('-service') && v.startsWith('tool-')) {
                        var name = v.replace(/-.|^./g, function(match) {return match.toUpperCase().replace('-','')});
                        var tool = $injector.get(name);

                        //is this a valid tool service?
                        if (tool && tool.spec && tool.execute) {
                            registerService(name, tool);
                        }
                    }
                });
            }

            return {
                init: function (toolName) {
                    return setup.then(function(data) {
                        if (localToolServices[toolName] && localToolServices[toolName].init) {
                            localToolServices[toolName].init();
                        }
                        return $q.when(data);
                    });
                },
                isLocalTask: function (toolName) {
                    return localToolServices[toolName] !== undefined;
                },
                execute: function (uiScope, toolName, inputs) {
                    if (localToolServices[toolName]) {
                        return executeLocal(uiScope, toolName, inputs)
                    } else {
                        return executeRemote(uiScope, inputs)
                    }
                },
                getCap: function (toolName) {
                    return cap[toolName]
                },
                getViewConfig: function (toolName) {
                    return viewConfig[toolName]
                },
                checkStatus: function(uiScope) {
                    _checkStatus(uiScope)
                },
                executeResult: function(uiScope) {
                    _executeResult(uiScope)
                }
            }
        }])
}(angular));