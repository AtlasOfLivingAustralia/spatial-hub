(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name MenuService
     * @description
     *   Menu configuration
     */
    angular.module('menu-service', [])
        .factory('MenuService', ['$injector', '$q', '$http', '$timeout',
            function ($injector, $q, $http, $timeout) {
                var menuConfig = {};

                var _httpDescription = function (method, httpconfig) {
                    if (httpconfig === undefined) {
                        httpconfig = {};
                    }
                    httpconfig.service = 'MenuService';
                    httpconfig.method = method;

                    return httpconfig;
                };
                //TODO: support dynamic menu update
                /*
                if ($SH.menu.indexOf('http') == 0) {
                    var setup = $http.get($SH.menu, _httpDescription('getMenu')).then(function (data) {
                        menuConfig = data.data;
                        return menuConfig;
                    });
                } else {
                    menuConfig = $SH.menu;
                    setup = $q.when(menuConfig)
                }
                */
                //TODO: support dynamic menu update
                if ($SH.menu.indexOf('http') == 0) {
                    var setup = $http.get($SH.menu, _httpDescription('getMenu')).then(function (data) {
                            var it_0 = 0;
                            var it_1 = 0;
                            for(it_0 = 0; it_0 < data.data.length; it_0++) {
                                data.data[it_0].name = $i18n(data.data[it_0].i18nNr);
                            for(it_1 = 0; it_1 < data.data[it_0].items.length; it_1++) {
                                data.data[it_0].items[it_1].name = $i18n(data.data[it_0].items[it_1].i18nNr);
                            }
                        }
                        menuConfig = data.data;
                        return menuConfig;
                    });
                } else {
                    menuConfig = $SH.menu;
                    setup = $q.when(menuConfig)
                }

                return {
                    /**
                     * Get menu config
                     * @memberof MenuService
                     * @returns {Promise(Map)} menu configuration
                     */
                    getMenuConfig: function () {
                        if (menuConfig.size > 0) {
                            return $q.when(menuConfig)
                        } else {
                            return setup
                        }
                    },

                    find: function (name) {
                        for (var i in menuConfig) {
                            var menu = menuConfig[i]
                            for (var j in menu.items) {
                                var item = menu.items[j]
                                if (item.open == name) {
                                    return {name: item.name, parent: menu.name}
                                }
                            }
                        }
                    }
                }
            }])
}(angular));