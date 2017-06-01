(function (angular) {
    'use strict';
    angular.module('layout-service', [])
        .factory("LayoutService", ['$uibModal', '$timeout', function ($uibModal, $timeout) {

            var showLegend = [true];
            var showOptions = [false];
            var layoutStack = [];
            var toOpenStack = [];
            var panelMode = ['default'];

            //default, area
            var panelData = {
                area: {}
            };

            var _this = {
                showOptions: showOptions,
                showLegend: showLegend,
                panelMode: panelMode,
                toOpenStack: toOpenStack,
                panelData: panelData,

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
                    var top = layoutStack[layoutStack.length - 1];
                    if (top !== undefined) {
                        if (top[2][component] !== undefined && top[2][component][param] !== undefined) {
                            return top[2][component][param]
                        }
                    }
                    return defaultValue
                },
                saveValues: function () {
                    var top = layoutStack[layoutStack.length - 1];

                    for (var k1 in top[1]) {
                        if (!k1.startsWith('$') && !k1.startsWith('_') && top[1].hasOwnProperty(k1)) {
                            var s = top[1][k1];
                            for (var k2 in s) {
                                if (!k2.startsWith('$') && !k2.startsWith('_') && s.hasOwnProperty(k2)) {
                                    if (!(s[k2] instanceof Function)) {
                                        if (top[2][s.componentName] === undefined)
                                            top[2][s.componentName] = {};
                                        top[2][s.componentName][k2] = s[k2]
                                    }
                                }
                            }
                        }
                    }
                },
                /* Save the state of a controller. Call after initialising controller vars. */
                addToSave: function (scopeToSave) {
                    if (layoutStack.length > 0) {
                        var top = layoutStack[layoutStack.length - 1];

                        //apply saved values, if any
                        if (top[1][scopeToSave.componentName]) {
                            for (var k in top[1][scopeToSave.componentName]) {
                                if (!k.startsWith('$') && !k.startsWith('_') && top[1][scopeToSave.componentName].hasOwnProperty(k)) {
                                    var v = top[1][scopeToSave.componentName][k];
                                    if (scopeToSave[k] && !(v instanceof Function) &&
                                        (v instanceof Array || v instanceof Object || v instanceof String || v instanceof Number)) {
                                        scopeToSave[k] = v
                                    }
                                }
                            }
                        }

                        top[1][scopeToSave.componentName] = scopeToSave
                    }
                },
                saveScope: function (scopeToSave) {
                    if (layoutStack.length > 0) {
                        var top = layoutStack[layoutStack.length - 1];
                        top[1][scopeToSave.componentName] = scopeToSave;
                    }
                },
                /* open a panel */
                openPanel: function (type, data, reopen) {
                    this._closeOpen(reopen);

                    if (panelData[type] === undefined) panelData[type] = {};
                    panelData[type].data = data;
                    this.panelMode[0] = type
                },
                /* clear all saved panel info */
                clear: function (data) {
                    layoutStack = []
                },
                /* close a panel */
                closePanel: function (data) {
                    this.panelMode[0] = 'default';
                    this.openFromStack(data)
                },
                openModal: function (type, data, reopen, openingFromStack) {
                    if (openingFromStack === undefined || !openingFromStack)
                        this._closeOpen(reopen);

                    var size = 'lg';
                    if (data && data.display && data.display.size) size = data.display.size;

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: '/spApp/' + type + 'Content.htm',
                        controller: type[0].toUpperCase() + type.substring(1) + 'Ctrl',
                        size: size,
                        backdrop: 'static',
                        resolve: {
                            data: function () {
                                return data;
                            }
                        }
                    });

                    if (openingFromStack === undefined || !openingFromStack) {
                        layoutStack.push(["openModal", {}, [], type, data]);
                    }

                    modalInstance.result.then(function (data) {
                        if (data !== undefined) {
                            if (data[0]) {
                                //do save
                                _this.saveValues()
                            } else {
                                for (var i in layoutStack) {
                                    if (layoutStack[i] === data[1]) {
                                        layoutStack.splice(Number(i), 1)
                                    }
                                }
                            }
                        } else {
                            layoutStack.pop();

                            //layoutCtrl will call openFromStack because it has a $watch on toOpenStack
                            toOpenStack.push(data)
                        }
                    }, function () {
                    });
                },
                /* open window from the save stack */
                openFromStack: function (data) {
                    if (layoutStack.length > 0) {
                        var top = layoutStack[layoutStack.length - 1];
                        var _autoClose = true;
                        for (var k in top[1]) {
                            if (top[1].hasOwnProperty(k)) {
                                if (top[1][k]._autoClose !== undefined) {
                                    _autoClose = top[1][k]._autoClose
                                }
                            }
                        }

                        if (_autoClose) {
                            $timeout(function (item) {
                                if (item[0] === 'openModal') {
                                    _this.openModal(item[3], item[4], false, true)
                                }
                            }, 0, false, top)
                        }
                    }
                },
                /* close top window */
                _closeOpen: function (reopen) {
                    if (layoutStack.length > 0) {
                        var top = layoutStack[layoutStack.length - 1];
                        var close = undefined;
                        for (var k in top[1]) {
                            if (top[1].hasOwnProperty(k)) {
                                if (top[1][k].$close !== undefined && !top[1][k]._autoClose) {
                                    close = top[1][k].$close
                                }
                            }
                        }
                        if (close) close([reopen, top])
                    }
                },
                /* open an iframe */
                openIframe: function (url, reopen) {
                    this._openIframe(url, '', '', '', reopen, false)
                },
                _openIframe: function (url, title, notes, returnData, reopen, openingFromStack) {
                    if (openingFromStack === undefined || !openingFromStack)
                        this._closeOpen(reopen);

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: '/spApp/modalIframeContent.htm',
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

                    modalInstance.opened.then(function (data) {
                        $(".modal-body").height($(window).height() - 100);
                    });

                    modalInstance.result.then(function (data) {
                        toOpenStack.push(data)
                    }, function () {
                    });
                }
            };

            return _this;
        }])
}(angular));