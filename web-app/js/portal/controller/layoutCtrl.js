(function (angular) {
    'use strict';
    angular.module('layout-ctrl', ['layout-service'])
        .controller('LayoutCtrl', ['$rootScope', '$scope', 'LayoutService', '$uibModal', '$timeout',
            function ($rootScope, $scope, LayoutService, $uibModal, $timeout) {

                $scope.layoutStack = []

                $rootScope.getValue = function (component, param, defaultValue) {
                    var top = $scope.layoutStack[$scope.layoutStack.length - 1]
                    if (top !== undefined) {
                        if (top[2][component] !== undefined && top[2][component][param] !== undefined) {
                            return top[2][component][param]
                        }
                    }
                    return defaultValue
                }

                $rootScope.saveValues = function () {
                    var top = $scope.layoutStack[$scope.layoutStack.length - 1]

                    for (var k1 in top[1]) {
                        var s = top[1][k1]
                        for (var k2 in s) {
                            if (!(s[k2] instanceof Function) && !k2.startsWith('$')) {
                                if (top[2][s.name] === undefined)
                                    top[2][s.name] = {}
                                top[2][s.name][k2] = s[k2]
                            }
                        }
                    }
                }

                $rootScope.addToSave = function (scopeToSave) {
                    if ($scope.layoutStack.length > 0) {
                        var top = $scope.layoutStack[$scope.layoutStack.length - 1]
                        top[1][scopeToSave.name] = scopeToSave
                    }
                }

                $scope.settings = LayoutService.settings

                $scope.panelMode = 'default'; //default, area
                $scope.panelData = {
                    area: {}
                }

                $scope.openPanel = function (type, data) {
                    $scope.closeOpen()

                    if ($scope.panelData[type] === undefined) $scope.panelData[type] = {}
                    $scope.panelData[type].data = data
                    $scope.panelMode = type
                    //$scope.panelData[type].init()
                }

                $rootScope.openPanel = $scope.openPanel

                $rootScope.closePanel = function (data) {
                    $scope.panelMode = 'default'
                    $scope.openFromStack(data)
                }

                $scope.openModal = function (type, returnData) {
                    if (returnData === undefined || returnData.opening) {
                        $scope.closeOpen()
                    }

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'portal/' + type + 'Content.html',
                        controller: type[0].toUpperCase() + type.substring(1) + 'Ctrl',
                        size: 'lg',
                        backdrop: 'static',
                        resolve: {
                            data: function () {
                                return returnData;
                            }
                        }
                    });

                    if (returnData === undefined || returnData.opening) {
                        $scope.layoutStack.push(["openModal", {}, [], type])
                    }

                    modalInstance.result.then(function (data) {
                        if (data === undefined || data == null || data.hide === undefined || !data.hide) {
                            $scope.layoutStack.pop();
                            if (data === undefined || data == null || data.noOpen === undefined || !data.noOpen) {
                                $scope.openFromStack(data)
                            }
                        }
                    }, function () {

                    });
                }

                $rootScope.openModal = $scope.openModal

                $scope.openFromStack = function (data) {
                    if ($scope.layoutStack.length > 0) {
                        var item = $scope.layoutStack[$scope.layoutStack.length - 1]

                        $timeout(function () {
                            var d = data == null ? {} : data
                            if (item[0] === 'openModal') {
                                $scope.openModal(item[3], d)
                            } else if (item[0] === 'openIframe') {
                                $scope.openIframe(item[3], item[4], item[5], d)
                            }
                        }, 0)
                    }
                }

                $scope.closeOpen = function () {
                    //do save
                    if ($scope.layoutStack.length > 0) {
                        $rootScope.saveValues()
                    }

                    $rootScope.closeModal({close: false, data: {}})
                }

                $rootScope.closeModal = function (data) {
                    if ($scope.layoutStack.length > 0) {
                        var top = $scope.layoutStack[$scope.layoutStack.length - 1]
                        for (var k in top[1]) {
                            if (top[1][k].hide !== undefined) {
                                top[1][k].hide()
                            }
                        }
                    }
                }

                $scope.openIframe = function (url, title, notes, returnData) {

                    if (returnData === undefined) {
                        $scope.closeOpen()
                    }

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'portal/' + 'modalIframeContent.html',
                        controller: 'ModalIframeInstanceCtrl',
                        size: 'full',
                        backdrop: 'static',
                        resolve: {
                            src: function () {
                                return url;
                            },
                            title: function () {
                                return title;
                            },
                            notes: function () {
                                return notes;
                            }
                        }
                    });

                    if (returnData === undefined) {
                        $scope.layoutStack.push(["openIframe", {}, [], url, title, notes])
                    }

                    modalInstance.opened.then(function (data) {
                        $(".modal-body").height($(window).height() - 100);
                    })
                    modalInstance.result.then(function (data) {
                        $scope.layoutStack.pop();
                        $scope.openFromStack(data.data)
                    }, function () {

                    });
                }

                $rootScope.openIframe = $scope.openIframe

            }])
}(angular));

