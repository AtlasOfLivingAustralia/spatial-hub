(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name ToolCtrl
     * @description
     *   Display and run a client side or spatial-service tool.
     */
    angular.module('tool-ctrl', ['map-service', 'biocache-service', 'layers-service'])
        .controller('ToolCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance',
            'BiocacheService', '$http', 'LayersService', 'data', 'LoggerService', 'ToolsService',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, $http,
                      LayersService, inputData, LoggerService, ToolsService) {

                $scope.stepNames = [$i18n(378, "select process")];

                $scope.values = [];
                LayoutService.addToSave($scope);

                $scope.stage = inputData && inputData.stage || 'input';
                $scope.taskId = inputData && inputData.taskId;
                $scope.downloadImmediately = !(inputData && inputData.downloadImmediately !== undefined && !inputData.downloadImmediately);
                $scope.status = '';
                $scope.statusRunning = false;
                $scope.spec = null;
                $scope.cancelled = false;
                $scope.continous = true;

                // mandatory to provide inputData.processName
                $scope.toolName = inputData !== undefined ? inputData.processName : '';

                $scope.init = function () {
                    ToolsService.init($scope.toolName).then(function (specList) {
                        // overrideValues is set from Quick links or elsewhere
                        var k = $scope.toolName;

                        if (inputData && inputData.overrideValues && inputData.overrideValues[k]) {
                            if (inputData.overrideValues[k].input && $.isArray(specList[k].input)) {
                                // tool*Service .input is an array not a map.
                                var input = inputData.overrideValues[k].input;
                                delete inputData.overrideValues[k].input;
                                $scope.spec = angular.merge({}, specList[k], inputData.overrideValues[k]);

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

                            //apply override step
                            if (inputData.overrideValues.stage !== undefined) {
                                $scope.stage = inputData.overrideValues.stage
                            }
                        } else {
                            $scope.spec = angular.merge({}, specList[k])
                        }

                        $scope.initValues();
                        $scope.buildViews();

                        if ($scope.stage === 'execute') {
                            $scope.finish();
                        } else if ($scope.stage === 'output') {
                            $scope.statusUrl = $SH.layersServiceUrl + '/tasks/status/' + $scope.taskId;
                            ToolsService.checkStatus($scope)
                        }
                    });
                };

                $scope.buildViews = function () {
                    //build stepView
                    $scope.stepView = {};
                    var order = 1;
                    // if View-config.json is configured for the selected capability, use that, otherwise, use spec
                    // TODO: can this be separated from downloadImmediately and overrideValues, and moved to ToolsService?
                    var toolViewConfig = ToolsService.getViewConfig($scope.toolName)
                    if (toolViewConfig && toolViewConfig.view) {
                        toolViewConfig.view.forEach(function (v) {
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
                };

                $scope.initValues = function () {
                    //no need for initValues when $scope.values is populated from LayoutService.addToSave
                    if ($scope.values.length > 0) return;

                    //check for previously entered value in LayoutService
                    $scope.values = LayoutService.getValue($scope.componentName, 'values', $scope.values);

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

                                if (value.constraints['default'] !== undefined) v = value.constraints['default'];
                                else if (value.constraints['speciesOption'] === 'allSpecies') {
                                    //specify allSpecies default
                                    v = {
                                        q: ["*:*", "geospatial_kosher:true", $SH.fqExcludeAbsent],
                                        name: 'All species',
                                        bs: $SH.biocacheServiceUrl,
                                        ws: $SH.biocacheUrl
                                    }
                                }
                                else v = {q: [], name: '', bs: '', ws: ''};

                                // use array as the species value when constraints.max>1
                                if (value.constraints['max'] > 1) {
                                    v = []
                                }
                            } else if (value.type === 'layer') {
                                if (value.constraints['default'] !== undefined) v = value.constraints['default'];
                                else v = {layers: []}
                            } else if (value.type === 'boolean') {
                                v = value.constraints['default']
                            } else if (value.type === 'int') {
                                v = value.constraints['default']
                            } else if (value.type === 'double') {
                                v = value.constraints['default']
                            } else if (value.type === 'list') {
                                if (value.constraints.selection !== 'single') {
                                    v = [value.constraints['default']];
                                } else {
                                    v = value.constraints['default'];
                                }
                                // convert to array of labels and values
                                value.constraints._list = [];
                                if (value.constraints.labels === undefined) {
                                    value.constraints.labels = value.constraints.content;
                                }
                                for (var i in value.constraints.content) {
                                    value.constraints._list.push({
                                        value: value.constraints.content[i],
                                        label: value.constraints.labels[i]
                                    })
                                }
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
                            if ($scope.values[k] === undefined) {
                                $scope.values[k] = v;
                            }
                        }
                    }
                };

                $scope.finish = function () {
                    $scope.stage = 'execute';
                    var response = $scope.execute();
                };

                $scope.finished = false;
                $scope.finishedData = {};
                $scope.downloadUrl = null;
                $scope.metadataUrl = null;
                $scope.log = {};
                $scope.logText = '';
                $scope.last = 0;
                $scope.checkStatusTimeout = null;

                $scope.getInputChecks = function (i) {
                    var value = $scope.spec.input[i];
                    if (value.constraints === undefined) value.constraints = {};
                    if (value.constraints.optional) {
                        return false
                    } else if (value.type === 'area') {
                        return $scope.values[i].area.length === 0
                    } else if (value.type === 'species') {
                        if ($scope.values[i] instanceof Array) {
                            return !(value.constraints.min === 0 || $scope.values[i].length !== 0);
                        } else {
                            return !(value.constraints.min === 0 || $scope.values[i].q.length !== 0);
                        }
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

                    var iList;
                    var i;
                    var inputs = $scope.getInputs();
                    ToolsService.refresh($scope, $scope.toolName, inputs);

                    if ($scope.stage === '') {
                        return $scope.toolName.length === 0
                    } else if ($scope.stage === 'execute') {
                        return !$scope.finished
                    } else {
                        //defaults

                        if ($scope.continous) {
                            for (var sv in $scope.stepView) {

                                //Get the input list from step view
                                iList = $scope.stepView[sv].inputArr;

                                for (i in iList) {
                                    if (iList.hasOwnProperty(i)) {
                                        if ($scope.getInputChecks(iList[i])) {
                                            return true;
                                        }
                                    }
                                }
                            }
                        } else {
                            //Get the input list from step view
                            iList = $scope.stepView[$scope.step].inputArr;

                            for (i in iList) {
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
                    // save control state for retrying after http errors
                    LayoutService.saveValues();

                    $scope.status = 'starting...';
                    $scope.statusRunning = true;

                    //format inputs
                    var inputs = $scope.getInputs();

                    return ToolsService.execute($scope, $scope.toolName, inputs);
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

                                            var b = a.bbox;
                                            if ((a.bbox + '').match(/^POLYGON/g) != null) {
                                                //convert POLYGON box to bounds
                                                var split = a.bbox.split(',');
                                                var p1 = split[1].split(' ');
                                                var p2 = split[3].split(' ');

                                                b = [Math.min(p1[0], p2[0]), Math.min(p1[1], p2[1]), Math.max(p1[0], p2[0]), Math.max(p1[1], p2[1])];
                                            }
                                            inputs[k].push({
                                                q: a.q ? a.q : "",
                                                name: a.name,
                                                bbox: b,
                                                area_km: a.area_km,
                                                pid: a.pid,
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
                                    };
                                    // additional species related values
                                    if ($scope.values[k].species_list) {
                                        inputs[k].species_list = $scope.values[k].species_list;
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

                $scope.openUrl = function (url) {
                    if (url.indexOf($SH.layerServiceUrl) != 0) {
                        // Always open in a new window when not from spatial-service
                        Util.download(url);
                    } else {
                        // open in an iframe
                        LayoutService.openIframe(url, false);
                    }

                };

                $scope.init();

                $scope.getConstraintValue = function (item, constraint, deflt) {
                    return $spNc(item.constraints, [constraint], deflt)
                };

                $scope.isLocalTask = function () {
                    return ToolsService.isLocalTask($scope.toolName)
                }

            }])
}(angular));