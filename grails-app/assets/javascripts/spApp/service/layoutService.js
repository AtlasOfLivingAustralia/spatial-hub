(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name LayoutService
     * @description
     *   Management of spatial-hub dialogs and panels
     */
    angular.module('layout-service', [])
        .factory("LayoutService", ['$uibModal', '$timeout', '$rootScope', 'SessionsService', 'HttpService', 'WorkflowService', 'LoggerService',
            function ($uibModal, $timeout, $rootScope, sessionsService, httpService, WorkflowService, LoggerService) {

                var showLegend = [false];
                var showOptions = [false];
                var layoutStack = [];
                var modelessStack = [];
                var toOpenStack = [];
                var panelMode = ['default'];
                var panels = ['default', 'area', 'envelope', 'nearestLocality', 'pointComparison'];

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

                    getStack: function () {
                        return layoutStack;
                    },

                    enable: function (type, data) {
                        if (type === 'legend') {
                            showLegend[0] = data === undefined ? false : data;
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

                        if (top !== undefined) {
                            for (var k1 in top[1]) {
                                if (k1[0] !== '$' && k1[0] !== '_' && top[1].hasOwnProperty(k1)) {
                                    var s = top[1][k1];
                                    for (var k2 in s) {
                                        if (k2[0] !== '$' && k2[0] !== '_' && s.hasOwnProperty(k2)) {
                                            if (!(s[k2] instanceof Function)) {
                                                if (top[2][s.componentName] === undefined)
                                                    top[2][s.componentName] = {};
                                                top[2][s.componentName][k2] = s[k2]
                                            }
                                        }
                                    }
                                }
                            }
                            this.createCheckpoint();
                        }
                    },
                    /* Save the state of a modal controller. Call after initialising controller vars. */
                    addToSave: function (scopeToSave) {
                        if (layoutStack.length > 0) {
                            var top = layoutStack[layoutStack.length - 1];

                            //apply saved values, if any
                            if (top[2][scopeToSave.componentName]) {
                                for (var k in top[2][scopeToSave.componentName]) {
                                    if (k[0] !== '$' && k[0] !== '_' && top[2][scopeToSave.componentName].hasOwnProperty(k)) {
                                        var v = top[2][scopeToSave.componentName][k];
                                        if (scopeToSave[k] !== undefined && !(v instanceof Function) &&
                                            (v instanceof Array || v instanceof Object || v instanceof String ||
                                                v instanceof Number || typeof(v) == 'string' || typeof(v) == 'number' ||
                                                typeof(v) == 'boolean')) {
                                            scopeToSave[k] = v
                                        }
                                    }
                                }
                            }

                            top[1][scopeToSave.componentName] = scopeToSave
                        }
                    },
                    /* adds popup to modeless stack */
                    addToModeless: function (scope) {
                        // remove from modal stack
                        layoutStack.pop()

                        // add to modeless stack
                        modelessStack.push(scope)
                    },
                    saveScope: function (scopeToSave) {
                        if (layoutStack.length > 0) {
                            var top = layoutStack[layoutStack.length - 1];
                            top[1][scopeToSave.componentName] = scopeToSave;
                        }
                    },
                    /* open a panel */
                    openPanel: function (type, data, reopen) {
                        this.saveSession();

                        this._closeOpen(reopen);

                        if (panelData[type] === undefined) panelData[type] = {};
                        panelData[type].data = data;
                        this.panelMode[0] = type;

                        this.createCheckpoint();
                    },
                    /* clear all saved panel info */
                    clear: function (data) {
                        layoutStack = []
                    },
                    /* list valid panels */
                    panels: function () {
                        return panels
                    },
                    /* test if a string is a valid panel name */
                    isPanel: function (name) {
                        return panels.indexOf(name) >= 0
                    },
                    /* close a panel */
                    closePanel: function (data) {
                        this.panelMode[0] = 'default';
                        this.openFromStack(data);

                        $timeout(function () {
                            $(window).trigger('resize');
                        }, 0)
                    },
                    openModal: function (type, data, reopen, openingFromStack) {
                        this.saveSession();

                        if (openingFromStack === undefined || !openingFromStack)
                            this._closeOpen(reopen);

                        var size = 'lg';
                        if (data && data.display && data.display.size) size = data.display.size;

                        var modalInstance = $uibModal.open({
                            animation: false,
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
                            this.createCheckpoint()
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
                    /* close one or all modeless windows */
                    closeModeless: function (nameOrId) {
                        for (var k in modelessStack) {
                            if (modelessStack.hasOwnProperty(k)) {
                                if (!nameOrId ||
                                    modelessStack[k].componentName == nameOrId ||
                                    modelessStack[k].$id == nameOrId) {
                                    if (modelessStack[k].close) {
                                        // custom close method
                                        modelessStack[k].close()
                                    } else if (modelessStack[k].$close) {
                                        // default close method
                                        modelessStack[k].$close()
                                    }
                                    modelessStack.splice(k, 1)
                                }
                            }
                        }
                    },
                    /* close top modal window */
                    _closeOpen: function (reopen) {
                        if (layoutStack.length > 0) {
                            _this.saveValues();
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
                    },

                    createCheckpoint: function () {
                        httpService.saveLayout(this.panelMode[0], layoutStack)
                    },

                    restoreCheckpoint: function (checkpoint) {
                        if (!checkpoint) {
                            checkpoint = httpService._status
                        }

                        this.panelMode[0] = checkpoint.panel;
                        layoutStack = checkpoint.stack;

                        if (this.panelMode[0] === 'default') {
                            this.openFromStack();
                        } else {
                            // TODO: restore panel data and map state
                        }
                    },

                    saveSession: function () {
                        if (this.panelMode[0] === 'default' && layoutStack.length === 0) {
                            httpService.saveSession(sessionsService.current())
                        }
                    },

                    resetLayout: function (layout) {
                        if (layoutStack.length > 0) {
                            _this._closeOpen(false);
                            $timeout(function (layout) {
                                _this.resetLayout(layout)
                            }, 0, false, layout);
                        } else {
                            this.closePanel();

                            if (layout) {
                                this.restoreCheckpoint(layout)
                            }
                        }
                    },
                    info: function (item) {
                        if (item.layertype === 'species') {
                            item.display = {size: 'full'};

                            this.openModal('speciesInfo', item, false)
                        } else if (item.layertype === 'area' && item.metadataUrl === undefined) {
                            var b = item.bbox;
                            if ((item.bbox + '').match(/^POLYGON/g) != null) {
                                //convert POLYGON box to bounds
                                var split = item.bbox.split(',');
                                var p1 = split[1].split(' ');
                                var p2 = split[3].split(' ');
                                b = [[Math.min(p1[1], p2[1]), Math.min(p1[0], p2[0])], [Math.max(p1[1], p2[1]), Math.max(p1[0], p2[0])]]
                            }
                            if (item.bbox && item.bbox.length === 4) {
                                b = [[item.bbox[1], item.bbox[0]], [item.bbox[3], item.bbox[2]]]
                            }

                            var metadata = "";
                            if (item.metadata !== undefined) {
                                for (var k in item.metadata) {
                                    if (item.metadata.hasOwnProperty(k)) {
                                        if (item.metadata[k].indexOf !== undefined && item.metadata[k].indexOf("http") == 0) {
                                            metadata += "<tr><td>" + k + "</td><td><a target='_blank' href='" + item.metadata[k] + "'>" + item.metadata[k] + "</a></td></tr>"
                                        } else {
                                            metadata += "<tr><td>" + k + "</td><td>" + item.metadata[k] + "</td></tr>"
                                        }
                                    }
                                }
                            }

                            bootbox.alert("<b>Area</b><br/><br/>" +
                                "<table class='table-striped table table-bordered' testTag='displayAreaInfo'>" +
                                "<tr><td style='width:100px'>" + $i18n("Name") + "</td><td>" + item.name + "</td></tr>" +
                                "<tr><td>" + $i18n(347, "Description") + "</td><td>" + item.description + "</td></tr>" +
                                "<tr><td>" + $i18n(348, "Area (sq km)") + "</td><td testTag='areaSize'>" + item.area_km.toFixed(2) + "</td></tr>" +
                                "<tr><td>" + $i18n(349, "Extents") + "</td><td>" + b[0][0] + " " + b[0][1] + ", " +
                                "<tr><td>" + $i18n(486, "Id") + "</td><td>" + item.id + "</td></tr>" +
                                b[1][0] + " " + b[1][1] + "</td></tr>" + metadata + "</table>")
                        } else {
                            if (item.metadataUrl !== undefined) {
                                this.openIframe(item.metadataUrl, '', '')
                            } else if (item.layerId) {
                                this.openIframe($SH.layersServiceUrl + '/layer/more/' + item.layerId, '', '') //Open info panel
                            } else if (item.layer && item.layer.id){
                                //e.g  https://spatial.ala.org.au/?layers=alwc4
                                //with ?layers=alwc4 params, item object will be changed. No layerId, instead of layer object.
                                this.openIframe($SH.layersServiceUrl + '/layer/more/' + item.layer.id, '', '') //Open info panel from opened panel
                            }
                        }
                    }
                };

                $rootScope.$on('resetLayout', function (event, data) {
                    _this.resetLayout(data);
                });

                $rootScope.$on('showLegend', function (event, data) {
                    _this.enable('legend', data);
                });

                return _this;
            }])
}(angular));