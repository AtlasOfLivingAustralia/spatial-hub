(function (angular) {
    'use strict';
    angular.module('lists-list-directive', ['lists-service', 'map-service'])
        .directive('listsList', ['$http', 'ListsService', 'MapService', function ($http, ListsService, MapService) {

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
                    }

                    scope.addToMap = function () {
                        MapService.add(scope.selection);
                    }

                    ListsService.list().then(function (data) {
                        scope.setItems(data)
                    })

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

                            scope.custom()({q: ["data_resource_uid:" + item.dataResourceUid], name: item.listName})
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
