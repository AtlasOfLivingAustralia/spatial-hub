(function (angular) {
    'use strict';
    angular.module('lists-list-directive', ['lists-service', 'map-service'])
        .directive('listsList', ['$http', 'ListsService', 'MapService', '$rootScope', function ($http, ListsService, MapService, $rootScope) {

            var sortType = 'updated'
            var sortReverse = false
            return {
                templateUrl: 'portal/' + 'listsList.html',
                scope: {
                    custom: "&onCustom"
                },
                link: function (scope, element, attrs) {
                    scope.items = []

                    scope.setItems = function (data) {
                        if (data.length) {
                            for (var i = 0; i < data.length; i++) {
                                scope.items.push({
                                    dataResourceUid: data[i].dataResourceUid,
                                    listName: data[i].listName,
                                    lastUpdated: data[i].lastUpdated,
                                    itemCount: data[i].itemCount,
                                    fullName: data[i].fullName,
                                    selected: false
                                })
                            }
                        } else if (data.dataResourceUid) {
                            scope.items.push({
                                dataResourceUid: data.dataResourceUid,
                                listName: data.listName,
                                lastUpdated: data.lastUpdated,
                                itemCount: data.itemCount,
                                fullName: data.fullName,
                                selected: false
                            });
                        }
                    }

                    scope.addToMap = function () {
                        MapService.add(scope.selection);
                    }

                    if ($rootScope.importOpt == 'importSpecies') {
                        //var selectedItems = ListsService.items(resp.data.druid);
                        var druid = ListsService.getCache();
                        ListsService.list(druid).then(function (data) {
                            scope.setItems(data);
                            if (data.dataResourceUid) {
                                scope.add(scope.getItem(data.dataResourceUid));
                            }
                        });
                    } else {
                        ListsService.list().then(function (data) {
                            scope.setItems(data)
                        });
                    }

                    scope.selection = {}

                    scope.getItem = function (dataResourceUid) {
                        for (var i = 0; i < scope.items.length; i++) {
                            if (scope.items[i].dataResourceUid === dataResourceUid) {
                                return scope.items[i];
                            }
                        }
                    }

                    scope.add = function (item) {
                        var item = scope.getItem(!item.dataResourceUid ? item : item.dataResourceUid)

                        if (item && item.dataResourceUid && !item.selected) {
                            item.selected = true
                            scope.selection = item

                            ListsService.items(item.dataResourceUid).then(function(data){
                                var listIds = data.map(function(i){
                                                        return "(lsid:" + i.lsid + ")";
                                                     }).join(' OR ');
                                scope.custom()({q: [listIds], name: item.listName})
                            })
                            
                        }
                    }

                    scope.removeAll = function () {
                        for (var i = 0; i < scope.items.length; i++) {
                            scope.items[i].selected = false
                        }
                    }

                    scope.remove = function (item) {
                        var item = scope.getLayer(!item.dataResourceUid ? item : item.dataResourceUid)

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
