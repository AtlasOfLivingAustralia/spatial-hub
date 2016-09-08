(function (angular) {
    'use strict';
    angular.module('sandbox-list-directive', ['lists-service', 'map-service'])
        .directive('sandboxList', ['$http', 'SandboxService', 'MapService', function ($http, SandboxService, MapService) {

            var sortType = 'updated'
            var sortReverse = false
            return {
                templateUrl: 'portal/' + 'sandboxList.html',
                scope: {
                    custom: "&onCustom"
                },
                link: function (scope, element, attrs) {
                    scope.ws = SpatialPortalConfig.sandboxUrl
                    scope.bs = SpatialPortalConfig.sandboxServiceUrl

                    scope.sandboxItems = []

                    scope.setItems = function (data) {
                        for (var i = 0; i < data.length; i++) {
                            scope.sandboxItems.push({
                                //TODO: enable access to multiple sandbox instances
                                uid: data[i].uid,
                                name: data[i].name,
                                lastUpdated: data[i].lastUpdated,
                                numberOfRecords: data[i].numberOfRecords,
                                selected: false
                            })
                        }
                    }

                    scope.addToMap = function () {
                        MapService.add(scope.selection);
                    }

                    SandboxService.list(SpatialPortalConfig.userId).then(function (data) {
                        scope.setItems(data)
                    })

                    scope.selection = {}

                    scope.getItem = function (uid) {
                        for (var i = 0; i < scope.sandboxItems.length; i++) {
                            if (scope.sandboxItems[i].uid === uid) {
                                return scope.sandboxItems[i];
                            }
                        }
                    }

                    scope.add = function (sandboxItem) {
                        var item = scope.getItem(!sandboxItem.uid ? sandboxItem : sandboxItem.uid)

                        if (item && item.uid && !item.selected) {
                            item.selected = true
                            scope.selection = item

                            scope.custom()({
                                q: ["data_resource_uid:" + item.uid],
                                name: item.name,
                                bs: scope.bs,
                                ws: scope.ws
                            })
                        }
                    }

                    scope.removeAll = function () {
                        for (var i = 0; i < scope.sandboxItems.length; i++) {
                            scope.sandboxItems[i].selected = false
                        }
                    }

                    scope.remove = function (sandboxItem) {
                        var item = scope.getLayer(!sandboxItem.uid ? sandboxItem : sandboxItem.uid)

                        item.selected = false
                        scope.selection = {}
                    }

                    scope.select = function (item) {
                        scope.removeAll()
                        scope.add(item)
                    }
                }
            }


        }])
}(angular));