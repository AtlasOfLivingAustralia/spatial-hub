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
            'BiocacheService', '$http', 'LayersService', 'LoggerService',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, $http, LayersService, LoggerService) {

                // During playback and editing the current dialog may close. Keep track of playback and edit position.
                $scope.playStep = -1
                $scope.editing = -1;

                // Workflow can generate layers. Layers mapped are used to offset the workflow self-referencial layerUid
                $scope.layerUidOffset = MapService.getNextUid()

                $scope.speciesLayerId = -1; //$scope.getSpeciesLayer()
                $scope.areaLayerId = -1; //$scope.getAreaLayer()

                $scope.workflow = $.merge([], LoggerService.localHistory())
                $scope.workflowEdit = JSON.stringify($scope.workflow)

                $scope.speciesLayers = $.merge([{name: 'none', uid: -1}], MapService.speciesLayers())
                $scope.areaLayers = $.merge([{name: 'none', uid: -1}], MapService.areaLayers())

                LayoutService.addToSave($scope);

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
                    var data = JSON.parse(item.data)

                    var input = []

                    $.map(data, function (v, k) {
                        input[k] = {constraints: {default: v}}
                    })

                    var ov = {};
                    ov[item.category2] = {input: input}

                    console.log(ov)

                    return ov;
                }

                $scope.play = function (item, editOnly) {
                    console.log('editOnly:' + editOnly)
                    console.log(item)

                    var stage = editOnly ? 'edit' : 'execute'

                    $scope.processData = {}

                    if (item.useSelectedLayer) {
                        $scope.setLayerUid(item.data)
                    } else {
                        $scope.offsetLayerUid(item.data)
                    }

                    if ($scope.isTool(item)) {
                        // execute tool
                        console.log('istool')
                        // execute tool
                        var processData = {
                            processName: item.category2,
                            stage: stage,
                            overrideValues: $scope.dataToOverrideValues(item)
                        };
                        $timeout(function () {
                            LayoutService.openModal('tool', processData, true)
                        }, 0)
                    } else if ($scope.isMap(item)) {
                        // add to map
                        console.log('ismap')
                        MapService.add(item.data)
                    } else if ($scope.isView(item)) {
                        // open view
                        console.log('isview')
                        LayoutService.openModal(item.category2, item.data, true)
                    }
                }

                $scope.playback = function () {
                    if ($scope.playStep < 0) {
                        $scope.playStep = 0;
                    }
                    $.each($scope.workflow, function (idx, item) {
                        if ($scope.playStep == idx) {
                            $scope.play(item)
                        }
                        $scope.playStep++;
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

                console.log($scope)
                $scope.makeModeless()

                // restore playback step
                if ($scope.playStep >= 0) {
                    $scope.playStep++;
                    $scope.playback();
                }

                // apply edit change
                if ($scope.editing >= 0) {
                    $scope.workflow[$scope.editing].data = $scope.processData.inputs;
                    $scope.editing = -1;
                }
            }])
}(angular));