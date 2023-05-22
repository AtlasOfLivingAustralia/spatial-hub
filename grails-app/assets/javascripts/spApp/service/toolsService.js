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
  .factory('ToolsService',
      ['$injector', '$q', '$http', '$timeout', 'MapService', 'LayersService',
        'LoggerService', 'LayoutService',
        function ($injector, $q, $http, $timeout, MapService, LayersService,
            LoggerService, LayoutService) {
          var cap = $SH.layersServiceCapabilities;
          var viewConfig = $SH.viewConfig;
          var localToolServices = {};
          var promises = [];

          initLocalTools();

          var _httpDescription = function (method, httpconfig) {
            if (httpconfig === undefined) {
              httpconfig = {};
            }
            httpconfig.service = 'ToolsService';
            httpconfig.method = method;

            return httpconfig;
          };

          /*
          uiScope is ToolCtrl
           */
          function executeRemote(uiScope, inputs) {
            var m = {};
            m['input'] = inputs;
            m['name'] = uiScope.toolName;

            var url = $SH.baseUrl + '/portal/postTask?sessionId='
                + $SH.sessionId;
            $http.post(url, m, _httpDescription('executeRemote')).then(
                function (response) {
                  uiScope.externalTaskId = response.data.id;
                  uiScope.statusUrl = LayersService.url() + '/tasks/status/'
                      + response.data.id;
                  // Create log entry for an external tool when the task is created with the taskId
                  LoggerService.log('Tool', uiScope.toolName,{"taskId":  uiScope.externalTaskId })

                  $timeout(function () {
                    _checkStatus(uiScope);
                  }, 5000)
                },
                function (error) {
                  if (!error.handled) {
                    var message = '';
                    if (error.headers()['content-type'].indexOf('json') > 0) {
                      message = JSON.stringify((error.data))
                    } else {
                      message = error.data;
                    }

                    bootbox.alert('Failed: ' + error.status);
                  }

                  uiScope.status = 'Failed';
                  uiScope.finished = true
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
            return $http.get(uiScope.statusUrl + "?last=" + uiScope.last,
                _httpDescription('checkStatus')).then(function (response) {
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
                uiScope.logText = response.data.history[keys[k]] + '\r\n'
                    + uiScope.logText;
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
                if (response.data.output === undefined) {
                  uiScope.status = 'error';
                  uiScope.finished = true
                } else {
                  uiScope.status = 'successful';
                  uiScope.finishedData = response.data;
                  return _executeResult(uiScope)
                }
              }
            })
          }

          /**
           * Operate on tool output uiScope.finishedData.output.
           *
           * Match output file:
           * *.zip - Automatically initiate download when uiScope.spec.download==true
           * *.html - Assigned to metadataUrl. LayersServiceUrl metadataUrls are opened in an iframe, others in a new tab
           * *.csv - Opened with CsvCtrl only when there is no *.html
           * *.tif - Add to the map as a new environmental layer
           *
           * Match output name:
           * "area" - Add a new area to the map
           * "species" - Add a new species layer to the map
           * "nextprocess" - Initiate a new tool
           *
           * @param uiScope
           * @returns {Promise<any>}
           * @private
           */
          function _executeResult(uiScope) {
            var layers = [];
            var nextprocess;

            for (k in uiScope.finishedData.output) {
              if (uiScope.finishedData.output.hasOwnProperty(k)) {
                var d = uiScope.finishedData.output[k];
                if (d.file && d.file.match(/\.zip$/g) != null) {
                  var filename = uiScope.toolName + " (" + (uiScope.taskId
                      || uiScope.externalTaskId) + ").zip";
                  uiScope.downloadUrl = LayersService.url() + '/tasks/output/'
                      + uiScope.finishedData.id + '/' + encodeURI(filename)
                      + '?filename=' + d.file;

                  if (uiScope.downloadImmediately && uiScope.spec.download
                      !== false) {
                    Util.download(uiScope.downloadUrl, d.file);
                  }
                } else if (d.downloadUrl) {
                  uiScope.downloadUrl = d.downloadUrl;

                  // look for "filename=" at the end of the url
                  var filename = 'file'
                  var match = d.downloadUrl.match('filename=.*$')
                  if (match && match.length > 0) {
                    filename = match[0].replace('filename=', '')
                  } else {
                    // remove params and use end of url
                    match = d.downloadUrl.match('([^/\\?]*)(\\?.*)?$')
                    if (match && match.length > 1) {
                      filename = match[1]
                    }
                  }

                  if (uiScope.downloadImmediately && uiScope.spec.download
                      !== false) {
                    Util.download(uiScope.downloadUrl, filename);
                  }
                }
              }
            }

            var csvFile = null;
            var csvUrl = null;
            for (k in uiScope.finishedData.output) {
              if (uiScope.finishedData.output.hasOwnProperty(k)) {
                var d = uiScope.finishedData.output[k];
                if (d.openUrl) {
                  uiScope.metadataUrl = d.openUrl
                } else if (d.file && d.file.match(/\.zip$/g) != null) {
                  //processed earlier
                } else if (d.file && d.file.match(/\.html$/g) != null) {
                  uiScope.metadataUrl = LayersService.url() + '/tasks/output/'
                      + uiScope.finishedData.id + '/' + d.file
                } else if (d.file && d.file.match(/\.csv/g) != null) {
                  //can only display one csv file
                  csvUrl = LayersService.url() + '/tasks/output/'
                      + uiScope.finishedData.id + '/' + d.file;
                  csvFile = d.file;
                } else if (d.file && d.file.match(/\.tif$/g) != null) {
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
                } else if (d.name === 'area' || d.name === 'AREA') {
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
                    promises.push(
                        LayersService.getObject(d.file).then(function (data) {
                          data.data.layertype = 'area';
                          data.data.log = false // The task is logged, no need to log adding the layer
                          return MapService.add(data.data)
                        }))
                  }
                } else if (d.name === 'species' || d.name === 'SPECIES') {
                  var q = jQuery.parseJSON(d.file);

                  if (!q.qid) {
                    q.qid = q.q;
                  }
                  q.opacity = 60;

                  q.scatterplotDataUrl = uiScope.downloadUrl;

                  q.log = false // The task is logged, no need to log adding the layer

                  promises.push(MapService.add(q))
                } else if (d.name === 'nextprocess' || d.name === 'NEXTPROCESS') {
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
                if (uiScope.metadataUrl
                    !== null) {
                  layer.metadataUrl = uiScope.metadataUrl;
                }
                layer.name = uiScope.toolName + " (" + layer.name + ")";

                layer.log = false // The task is logged, no need to log adding the layer

                promises.push(MapService.add(layer));
              })
            }

            if (uiScope.metadataUrl !== null) {
              uiScope.openUrl(uiScope.metadataUrl);
            } else if (csvUrl !== null) {
              $http.get(csvUrl, _httpDescription('getCsv')).then(
                  function (data) {
                    var columnOrder = uiScope.spec.output.columnOrder;
                    if (!columnOrder) {
                      columnOrder = [];
                    }

                    LayoutService.openModal('csv', {
                      title: uiScope.toolName + " (" + csvFile + ")",
                      csv: data.data,
                      columnOrder: columnOrder,
                      info: '',
                      filename: csvFile,
                      display: {size: 'full'}
                    }, false)
                  });
            }

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
            // Create log entry for a local tool when the task is finished with the input data
            LoggerService.log('Tool', uiScope.toolName, inputs)

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
            if (typeof localToolServices[toolName].refresh === "function") {
              localToolServices[toolName].refresh(inputs, uiScope.spec)
            }
          }

          function initLocalTools() {
            //inject all Tools into ToolsService
            $.each(spApp.requires, function (x) {
              var v = spApp.requires[x];
              if (v.match(/-service$/g) != null && v.match(/^tool-/g) != null) {
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
              if (localToolServices[toolName]
                  && localToolServices[toolName].init) {
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
              return localToolServices[toolName] !== undefined || cap[toolName]
                  !== undefined;
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
