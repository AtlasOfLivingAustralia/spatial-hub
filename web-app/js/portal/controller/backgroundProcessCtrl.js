(function (angular) {
    'use strict';
    angular.module('background-process-ctrl', ['map-service', 'biocache-service', 'layers-service'])
        .controller('BackgroundProcessCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance',
            'BiocacheService', '$http', 'LayersService', 'data',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, $http, LayersService, inputData) {

                $scope.name = 'BackgroundProcessCtrl'

                $scope.stepNames = ['select process']

                $scope.step = 0;

                LayoutService.addToSave($scope)
                $scope.stage = inputData && inputData.stage || 'input'
                $scope.taskId = inputData && inputData.taskId


                $scope.status = ''

                $scope.selectedCapability = inputData !== undefined ? inputData.processName : ''
                $scope.capabilities = []
                $scope.cap = {}
                $scope.viewConfig = null;
                $http.get('portal/viewConfig').then(function (data) {
                    $scope.viewConfig = data.data;
                    $scope.buildStepViews();
                }, function (e) {
                    $scope.viewConfig = {};
                    $scope.buildStepViews();
                });

                $scope.buildStepViews = function () {
                    $http.get(LayersService.url() + '/capabilities').then(function (data) {
                        var k, merged
                        for (k in data.data) {
                            merged = data.data[k]

                            // merge spec input values from with view-config.json
                            if ($scope.viewConfig[k]) {
                                angular.merge(merged, $scope.viewConfig[k])
                                angular.merge(merged.input, $scope.viewConfig[k].input)
                            }

                            // overrideValues is set from Quick links
                            if (inputData.overrideValues) {
                                merged = angular.merge(merged, inputData.overrideValues[k])
                            }

                            $scope.capabilities.push(merged)
                            $scope.cap[data.data[k].name] = merged
                        }

                        if ($scope.selectedCapability.length > 0) {
                            $scope.initValues();
                            $scope.ok();
                        }
                    })
                }

                $scope.values = []
                $scope.initValues = function () {
                    //defaults
                    var c = $scope.cap[$scope.selectedCapability].input
                    var k
                    var value
                    for (k in c) {
                        value = c[k]
                        var v
                        if (value.type == 'area') {
                            v = value.constraints.default || {area: [{}]}
                        } else if (value.type == 'species') {
                            v = value.constraints.default || {q: '', name: '', bs: '', ws: ''}
                        } else if (value.type == 'layer') {
                            v = {layers: []}
                        } else if (value.type == 'boolean') {
                            v = value.constraints.default
                        } else if (value.type == 'int') {
                            v = value.constraints.default
                        } else if (value.type == 'double') {
                            v = value.constraints.default
                        } else if (value.type == 'list' && value.constraints.selection != 'single') {
                            v = [value.constraints.default]
                        } else if (value.type == 'list' && value.constraints.selection == 'single') {
                            v = value.constraints.default
                        } else {
                            v = null
                        }
                        $scope.values[k] = LayoutService.getValue($scope.name, $scope.selectedCapability + k, v);
                    }
                }
                $scope.hide = function () {
                    $uibModalInstance.close({hide: true});
                }

                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };

                $scope.ok = function (data) {

                    if ($scope.step == 0) {
                        //build stepViews
                        $scope.stepView = {};
                        var order = 1;
                        // if View-config.json is configured for the selected capability, use that, otherwise, use the spec capabilitt
                        if ($scope.viewConfig[$scope.selectedCapability]) {
                            $scope.viewConfig[$scope.selectedCapability].view.forEach(function (v) {
                                $scope.stepView[order] = {name: v.name, inputArr: v.inputs};
                                order ++;
                            })
                        } else {
                            for (var i in $scope.cap[$scope.selectedCapability].input) {
                                if ($scope.cap[$scope.selectedCapability].input[i].type != "auto") {
                                    var view = [i];//[$scope.cap[$scope.selectedCapability].input[i]]; //{step: step + 1, view: i}
                                    //$scope.stepView[$scope.cap[$scope.selectedCapability].input[i].description] = view
                                    $scope.stepView[order] = {name: $scope.cap[$scope.selectedCapability].input[i].description, inputArr: view};
                                    order++;
                                }
                            }
                        }

                        $scope.stepsActual = Object.keys($scope.stepView).length;

                    }

                    if ($scope.isDisabled()) {
                        //TODO: message to user
                        return
                    }

                    if ($scope.finished) {
                        alert('process finished running. should not be here')

                        return
                    }

                    if ($scope.step >= $scope.stepsActual) {

                        $scope.status = 'starting...'

                        var url = 'portal/createTask'

                        //format inputs
                        var c = $scope.cap[$scope.selectedCapability].input
                        var inputs = {}
                        var k
                        var j
                        for (k in c) {
                            if ($scope.values[k] !== undefined && $scope.values[k] != null) {
                                if ($scope.values[k].area !== undefined) {
                                    inputs[k] = []
                                    for (j in $scope.values[k].area) {
                                        var a = $scope.values[k].area[j]
                                        if (a.pid) {
                                            inputs[k].push({
                                                pid: a.pid,
                                                q: a.q
                                            })
                                        } else {
                                            inputs[k].push({
                                                q: a.q,
                                                name: a.name,
                                                bbox: a.bbox,
                                                area_km: a.area_km,
                                                wkt: a.wkt
                                            })
                                        }
                                    }

                                } else if ($scope.values[k].q !== undefined) {
                                    inputs[k] = {
                                        q: $scope.values[k].q,
                                        ws: $scope.values[k].ws,
                                        bs: $scope.values[k].bs,
                                        name: $scope.values[k].name
                                    }
                                } else if ($scope.values[k].layers !== undefined) {
                                    var layers = []
                                    for (j in $scope.values[k].layers) {
                                        layers.push($scope.values[k].layers[j].id)
                                    }
                                    inputs[k] = layers
                                } else {
                                    inputs[k] = $scope.values[k]
                                }
                            }
                        }

                        console.log(inputs)

                        var m = {}
                        m['input'] = inputs
                        m['name'] = $scope.selectedCapability
                        //m['tag'] =

                        $http.post(url, m).then(function (response) {
                            $scope.statusUrl = LayersService.url() + '/tasks/status/' + response.data.id
                            console.log($scope.statusUrl)
                            $timeout(function () {
                                $scope.checkStatus()
                            }, 5000)
                        })
                    }

                    $scope.step = $scope.step + 1

                    //skip unknown steps, e.g. type='auto'
                    while ($scope.step - 1 < $scope.values.length && $scope.values[$scope.step - 1] == null && $scope.values[$scope.step - 1] !== undefined) {
                        $scope.step = $scope.step + 1
                    }
                    $scope.stepsCurrent = $scope.stepsCurrent + 1

                    switch ($scope.stage){
                        case 'input':
                            break;
                        case 'output':
                            if($scope.taskId) {
                                $scope.statusUrl = LayersService.url() + '/tasks/status/' + $scope.taskId
                                $scope.step = $scope.steps + 1
                                $scope.checkStatus()
                            }
                            break;
                    }
                };

                $scope.finished = false

                $scope.finishedData = {}
                $scope.downloadUrl = null
                $scope.metadataUrl = null
                $scope.log = {}
                $scope.logText = ''
                $scope.last = 0
                $scope.checkStatus = function () {
                    $http.get($scope.statusUrl + "?last=" + $scope.last).then(function (response) {
                        $scope.status = response.data.message

                        var keys = []
                        var k
                        for (k in response.data.history) {
                            keys.push(k)
                        }
                        keys.sort()
                        for (k in keys) {
                            $scope.log[keys[k]] = response.data.history[keys[k]]
                            $scope.logText = response.data.history[keys[k]] + '\r\n' + $scope.logText
                            $scope.last = keys[k]
                        }

                        if (response.data.status < 2) {
                            $timeout(function () {
                                $scope.checkStatus()
                            }, 5000)
                        } else if (response.data.status == 2) {
                            $scope.status = 'cancelled'
                            $scope.finished = true
                        } else if (response.data.status == 3) {
                            $scope.status = 'error'
                            $scope.finished = true
                        } else if (response.data.status == 4) {
                            $scope.status = 'successful'
                            $scope.finished = true

                            $scope.finishedData = response.data
                            console.log($scope.finishedData)

                            for (k in $scope.finishedData.output) {
                                var d = $scope.finishedData.output[k]
                                if (d.file.endsWith('.zip')) {
                                    $scope.downloadUrl = LayersService.url() + '/tasks/output/' + $scope.finishedData.id + '/' + d.file

                                    var link = document.createElement("a");
                                    link.href = $scope.downloadUrl;
                                    link.click();
                                } else if (d.file.endsWith('.html')) {
                                    $scope.metadataUrl = LayersService.url() + '/tasks/output/' + $scope.finishedData.id + '/' + d.file

                                } else if (d.file.endsWith('.tif')) {
                                    var name = d.file.replace('/layer/', '').replace('.tif', '')
                                    var layer = {
                                        id: $scope.finishedData.id,
                                        displaypath: SpatialPortalConfig.geoserverUrl + '/wms?layers=ALA:' + name,
                                        type: 'e',
                                        name: name,
                                        displayname: name,
                                    }
                                } else if (d.name == 'area') {
                                    //might be an area pid
                                    LayersService.getObject(d.file).then(function (data) {
                                        data.data.layertype = 'area'
                                        MapService.add(data.data)
                                    })
                                } else if (d.name == 'species') {
                                    var q = jQuery.parseJSON(d.file)
                                    BiocacheService.newLayer(q, null, q.name).then(function (data) {
                                        MapService.add(data)
                                    })
                                }
                            }

                            if (layer != null) {
                                if ($scope.metadataUrl != null) layer.metadataUrl = $scope.metadataUrl
                                MapService.add(layer)
                            }

                            $scope.cancel({noOpen: true})
                            if ($scope.metadataUrl != null) LayoutService.openIframe($scope.metadataUrl)
                        }
                    })
                }

                $scope.back = function () {
                    if ($scope.step > 1) {
                        $scope.step = $scope.step - 1
                    }
                };

                $scope.getInputChecks = function (i) {
                    var value = $scope.cap[$scope.selectedCapability].input[i];
                    if (value.constraints.optional) {
                        return false
                    } else if (value.type == 'area') {
                        return $scope.values[i].area.length == 0
                    } else if (value.type == 'species') {
                        return $scope.values[i].q.length == 0;
                    } else if (value.type == 'layer') {
                        return $scope.values[i].layers.length < value.constraints.min || $scope.values[i].layers.length > value.constraints.max
                    } else if (value.type == 'boolean') {
                        return false
                    } else if (value.type == 'int') {
                        return $scope.values[i] < value.constraints.min || $scope.values[i] > value.constraints.max
                    } else if (value.type == 'double') {
                        return $scope.values[i] < value.constraints.min || $scope.values[i] > value.constraints.max
                    } else if (value.type == 'list' && value.constraints.selection == 'single') {
                        return $scope.values[i] === undefined
                    } else if (value.type == 'list' && value.constraints.selection != 'single') {
                        return $scope.values[i].length == 0
                    } else {
                        return false
                    }
                }

                $scope.isDisabled = function () {
                    if ($scope.step == 0) {
                        return $scope.selectedCapability.length == 0
                    } else if ($scope.step > $scope.stepsActual) {
                        // return !$scope.finished
                    } else {
                        //defaults

                        //Get the input list from step view
                        var iList = $scope.stepView[$scope.step].inputArr;

                        for (var i in iList) {
                            if ($scope.getInputChecks(iList[i])) {
                                return true;
                            }
                        }

                        return false;

                    }
                }

            }])
}(angular));