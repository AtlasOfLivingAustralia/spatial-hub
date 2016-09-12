(function (angular) {
    'use strict';
    angular.module('background-process-ctrl', ['map-service', 'biocache-service', 'layers-service'])
        .controller('BackgroundProcessCtrl', ['$scope', 'MapService', '$timeout', '$rootScope', '$uibModalInstance',
            'BiocacheService', '$http', 'LayersService', 'data',
            function ($scope, MapService, $timeout, $rootScope, $uibModalInstance, BiocacheService, $http, LayersService, inputData) {

                $scope.name = 'BackgroundProcessCtrl'

                $scope.stepNames = ['select process']

                $scope.step = $rootScope.getValue($scope.name, 'step', 0);

                $rootScope.addToSave($scope)

                $scope.status = ''

                $scope.selectedCapability = inputData !== undefined ? inputData.processName : ''
                $scope.capabilities = []
                $scope.cap = {}
                $http.get(LayersService.url() + '/capabilities').then(function (data) {
                    var k, merged
                    for (k in data.data) {
                        merged = data.data[k]
                        if(inputData.overrideValues){
                            merged = angular.merge(merged, inputData.overrideValues[k])
                        }

                        $scope.capabilities.push(merged)
                        $scope.cap[data.data[k].name] = merged
                    }

                    if ($scope.selectedCapability.length > 0) {
                        $scope.test()
                        $scope.ok()
                    }
                })

                $scope.values = []
                $scope.steps = 1
                $scope.stepsActual = 1
                $scope.stepsCurrent = 0
                $scope.test = function () {
                    //defaults
                    var c = $scope.cap[$scope.selectedCapability].input
                    var i = 0
                    $scope.stepsActual = 0
                    $scope.stepsCurrent = 0
                    var k
                    var value
                    for (k in c) {
                        value = c[k]
                        var v
                        if (value.type == 'area') {
                            v = value.constraints.default ||  {
                                area: {
                                    qid: '',
                                    pid: '',
                                    name: '',
                                    wms: '',
                                    legend: ''
                                }
                            }
                        } else if (value.type == 'species') {
                            v = value.constraints.default || {qid: '', name: '', bs: '', ws: ''}
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
                        $scope.values[i] = $rootScope.getValue($scope.name, $scope.selectedCapability + i, v);
                        i = i + 1
                        if (v != null || v === undefined) {
                            $scope.stepsActual = $scope.stepsActual + 1
                        }
                    }
                    $scope.steps = i
                }
                $scope.hide = function () {
                    $uibModalInstance.close({hide: true});
                }

                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };

                $scope.ok = function (data) {

                    if ($scope.stepsCurrent == 0) {
                        var sNames = []

                        for (k in $scope.cap[$scope.selectedCapability].input) {
                            var i = $scope.cap[$scope.selectedCapability].input[k]
                            if (i.type !== 'auto') {
                                sNames.push(i.description)
                            } else {
                                sNames.push('')
                            }
                        }

                        $scope.stepNames = sNames
                    }

                    if ($scope.isDisabled()) {
                        //TODO: message to user
                        return
                    }

                    if ($scope.finished) {
                        alert('process finished running. should not be here')

                        return
                    }

                    if ($scope.stepsCurrent >= $scope.stepsActual) {

                        $scope.status = 'starting...'

                        var url = 'portal/createTask'

                        //format inputs
                        var c = $scope.cap[$scope.selectedCapability].input
                        var i = 0
                        var inputs = {}
                        var k
                        var j
                        for (k in c) {
                            if ($scope.values[i] !== undefined && $scope.values[i] != null) {
                                if ($scope.values[i].area !== undefined) {
                                    inputs[k] = { pid: $scope.values[i].area.pid, qid: $scope.values[i].area.qid }
                                } else if ($scope.values[i].q !== undefined) {
                                    inputs[k] = { qid: $scope.values[i].qid, ws: $scope.values[i].ws, bs: $scope.values[i].bs }
                                } else if ($scope.values[i].layers !== undefined) {
                                    var layers = []
                                    for (j in $scope.values[i].layers) {
                                        layers.push($scope.values[i].layers[j].id)
                                    }
                                    inputs[k] = layers
                                } else {
                                    inputs[k] = $scope.values[i]
                                }
                            }
                            i = i + 1
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
                            $scope.last = k
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
                                    MapService.add(jQuery.parseJSON(d.file))
                                }
                            }

                            if (layer != null) {
                                if ($scope.metadataUrl != null) layer.metadataUrl = $scope.metadataUrl
                                MapService.add(layer)
                            }

                            $scope.cancel({noOpen: true})
                            if ($scope.metadataUrl != null) $rootScope.openIframe($scope.metadataUrl)
                        }
                    })
                }

                $scope.back = function () {
                    if ($scope.step > 1) {
                        $scope.step = $scope.step - 1
                        while ($scope.step > 1 && $scope.values[$scope.step - 1] == null && $scope.values[$scope.step - 1] !== undefined) {
                            $scope.step = $scope.step - 1
                        }
                        $scope.stepsCurrent = $scope.stepsCurrent - 1
                    }
                };

                $scope.isDisabled = function () {
                    if ($scope.step == 0) {
                        return $scope.selectedCapability.length == 0
                    } else if ($scope.stepsCurrent > $scope.stepsActual) {
                        // return !$scope.finished
                    } else {
                        //defaults
                        var c = $scope.cap[$scope.selectedCapability].input
                        var i = 0
                        var k
                        var value
                        for (k in c) {
                            if (i == $scope.step - 1) {
                                value = c[k]
                                if (value.constraints.optional) {
                                    return false
                                } else if (value.type == 'area') {
                                    return $scope.values[i].area.length == 0
                                } else if (value.type == 'species') {
                                    var v = {qid: '', name: '', bs: '', ws: ''}
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
                            i = i + 1
                        }
                    }

                    return false
                }
            }])
}(angular));