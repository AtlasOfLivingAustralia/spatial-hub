(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name listsList
     * @description
     *   Table of selectable species-lists
     */
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
                                        isAuthoritative:data[i].isAuthoritative,
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

                                //If the list is authoritative, Biocache builds index against species_list_uid (over night)
                                //We should use q=species_list_uid:drxxxx
                                if (found.isAuthoritative) {
                                    scope._custom()({
                                        q: ["species_list_uid:" + found.dataResourceUid],
                                        name: found.listName,
                                        species_list: found.dataResourceUid
                                    })
                                } else {
                                    scope._custom()({
                                        // list not indexed, can be very slow (minutes)
                                        q: ["species_list:" + found.dataResourceUid],
                                        name: found.listName,
                                        species_list: found.dataResourceUid
                                    })
                                }

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
