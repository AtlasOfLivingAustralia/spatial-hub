(function (angular) {
    'use strict';
    angular.module('lists-list-directive', ['lists-service', 'map-service'])
        .directive('listsList', ['$http', '$timeout', 'ListsService', 'MapService', 'LayoutService',
            function ($http, $timeout, ListsService, MapService, LayoutService) {

                var sortType = 'updated';
                var sortReverse = false;
                return {
                    templateUrl: '/spApp/listsList.htm',
                    scope: {
                        _custom: "&onCustom"
                    },
                    link: function (scope, element, attrs) {
                        scope.items = [];

                        scope.searchLists = '';

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
                        };

                        scope.addToMap = function () {
                            MapService.add(scope.selection);
                        };

                        ListsService.list().then(function (data) {
                            scope.setItems(data);
                        });

                        scope.$watch('searchLists', function () {
                        }, true);

                        scope.selection = {};

                        scope.getItem = function (dataResourceUid) {
                            for (var i = 0; i < scope.items.length; i++) {
                                if (scope.items[i].dataResourceUid === dataResourceUid) {
                                    return scope.items[i];
                                }
                            }
                        };

                        scope.itemUrl = function (item) {
                            return ListsService.url() + '/speciesListItem/list/' + item.dataResourceUid
                        };

                        scope.add = function (item) {
                            var found = scope.getItem(!item.dataResourceUid ? item : item.dataResourceUid);

                            if (found && found.dataResourceUid && !found.selected) {
                                found.selected = true;
                                scope.selection = found;

                                ListsService.getItemsQ(found.dataResourceUid).then(function (data) {
                                    scope._custom()({q: [data], name: found.listName})
                                })

                            }
                        };

                        scope.removeAll = function () {
                            for (var i = 0; i < scope.items.length; i++) {
                                scope.items[i].selected = false
                            }
                        };

                        scope.remove = function (item) {
                            var found = scope.getLayer(!item.dataResourceUid ? item : item.dataResourceUid);

                            found.selected = false;
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
