(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name BieService
     * @param {service} $http angular html service
     * @description
     *   Methods to interact with ALA BIE
     */
    angular.module('http-service', [])
        .factory("HttpService", ["$q", "$rootScope", "LoggerService", function ($q, $rootScope, LoggerService) {
            return {
                _requests: {},

                _errors: [],

                _uniqueId: 0,

                _layout: {
                    panel: undefined,
                    stack: undefined
                },

                _session: {},

                push: function (config) {
                    config.uniqueId = ++this._uniqueId;
                    if (!config.timeout) {
                        config.timeoutObj = $q.defer();
                        config.timeout = config.timeoutObj.promise
                    }

                    this._requests[config.uniqueId] = config;
                },

                pop: function (response, msg) {
                    var config = response.config;

                    if (msg !== undefined && response.xhrStatus !== 'timeout' && response.xhrStatus !== 'abort' && response.status !== -1) {
                        this.logError(config, msg + " status:" + response.status + " xhrStatus:" + response.response);
                    }

                    if (this._requests[config.uniqueId]) {
                        delete this._requests[config.uniqueId];
                    }

                    return true
                },

                logError: function (config, msg) {
                    if (msg && msg.indexOf('Error') >= 0 && !config.ignoreErrors) {
                        // TODO: identify fatal errors
                        var isFatalError = false;

                        if (isFatalError) {
                            var lastSession = this._session;

                            // cancel outstanding promises
                            for (var rq in this._requests) {
                                if (this._requests[rq].uniqueId > lastSession.id) {
                                    if (this._requests[rq].timeoutObj) {
                                        this._requests[rq].timeoutObj.resolve();
                                    }
                                    delete this._requests[rq]
                                }
                            }

                            $rootScope.$broadcast('resetLayout');

                            // restore session
                            $rootScope.$broadcast('loadSession', lastSession);
                        }

                        this._errors.push({msg: msg, config: config, layout: this._layout});
                        LoggerService.log('httpService', msg, config.url);
                    }
                },

                /**
                 *
                 * @param panelMode
                 * @param layoutStack
                 */
                saveLayout: function (panelMode, layoutStack) {
                    this._layout = {
                        id: ++this._uniqueId,
                        panel: panelMode,
                        stack: this._copyStack(layoutStack)
                    };
                },

                _copyStack: function (layoutStack) {
                    var stack = [];
                    for (var i in layoutStack) {
                        stack[i] = [
                            layoutStack[i][0],
                            {},
                            layoutStack[i][2],
                            layoutStack[i][3],
                            layoutStack[i][4]
                        ]
                    }
                    return stack;
                },

                retry: function (error) {
                    $rootScope.$broadcast('resetLayout', {
                        panel: error.layout.panel,
                        stack: this._copyStack(error.layout.stack)
                    });
                },

                saveSession: function (session) {
                    this._session = session;
                    this._session.id = ++this._uniqueId;
                },

                forceFail: function () {
                    var lastSession = this._session;

                    // cancel outstanding promises
                    var requestFound = false;
                    for (var rq in this._requests) {
                        if (this._requests[rq].uniqueId > lastSession.id) {
                            if (this._requests[rq].timeoutObj) {
                                this._requests[rq].timeoutObj.resolve();
                            }

                            if (!requestFound) {
                                this._errors.push({
                                    msg: "test error",
                                    config: this._requests[rq],
                                    layout: this._layout
                                });
                                requestFound = true;
                            }

                            delete this._requests[rq]
                        }
                    }

                    $rootScope.$broadcast('resetLayout');

                    // restore session
                    $rootScope.$broadcast('loadSession', lastSession);
                }
            };
        }])
}(angular));
