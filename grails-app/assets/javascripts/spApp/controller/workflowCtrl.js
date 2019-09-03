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
            'BiocacheService', '$http', 'LayersService', 'LoggerService', 'WorkflowService', '$q',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, $http, LayersService, LoggerService, WorkflowService, $q) {

                // During playback and editing the current dialog may close. Keep track of playback and edit position.
                $scope.playStep = -1
                $scope.editing = -1;

                // Workflow can generate layers. Layers mapped are used to offset the workflow self-referencial layerUid
                $scope.layerUidOffset = MapService.getNextUid()

                $scope.speciesLayerId = -1; //$scope.getSpeciesLayer()
                $scope.areaLayerId = -1; //$scope.getAreaLayer()

                $scope.workflow = undefined
                $scope.workflowName = undefined

                $scope.speciesLayers = $.merge([{name: 'none', uid: -1}], MapService.speciesLayers())
                $scope.areaLayers = $.merge([{name: 'none', uid: -1}], MapService.areaLayers())

                $scope.workflows = undefined

                LayoutService.addToSave($scope);

                if (!$scope.workflows) {
                    WorkflowService.search('', 0, 5000).then(function (response) {
                        $scope.workflows = $.merge([{description: 'Current session'}], response.data)
                    })
                }

                $scope.loadWorkflow = function (id) {
                    if (id === undefined) {
                        // load current workflow
                        $scope.workflow = $.merge([], LoggerService.localHistory())
                        $scope.workflowName = $i18n(436, "My workflow") + " " + new Date().toLocaleString()
                    } else {
                        WorkflowService.get(id).then(function (response) {
                            $scope.workflow = JSON.parse(response.data.metadata)
                            $scope.workflowName = response.data.description

                            $.map($scope.workflow, function (v) {
                                if (typeof(v.data) == 'string') {
                                    v.data = JSON.parse(v.data)

                                    if ($.isArray(v.data.data)) {
                                        $.map(v.data.data, function (subv) {
                                            subv.raw = JSON.stringify(subv.facet)
                                            if (!subv.description) {
                                                subv.description = subv.raw
                                            }
                                        })
                                    }
                                }
                            })
                        })
                    }
                }

                $scope.deleteWorkflow = function (id) {
                    WorkflowService.delete(id).then(function (response) {
                        for (var i = 0; i < $scope.workflows.length; i++) {
                            if ($scope.workflows[i].ud_header_id == id) {
                                $scope.workflows.splice(i, 1)
                            }
                        }
                    })
                }

                $scope.delete = function (item) {
                    for (var i in $scope.workflow) {
                        if ($scope.workflow[i] === item) {
                            $scope.workflow.splice(i, 1)
                        }
                    }
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

                $scope.setLayerUid = function (item) {
                    if (item instanceof Array) {
                        $.each(item, function (idx, i) {
                                $scope.setLayerUid(i)
                            }
                        )
                    } else if (item instanceof Object) {
                        $.each(item, function (idx, i) {
                                if (idx === 'layerId') {
                                    item[idx].layerId = speciesLayerId
                                }
                                $scope.setLayerUid(i)
                            }
                        )
                    }
                }

                $scope.offsetLayerUid = function (item) {
                    if (item instanceof Array) {
                        $.each(item, function (idx, i) {
                                $scope.setLayerUid(i)
                            }
                        )
                    } else if (item instanceof Object) {
                        $.each(item, function (idx, i) {
                                if (idx === 'layerId') {
                                    item[idx].layerId = layerUidOffset + speciesLayerId
                                }
                                $scope.setLayerUid(i)
                            }
                        )
                    }
                }

                $scope.dataToOverrideValues = function (item) {

                    var input = []

                    $.map(item.data, function (v, k) {
                        input[k] = {constraints: {default: v}}
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

                    if (item.useSelectedLayer) {
                        $scope.setLayerUid(item.data)
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

                    $scope.play($scope.workflow[$scope.playStep]).then(function (loop) {
                        $scope.playStep++;
                        if (loop) {
                            $scope.playback();
                        }
                    })
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
                    return WorkflowService.save($scope.workflowName, true, $scope.workflow).then(function (response) {
                        bootbox.alert('<h3>' + $i18n(437, "Workflow Saved") + '</h3>')
                    });
                }

                $scope.hasSubitems = function (item) {
                    return $.isArray(!item.data || item.data.data)
                }

                $scope.back = function () {
                    $scope.workflow = undefined
                    $scope.playStep = 0
                }

                $scope.makeModeless()

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