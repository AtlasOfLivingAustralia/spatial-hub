(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name WorkflowCtrl
     * @description
     */
    angular.module('workflow-ctrl', [])
        .controller('WorkflowCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance',
            'BiocacheService', '$http', 'LayersService', 'LoggerService', 'WorkflowService', '$q', 'EventService',
            'data',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, $http,
                      LayersService, LoggerService, WorkflowService, $q, EventService, config) {

                // During playback and editing the current dialog may close. Keep track of playback and edit position.
                $scope.playStep = -1;
                $scope.editing = -1;

                // Workflow can generate layers. Layers mapped are used to offset the workflow self-referencial layerUid
                $scope.layerUidOffset = MapService.getNextUid() - 1

                $scope.speciesLayerId = -1; //$scope.getSpeciesLayer()
                if (config && config.speciesLayerId) {
                    $scope.speciesLayerId = config.speciesLayerId
                }

                $scope.areaLayerId = -1; //$scope.getAreaLayer()

                $scope.workflow = []
                $scope.workflowProperties = {name: '', private: true, workflow: $scope.workflow}

                $scope.speciesLayers = $.merge([{name: 'none', uid: -1}], MapService.speciesLayers())
                $scope.areaLayers = $.merge([{name: 'none', uid: -1}], MapService.areaLayers())

                $scope.workflows = []

                $scope.sortType = 'created'

                $scope.sortReverse = true

                LayoutService.addToSave($scope);

                $scope.loadWorkflow = function (id) {
                    if (id === undefined) {
                        // load current workflow
                        while ($scope.workflow.length > 0) $scope.workflow.pop();
                        $.map(LoggerService.localHistory(), function (v) {
                            if (v.category1 != 'Create' ||
                                v.category2 == 'scatterplotCreateInOut' ||
                                v.category2 == 'adhocCreateInOut' ||
                                v.category2 == 'facetNewLayer' ||
                                v.category2 == 'facetNewLayerOut') {
                                $scope.workflow.push(v)
                            }
                        })

                        WorkflowService.initDescriptions($scope.workflowProperties.workflow)

                        $scope.workflowProperties.name = $i18n(459, "My workflow") + " " + new Date().toLocaleString()
                    } else {
                        WorkflowService.get(id).then(function (response) {
                            while ($scope.workflow.length > 0) $scope.workflow.pop();
                            var items = JSON.parse(response.data.metadata)
                            $.map(items, function (i) {
                                $scope.workflow.push(i)
                            })
                            $scope.workflowProperties.name = response.data.name
                            $scope.workflowId = id
                            $scope.workflowProperties.id = id
                            $scope.workflowProperties.created = response.data.created
                            $scope.workflowProperties.private = response.data.isPrivate

                            WorkflowService.initDescriptions($scope.workflowProperties.workflow)
                        })
                    }
                }

                $scope.deleteWorkflow = function (id) {
                    WorkflowService.delete(id).then(function (response) {
                        for (var i = 0; i < $scope.workflows.length; i++) {
                            if ($scope.workflows[i].id == id) {
                                $scope.workflows.splice(i, 1)
                            }
                        }
                    })
                }

                $scope.getSpeciesLayer = function () {
                    // get selected layer
                    var layer = MapService.selectedLayer()
                    var layerId

                    if (layer.type !== 'species') {
                        $.each($scope.speciesLayers, function (l) {
                            // get topmost layer
                            if (layerId === undefined || layerId < l.uid) {
                                layerId = l.uid;
                            }
                        })
                    } else {
                        layerId = layer.uid
                    }

                    return layerId
                }

                $scope.getAreaLayer = function () {
                    // get selected layer
                    var layer = MapService.selectedLayer()
                    var layerId

                    if (layer.type !== 'area') {
                        $.each($scope.areaLayers, function (l) {
                            // get topmost layer
                            if (layerId === undefined || layerId < l.uid) {
                                layerId = l.uid;
                            }
                        })
                    } else {
                        layerId = layer.uid
                    }

                    return layerId
                }

                $scope.setLayerUid = function (item, newId) {
                    if (item instanceof Array) {
                        $.each(item, function (idx, i) {
                            $scope.setLayerUid(i, newId)
                            }
                        )
                    } else if (item instanceof Object) {
                        $.each(item, function (idx, i) {
                                if (idx === 'layerId') {
                                    item[idx] = newId
                                } else {
                                    $scope.setLayerUid(i, newId)
                                }
                            }
                        )
                    }
                }

                $scope.offsetLayerUid = function (item) {
                    if (item instanceof Array) {
                        $.each(item, function (idx, i) {
                            $scope.offsetLayerUid(i)
                            }
                        )
                    } else if (item instanceof Object) {
                        $.each(item, function (idx, i) {
                                if (idx === 'layerId') {
                                    var newId = $scope.layerUidOffset + item[idx]
                                    while (newId >= 0 && MapService.getFullLayer(newId) == null) {
                                        $scope.layerUidOffset--
                                        newId = $scope.layerUidOffset + item[idx]
                                    }
                                    item[idx] = $scope.layerUidOffset + item[idx]
                                } else {
                                    $scope.offsetLayerUid(item[idx])
                                }
                            }
                        )
                    }
                }

                $scope.dataToOverrideValues = function (item) {

                    var input = []

                    $.map(item.data, function (v, k) {
                        input[k] = {constraints: {defaultValue: v}}
                    })

                    var ov = {};
                    ov[item.category2] = {input: input}

                    return ov;
                }

                $scope.edit = function (item) {
                    $scope.play(item, true);
                }

                $scope.play = function (item, editOnly) {
                    var stage = editOnly ? 'edit' : 'execute'

                    $scope.processData = {}

                    if (item.speciesLayerId >= 0) {
                        $scope.setLayerUid(item.data, item.speciesLayerId)
                    } else if ($scope.speciesLayerId >= 0) {
                        $scope.setLayerUid(item.data, $scope.speciesLayerId)
                    } else {
                        $scope.offsetLayerUid(item.data)
                    }

                    // All executions produce a promise, unless workflowCtrl is closed at the end of the step.
                    var promises = []

                    if ($scope.isTool(item)) {
                        // Execute tool. This will close workflowCtrl and reopen to continue after the tool is finished.
                        var processData = {
                            processName: item.category2,
                            stage: stage,
                            overrideValues: $scope.dataToOverrideValues(item)
                        };
                        $timeout(function () {
                            LayoutService.openModal('tool', processData, true)
                        }, 0)
                    } else if ($scope.isMap(item)) {
                        // Add to map.
                        if ("WMS" == item.category2) {
                            promises.push(MapService.add(item.data))
                        } else if ("Area" == item.category2) {
                            promises.push(MapService.mapFromPid(item.data))
                        } else {
                            promises.push(MapService.add(item.data))
                        }
                    } else if ($scope.isView(item)) {
                        if ("tabulation" == item.category2) {
                            LayoutService.openModal('tabulate', item.data, true)
                        } else if ("speciesInfo" == item.category2) {
                            var layer = MapService.getFullLayer(item.data.layerId)
                            LayoutService.openModal('speciesInfo', layer, true)
                        } else if ("timeSeriesPlayback" == item.category2) {
                            var layer = MapService.getFullLayer(item.data.layerId)
                            layer.playback = {
                                yearStepSize: item.data.yearStepSize,
                                monthStepSize: item.data.monthStepSize,
                                timeout: item.data.timeout,
                                type: item.data.type,
                                play: true,
                                pause: false,
                                stop: false
                            }
                            // time series playback is initiated by changing the selected layer
                            MapService.select(undefined)

                            $timeout(function () {
                                MapService.select(layer)
                            }, 0)
                        } else if (LayoutService.isPanel(item.category2)) {
                            LayoutService.openPanel(item.category2, item.data, true)
                        } else {
                            // Open view. This will close workflowCtrl and reopen to continue after the view is closed.
                            LayoutService.openModal(item.category2, item.data, true)
                        }
                    } else if ($scope.isCreate(item)) {
                        promises.push(EventService.execute(item.category2, item.data))
                    }

                    if (promises.length > 0) {
                        return $q.all(promises).then(function () {
                            return true
                        })
                    } else {
                        return $q.when(true).then(function () {
                            return false
                        })
                    }
                }

                $scope.playback = function () {
                    if ($scope.playStep < 0) {
                        $scope.playStep = 0;
                    }

                    if ($scope.workflow.length <= $scope.playStep) {
                        $timeout(function () {
                            $scope.$close()
                        }, 0)
                    } else {
                        $scope.play($scope.workflow[$scope.playStep]).then(function (loop) {
                            $scope.playStep++;
                            if (loop) {
                                $scope.playback();
                            } else {
                                $timeout(function () {
                                    $scope.$close()
                                }, 0)
                            }
                        })
                    }
                }

                $scope.isTool = function (item) {
                    return item.category1 === 'Tool'
                }

                $scope.isMap = function (item) {
                    return item.category1 === 'Map'
                }

                $scope.isView = function (item) {
                    return item.category1 === 'View'
                }

                $scope.isCreate = function (item) {
                    return item.category1 === 'Create'
                }

                $scope.setWorkflow = function (workflow) {
                    $scope.workflow = workflow
                }

                $scope.makeModeless = function () {
                    $('.modal').addClass('modeless');

                    $('.modal-dialog').draggable({
                        handle: ".modal-header"
                    });

                    $('.modal-content').resizable({
                        minHeight: 180,
                        minWidth: 350
                    });

                    $('.modal-content').on("resize", function () {
                        $('.modal-body').height($('.modal-dialog').height() - $('.modal-header').outerHeight() - $('.modal-footer').outerHeight() - ($('.modal-body').outerHeight() - $('.modal-body').height()))
                    }).trigger('resize');
                };

                $scope.save = function () {
                    return WorkflowService.save($scope.workflowProperties.name, !$scope.workflowProperties.private, $scope.workflow).then(function (response) {
                        bootbox.alert('<h3>' + $i18n("Workflow Saved") + '</h3>')
                        $scope.$close()
                    });
                }

                $scope.back = function () {
                    $scope.workflow = []
                    $scope.playStep = 0
                }

                $scope.toDate = function (str) {
                    if (str == null) {
                        return ''
                    } else {
                        var date = new Date(str)

                        return date
                    }
                }
                $scope.makeModeless()

                if (config && config.workflowId) {
                    $scope.loadWorkflow(config.workflowId)
                } else {
                    if ($scope.workflows.length == 0) {
                        WorkflowService.search('', 0, 5000).then(function (response) {
                            $scope.workflows = $.merge([{name: 'Current session'}], response.data)
                        })
                    }
                }

                // restore playback step
                if ($scope.playStep >= 0) {
                    $scope.playback();
                }

                // apply edit change
                if ($scope.editing >= 0) {
                    $scope.workflow[$scope.editing].data = $scope.processData.inputs;
                    $scope.editing = -1;
                }
            }])
}(angular));
