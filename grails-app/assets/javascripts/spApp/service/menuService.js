(function (angular) {
    'use strict';
    angular.module('menu-service', [])
        .factory('MenuService', ['$injector', '$q', '$http', '$timeout',
            function ($injector, $q, $http, $timeout) {
            var menuConfig = {};

            var setup = $http.get('portal/config/menu').then(function (data) {
                menuConfig = data.data;
                return menuConfig;
            });

            return {
                getMenuConfig: function() {
                    if (menuConfig.size > 0) {
                        return $q.when(menuConfig)
                    } else {
                        return setup
                    }
                }
            }
        }])
}(angular));