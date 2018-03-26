(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name sandboxList
     * @description
     *   Table of selectable sandbox uploaded layers
     */
    angular.module('sandbox-list-directive', ['lists-service', 'map-service'])
        .directive('sandboxList', ['$http', '$timeout', 'SandboxService', 'MapService',
            function ($http, $timeout, SandboxService, MapService) {

                var sortType = 'updated';
                var sortReverse = false;
                return {
                    templateUrl: '/spApp/sandboxList.htm',
                    scope: {
                        _custom: "&onCustom"
                    },
                    link: function (scope, element, attrs) {
                        scope.sandboxItems = [];

                        scope.setItems = function (data) {
                            for (var i = 0; i < data.length; i++) {
                                //lists of valid sandbox instances
                                var bsList = $SH.sandboxServiceUrls;
                                var wsList = $SH.sandboxUrls;

                                //match sandbox instance
                                var bs = undefined;
                                var ws = undefined;
                                if (data[i].webserviceUrl !== undefined && data[i].webserviceUrl !== null) {
                                    for (var j = 0; j < bsList.length; j++) {
                                        if (data[i].webserviceUrl === bsList[j]) {
                                            bs = bsList[j];
                                            ws = wsList[j]
                                        }
                                    }
                                } else {
                                    //legacy sandbox uploads do not have webserviceUrl
                                    bs = bsList[0];
                                    ws = wsList[0]
                                }

                                if (bs !== undefined) {
                                    scope.sandboxItems.push({
                                        ws: ws,
                                        bs: bs,
                                        uid: data[i].uid,
                                        name: data[i].name,
                                        lastUpdated: data[i].lastUpdated,
                                        numberOfRecords: data[i].numberOfRecords,
                                        selected: false
                                    })
                                }
                            }
                        };

                        scope.addToMap = function () {
                            MapService.add(scope.selection);
                        };

                        SandboxService.list($SH.userId).then(function (data) {
                            scope.setItems(data);
                        });

                        scope.$watch('sandboxItems', function () {
                        }, true);

                        scope.selection = {};

                        scope.getItem = function (uid) {
                            for (var i = 0; i < scope.sandboxItems.length; i++) {
                                if (scope.sandboxItems[i].uid === uid) {
                                    return scope.sandboxItems[i];
                                }
                            }
                        };

                        scope.add = function (sandboxItem) {
                            var item = scope.getItem(!sandboxItem.uid ? sandboxItem : sandboxItem.uid);

                            if (item && item.uid && !item.selected) {
                                item.selected = true;
                                scope.selection = item;

                                scope._custom()({
                                    q: ["data_resource_uid:" + item.uid],
                                    name: item.name,
                                    bs: item.bs,
                                    ws: item.ws
                                })
                            }
                        };

                        scope.removeAll = function () {
                            for (var i = 0; i < scope.sandboxItems.length; i++) {
                                scope.sandboxItems[i].selected = false
                            }
                        };

                        scope.remove = function (sandboxItem) {
                            var item = scope.getLayer(!sandboxItem.uid ? sandboxItem : sandboxItem.uid);

                            item.selected = false;
                            scope.selection = {}
                        };

                        scope.select = function (item) {
                            scope.removeAll();
                            scope.add(item)
                        }
                    }
                }


            }])
}(angular));