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
                                        dataResourceUid: data[i].id || data[i].dataResourceUid,
                                        listName: data[i].listName || data[i].title,
                                        lastUpdated: data[i].lastUpdated,
                                        itemCount: data[i].itemCount || data[i].rowCount,
                                        fullName: data[i].fullName || data[i].owner || data[i].authority,
                                        isAuthoritative:data[i].isAuthoritative,
                                        selected: false
                                    })
                                }
                            } else if (data.dataResourceUid || data.id) {
                                scope.items.push({
                                    dataResourceUid: data.id || data.dataResourceUid,
                                    listName: data.listName || data.title,
                                    lastUpdated: data.lastUpdated,
                                    itemCount: data.itemCount || data.rowCount,
                                    fullName: data.fullName || dats.owner || data[i].authority,
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
                            if (ListsService.urlUi()) {
                                // new species-lists as urlUi defined
                                return ListsService.urlUi() + '/#/list/' + item.dataResourceUid
                            } else {
                                return ListsService.url() + '/speciesListItem/list/' + item.dataResourceUid
                            }
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
                                    //q=qid:xxxxxxxxxx
                                    ListsService.getItemsQ(found.dataResourceUid).then(function (data) {
                                        //example: (lsid:xxxx OR lsid:xxxx)
                                        var items = data.split(" OR ");
                                        var query = data;
                                        var limit = 200;
                                        if (items.length > limit ) {
                                            alert("Note: only the first 200 names will be used when when adding species to the map (for user-uploaded checklists)");
                                            query = items.slice(0,limit).join(" OR ") +")";
                                        }
                                        scope._custom()({
                                            q: [query],
                                            name: found.listName,
                                            species_list: found.dataResourceUid
                                        })
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
