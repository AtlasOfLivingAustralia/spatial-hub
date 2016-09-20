(function (angular) {
    'use strict';
    angular.module('layout-service', [])
        .factory("LayoutService", ['$uibModal', '$timeout', function ($uibModal, $timeout) {

            var showLegend = [true]
            var showOptions = [false]
            var layoutStack = []
            var toOpenStack = []
            var panelMode = ['default']

            //default, area
            var panelData = {
                area: {}
            }

            var data = {
                showOptions: showOptions,
                showLegend: showLegend,
                panelMode: panelMode,
                toOpenStack: toOpenStack,
                
                enable: function (type) {
                    if (type === 'legend') {
                        showLegend[0] = true;
                        showOptions[0] = false;
                    } else if (type === 'options') {
                        showLegend[0] = false;
                        showOptions[0] = true;
                    }
                },
                getValue: function (component, param, defaultValue) {
                    var top = layoutStack[layoutStack.length - 1]
                    if (top !== undefined) {
                        if (top[2][component] !== undefined && top[2][component][param] !== undefined) {
                            return top[2][component][param]
                        }
                    }
                    return defaultValue
                },
                saveValues: function () {
                    var top = layoutStack[layoutStack.length - 1]

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
                },
                addToSave: function (scopeToSave) {
                    if (layoutStack.length > 0) {
                        var top = layoutStack[layoutStack.length - 1]

                        //apply saved values, if any
                        if (top[1][scopeToSave.name]) {
                            for (var k in top[1][scopeToSave.name]) {
                                var v = top[1][scopeToSave.name][k]
                                if (scopeToSave[k] &&
                                    (v instanceof Array || v instanceof Object || v instanceof String || v instanceof Number)) {
                                    scopeToSave[k] = v
                                }
                            }
                        }

                        top[1][scopeToSave.name] = scopeToSave
                    }
                },
                openPanel: function (type, data) {
                    this.closeOpen()

                    if (panelData[type] === undefined) panelData[type] = {}
                    panelData[type].data = data
                    this.panelMode[0] = type
                },
                closePanel: function (data) {
                    this.panelMode[0] = 'default'
                    this.openFromStack(data)
                },
                openModal: function (type, returnData) {
                    if (returnData === undefined || returnData.opening) {
                        this.closeOpen()
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
                        layoutStack.push(["openModal", {}, [], type])
                    }

                    modalInstance.result.then(function (data) {
                        if (data === undefined || data == null || data.hide === undefined || !data.hide) {
                            layoutStack.pop();
                            if (data === undefined || data == null || data.noOpen === undefined || !data.noOpen) {
                                //layoutCtrl will call openFromStack
                                toOpenStack.push(data)
                            }
                        }
                    }, function () {

                    });
                },
                openFromStack: function (data) {
                    if (layoutStack.length > 0) {
                        var item = layoutStack[layoutStack.length - 1]

                        $timeout(function () {
                            var d = data == null ? {} : data
                            if (item[0] === 'openModal') {
                                this.openModal(item[3], d)
                            } else if (item[0] === 'openIframe') {
                                this.openIframe(item[3], item[4], item[5], d)
                            }
                        }, 0)
                    }
                },
                closeOpen: function () {
                    //do save
                    if (layoutStack.length > 0) {
                        this.saveValues()
                    }

                    this.closeModal({close: false, data: {}})
                },
                closeModal: function (data) {
                    if (layoutStack.length > 0) {
                        var top = layoutStack[layoutStack.length - 1]
                        for (var k in top[1]) {
                            if (top[1][k].hide !== undefined) {
                                top[1][k].hide()
                            }
                        }
                    }
                },
                openIframe: function (url, title, notes, returnData) {
                    if (returnData === undefined) {
                        this.closeOpen()
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
                        layoutStack.push(["openIframe", {}, [], url, title, notes])
                    }

                    modalInstance.opened.then(function (data) {
                        $(".modal-body").height($(window).height() - 100);
                    })
                    modalInstance.result.then(function (data) {
                        layoutStack.pop();

                        //layoutCtrl will call openFromStack
                        toOpenStack.push(data.data)
                    }, function () {

                    });
                }
            }

            return data
        }])
}(angular));