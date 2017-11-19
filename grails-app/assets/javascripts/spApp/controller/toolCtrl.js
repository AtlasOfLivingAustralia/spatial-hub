(function (angular) {
    'use strict';
    angular.module('tool-ctrl', ['map-service', 'biocache-service', 'layers-service'])
        .controller('ToolCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance',
            'BiocacheService', '$http', 'LayersService', 'data', 'LoggerService', 'ToolsService',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, $http,
                      LayersService, inputData, LoggerService, ToolsService) {

                $scope.stepNames = [$i18n('select process')];

                $scope.step = 0;

                //TODO: is this the correct position? Maybe it should move after $scope.values
                LayoutService.addToSave($scope);

                $scope.stage = inputData && inputData.stage || 'input';
                $scope.taskId = inputData && inputData.taskId;
                $scope.downloadImmediately = !(inputData && inputData.downloadImmediately !== undefined && !inputData.downloadImmediately);
                $scope.status = '';
                $scope.statusRunning = false;
                $scope.spec = null;
                $scope.cancelled = false;

                // mandatory to provide inputData.processName
                $scope.toolName = inputData !== undefined ? inputData.processName : '';

                $scope.init = function () {
                    ToolsService.init($scope.toolName).then(function(specList) {
                        // overrideValues is set from Quick links or elsewhere
                        var k = $scope.toolName;

                        if (inputData && inputData.overrideValues && inputData.overrideValues[k]) {
                            if (inputData.overrideValues[k].input && $.isArray(specList[k].input)) {
                                // tool*Service .input is an array not a map.
                                var input = inputData.overrideValues[k].input;
                                delete inputData.overrideValues[k].input;
                                $scope.spec = angular.merge({}, specList[k], inputData.overrideValues[k])

                                // merge input
                                if (input) {
                                    for (i in $scope.spec.input) {
                                        var name = $scope.spec.input[i].name;
                                        if (input[name]) {
                                            $scope.spec.input[i] = angular.merge($scope.spec.input[i], input[name])
                                        }
                                    }
                                }
                            } else {
                                $scope.spec = angular.merge({}, specList[k], inputData.overrideValues[k])
                            }
                        } else {
                            $scope.spec = angular.merge({}, specList[k])
                        }

                        $scope.initValues();
                        $scope.ok();
                    });
                };

                $scope.values = [];
                $scope.initValues = function () {
                    //defaults
                    var c = $scope.spec.input;
                    var k;
                    var value;
                    for (k in c) {
                        if (c.hasOwnProperty(k)) {
                            value = c[k];
                            if (value.constraints === undefined) value.constraints = {};
                            var v;
                            if (value.type === 'area') {
                                if (value.constraints['defaultAreas'] === undefined) value.constraints['defaultAreas'] = true;
                                if (value.constraints['defaultToWorld'] === undefined) value.constraints['defaultToWorld'] = false;
                                if (value.constraints['max'] === undefined) value.constraints['max'] = 1000;

                                if (value.constraints['default'] !== undefined) v = value.constraints['default'];
                                else v = {area: []}
                            } else if (value.type === 'species') {
                                if (value.constraints['areaIncludes'] === undefined) value.constraints['areaIncludes'] = false;
                                if (value.constraints['spatialValidity'] === undefined) value.constraints['spatialValidity'] = true;

                                //speciesOption can be overridden by inputData
                                if (value.constraints['speciesOption'] === undefined) value.constraints['speciesOption'] = 'searchSpecies';

                                if (value.constraints['default'] !== undefined) v = value.constraints['default'];
                                else v = {q: [], name: '', bs: '', ws: ''}
                            } else if (value.type === 'layer') {
                                if (value.constraints['default'] !== undefined) v = value.constraints['default'];
                                else v = {layers: []}
                            } else if (value.type === 'boolean') {
                                v = value.constraints['default']
                            } else if (value.type === 'int') {
                                v = value.constraints['default']
                            } else if (value.type === 'double') {
                                v = value.constraints['default']
                            } else if (value.type === 'list' && value.constraints.selection !== 'single') {
                                v = [value.constraints['default']]
                            } else if (value.type === 'list' && value.constraints.selection === 'single') {
                                v = value.constraints['default']
                            } else if (value.constraints !== undefined && value.constraints['default'] !== undefined) {
                                v = value.constraints['default']
                            } else if (value.type === 'phylogeneticTree') {
                                if (value.constraints['default'] !== undefined) v = value.constraints['default'];
                                else v = []
                            } else if (value.type === 'text') {
                                v = value.constraints['default']
                            } else if (value.type === 'speciesOptions') {
                                if (value.constraints['areaIncludes'] === undefined) value.constraints['areaIncludes'] = false;
                                if (value.constraints['kosherIncludes'] === undefined) value.constraints['kosherIncludes'] = true;
                                if (value.constraints['endemicIncludes'] === undefined) value.constraints['endemicIncludes'] = false;

                                if (value.constraints['default'] !== undefined) v = value.constraints['default'];
                                else v = {}
                            } else if (value.type === 'facet') {
                                if (value.constraints['default'] !== undefined) v = value.constraints['default'];
                                else v = ""
                            } else {
                                v = null
                            }
                            //check for previously entered value in LayoutService
                            $scope.values[k] = LayoutService.getValue($scope.name, $scope.toolName + k, v);
                        }
                    }
                };

                $scope.ok = function () {
                    if ($scope.step === 0) {
                        //build stepView
                        $scope.stepView = {};
                        var order = 1;
                        // if View-config.json is configured for the selected capability, use that, otherwise, use spec
                        // TODO: can this be separated from downloadImmediately and overrideValues, and moved to ToolsService?
                        if (ToolsService.getViewConfig($scope.toolName)) {
                            ToolsService.getViewConfig($scope.toolName).view.forEach(function (v) {
                                $scope.downloadImmediately = inputData.downloadImmediately === undefined &&
                                    $scope.download !== undefined && !$scope.download;
                                $scope.stepView[order] = {name: v.name, inputArr: v.inputs};
                                order++;
                            })
                        } else {
                            for (var i in $scope.spec.input) {
                                if ($scope.spec.input.hasOwnProperty(i)) {
                                    if ($scope.spec.input[i].type !== "auto") {
                                        var view = [i];
                                        $scope.stepView[order] = {
                                            name: $scope.spec.input[i].description,
                                            inputArr: view
                                        };
                                        order++;
                                    }
                                }
                            }
                        }

                        $scope.stepsActual = Object.keys($scope.stepView).length;

                    } else {
                        $scope.step = $scope.stepsActual;
                    }

                    if ($scope.stage === 'output') {
                        $scope.step = $scope.stepsActual + 1;
                    } else {
                        if ($scope.isDisabled()) {
                            //TODO: message to user
                            return
                        }

                        if ($scope.finished) {
                            alert($i18n('process finished running. should not be here'));

                            return
                        }
                    }

                    switch ($scope.stage) {
                        case 'input':
                            if ($scope.step === $scope.stepsActual) {
                                var response = $scope.execute();
                                if (response && response.then) {
                                    response.then(function (data) {
                                        $scope.finishedData = data;
                                        ToolsService.executeResult($scope);
                                    })
                                }
                            }

                            if ($scope.stepsActual >= $scope.step)
                                $scope.step = $scope.step + 1;

                            break;
                        case 'output':
                            if ($scope.taskId) {
                                $scope.statusUrl = LayersService.url() + '/tasks/status/' + $scope.taskId;
                                ToolsService.checkStatus($scope)
                            }
                            break;
                    }
                };

                $scope.finished = false;
                $scope.finishedData = {};
                $scope.downloadUrl = null;
                $scope.metadataUrl = null;
                $scope.log = {};
                $scope.logText = '';
                $scope.last = 0;
                $scope.checkStatusTimeout = null;

                $scope.back = function () {
                    if ($scope.step > 1) {
                        $scope.step = $scope.step - 1
                    }
                };

                $scope.getInputChecks = function (i) {
                    var value = ToolsService.getCap($scope.toolName).input[i];
                    if (value.constraints.optional) {
                        return false
                    } else if (value.type === 'area') {
                        return $scope.values[i].area.length === 0
                    } else if (value.type === 'species') {
                        return $scope.values[i].q.length === 0;
                    } else if (value.type === 'layer') {
                        return $scope.values[i].layers.length < value.constraints.min || $scope.values[i].layers.length > value.constraints.max
                    } else if (value.type === 'boolean') {
                        return false
                    } else if (value.type === 'int') {
                        return $scope.values[i] < value.constraints.min || $scope.values[i] > value.constraints.max
                    } else if (value.type === 'double') {
                        return $scope.values[i] < value.constraints.min || $scope.values[i] > value.constraints.max
                    } else if (value.type === 'list' && value.constraints.selection === 'single') {
                        return $scope.values[i] === undefined
                    } else if (value.type === 'list' && value.constraints.selection !== 'single') {
                        return $scope.values[i].length === 0
                    } else if (value.type === 'phylogeneticTree') {
                        return $scope.values[i].length === 0
                    } else if (value.type === 'text') {
                        return $scope.values[i] < value.constraints.min || $scope.values[i] > value.constraints.max
                    } else if (value.type === 'speciesOptions') {
                        return false
                    } else if (value.type === 'facet') {
                        return $scope.values[i].length === 0
                    } else {
                        return false
                    }
                };

                $scope.isDisabled = function () {
                    if ($scope.step === 0) {
                        return $scope.toolName.length === 0
                    } else if ($scope.step > $scope.stepsActual) {
                        return !$scope.finished
                    } else {
                        //defaults

                        if ($scope.continous) {
                            for (var sv in $scope.stepView) {

                                //Get the input list from step view
                                // var iList = $scope.stepView[$scope.step].inputArr;
                                var iList = $scope.stepView[sv].inputArr;

                                for (var i in iList) {
                                    if (iList.hasOwnProperty(i)) {
                                        if ($scope.getInputChecks(iList[i])) {
                                            return true;
                                        }
                                    }
                                }
                            }
                        } else {
                            //Get the input list from step view
                            var iList = $scope.stepView[$scope.step].inputArr;

                            for (var i in iList) {
                                if (iList.hasOwnProperty(i)) {
                                    if ($scope.getInputChecks(iList[i])) {
                                        return true;
                                    }
                                }
                            }
                        }

                        return false;
                    }
                };

                $scope.close = function () {
                    $scope.cancelled = true;

                    $scope.$close();
                };

                $scope.execute = function () {
                    $scope.status = 'starting...';
                    $scope.statusRunning = true;

                    //format inputs
                    var inputs = $scope.getInputs();

                    ToolsService.execute($scope, $scope.toolName, inputs);
                };

                $scope.getInputs = function () {
                    var c = ToolsService.getCap($scope.toolName).input;
                    var inputs = {};
                    var k;
                    var j;
                    for (k in c) {
                        if (c.hasOwnProperty(k)) {
                            if ($scope.values[k] !== undefined && $scope.values[k] !== null) {
                                if ($scope.values[k].area !== undefined) {
                                    inputs[k] = [];
                                    for (j in $scope.values[k].area) {
                                        if ($scope.values[k].area.hasOwnProperty(j)) {
                                            var a = $scope.values[k].area[j];
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
                                    }
                                } else if ($scope.values[k].q !== undefined) {
                                    inputs[k] = {
                                        q: $scope.values[k].q,
                                        ws: $scope.values[k].ws,
                                        bs: $scope.values[k].bs,
                                        name: $scope.values[k].name
                                    }
                                } else if ($scope.values[k].layers !== undefined) {
                                    var layers = [];
                                    for (j in $scope.values[k].layers) {
                                        if ($scope.values[k].layers.hasOwnProperty(j)) {
                                            layers.push($scope.values[k].layers[j].id)
                                        }
                                    }
                                    inputs[k] = layers
                                } else {
                                    inputs[k] = $scope.values[k]
                                }
                            }
                        }
                    }

                    return inputs
                };

                $scope.openUrl = function(url) {
                    LayoutService.openIframe(url, false);
                };

                $scope.init();

                $scope.getConstraintValue = function(item, constraint, deflt) {
                    return $spNc(item.constraints, [constraint], deflt)
                };

                $scope.isLocalTask = function() {
                    return ToolsService.isLocalTask($scope.toolName)
                }

            }])
}(angular));