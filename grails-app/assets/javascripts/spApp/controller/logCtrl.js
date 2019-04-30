(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name CsvCtrl
     * @description
     *   Display a CSV
     */
    angular.module('log-ctrl', ['map-service', 'biocache-service'])
        .controller('LogCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance',
            'BiocacheService', 'LoggerService', 'MenuService', 'ToolsService', '$filter', 'data',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, LoggerService,
                      MenuService, ToolsService, $filter, data) {

                $scope.data = data;

                // view type is one of ['action', 'session']
                $scope.viewType = 'actions'
                if ($scope.data && $scope.data.view) $scope.viewType = $scope.data.viewType

                // view level is 'action':[0-1], 'session':[0-1]
                $scope.viewLevel = 0
                if ($scope.data && $scope.data.viewLevel) $scope.viewLevel = $scope.data.viewLevel

                $scope.offset = 0
                $scope.max = 10
                $scope.totalCount = 0
                $scope.groupBy, $scope.countBy, $scope.sessionId, $scope.category1, $scope.category2
                $scope.content = []

                $scope.headers = []

                $scope.back = []

                LayoutService.addToSave($scope)

                $scope.goBack = function () {
                    var prev = $scope.back.pop()

                    $scope.viewType = prev.viewType
                    $scope.viewLevel = prev.viewLevel
                    $scope.offset = prev.offset
                    $scope.max = prev.max
                    $scope.totalCount = prev.totalCount
                    $scope.totalPages = prev.totalPages
                    $scope.groupBy = prev.groupBy
                    $scope.countBy = prev.countBy
                    $scope.sessionId = prev.sessionId
                    $scope.category1 = prev.category1
                    $scope.category2 = prev.category2
                    $scope.content = prev.content
                    $scope.header = prev.header
                    $scope.headerOrder = prev.headerOrder
                }

                $scope.updateContent = function (params) {
                    // keep history for 'back'
                    if (params.viewLevel !== undefined && params.viewLevel > $scope.viewLevel) {
                        $scope.back.push({
                            viewType: $scope.viewType, viewLevel: $scope.viewLevel, offset: $scope.offset,
                            max: $scope.max, totalCount: $scope.totalCount, totalPages: $scope.totalPages,
                            groupBy: $scope.groupBy, countBy: $scope.countBy, sessionId: $scope.sessionId,
                            category1: $scope.category1, category2: $scope.category2, content: $scope.content,
                            header: $scope.header, headerOrder: $scope.headerOrder
                        })
                    }

                    $scope.content = []

                    if (params.viewLevel !== undefined) $scope.viewLevel = params.viewLevel
                    if (params.viewType) $scope.viewType = params.viewType
                    if (params.offset !== undefined) $scope.offset = params.offset
                    if ($scope.viewType == 'sessions') {
                        if ($scope.viewLevel == 0) {
                            $scope.groupBy = 'sessionId'
                            $scope.countBy = 'category2'
                            $scope.sessionId = ''
                            $scope.category1 = ''
                            $scope.category2 = ''
                            $scope.header = [$i18n(431, "Date")]
                            $scope.headerOrder = []
                        } else if ($scope.viewLevel == 1) {
                            $scope.groupBy = ''
                            $scope.countBy = ''
                            $scope.sessionId = params.sessionId
                            $scope.category1 = ''
                            $scope.category2 = ''
                            $scope.header = [$i18n(431, "Date"), $i18n(432, "Action Type"), $i18n(433, "Data")]
                            $scope.headerOrder = ['sessionId', 'category2', 'data']
                        }
                    } else if ($scope.viewType == 'actions') {
                        if ($scope.viewLevel == 0) {
                            $scope.groupBy = 'category2'
                            $scope.countBy = 'record'
                            $scope.sessionId = ''
                            $scope.category1 = params.category1
                            $scope.category2 = ''
                            $scope.header = [$i18n(432, "Action Type"), $i18n(434, "Number of actions")]
                            $scope.headerOrder = []
                        } else if ($scope.viewLevel == 1) {
                            $scope.groupBy = ''
                            $scope.countBy = ''
                            $scope.sessionId = ''
                            $scope.category1 = ''
                            $scope.category2 = params.category2
                            $scope.header = [$i18n(431, "Date"), $i18n(432, "Action Type"), $i18n(433, "Data")]
                            $scope.headerOrder = ['sessionId', 'category2', 'data']
                        }
                    }

                    // Clear 'back' when $scope.viewLevel == 0
                    if ($scope.viewLevel == 0) {
                        $scope.back = []
                    }

                    LoggerService.search($scope.groupBy, $scope.countBy, $scope.sessionId, $scope.category1, $scope.category2, $scope.offset, $scope.max).then(function (response) {
                        $scope.content = response.data.records
                        $scope.totalCount = response.data.totalCount
                        $scope.totalPages = Math.ceil($scope.totalCount / $scope.max)
                    })
                }

                $scope.lookup = function (value) {
                    // lookup category2 (tool name) and sessionId (date/time)
                    if (value === undefined || value === 0) {
                        return ''
                    } else if (('' + value).match('^[1-9][0-9]{12}$')) {
                        return $filter('date')(value, 'yyyy-dd-MM hh:mm:ss')
                    } else if (!value.match) {
                        return value
                    } else {
                        var menu = MenuService.find(value)
                        var cap = ToolsService.getCap(value)
                        if (menu) {
                            return menu.parent + ' | ' + menu.name
                        } else if (cap) {
                            return 'Other' + ' | ' + cap.name
                        }
                    }
                    return value
                }

                $scope.prevPage = function () {
                    if ($scope.offset > 0) $scope.offset -= $scope.max
                    if ($scope.offset < 0) $scope.offset = 0

                    $scope.updateContent($scope)
                }

                $scope.nextPage = function () {
                    if ($scope.offset + $scope.max < $scope.totalCount) $scope.offset += $scope.max

                    $scope.updateContent($scope)
                }

                $scope.updateContent($scope)
            }

        ])
}(angular));
