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
        .directive('sandboxList', ['$http', '$timeout', 'SandboxService', 'MapService', 'BiocacheService',
            function ($http, $timeout, SandboxService, MapService, BiocacheService) {

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

                        // add spatial-service sandbox uploads
                        if ($SH.sandboxSpatialServiceUrl && $SH.sandboxSpatialServiceUrl !== '') {
                            BiocacheService.userUploads($SH.userId, $SH.sandboxSpatialServiceUrl).then(function (data) {
                                if (data.totalRecords === 0) {
                                    return;
                                }

                                // add bs and ws to each item
                                var items = data.facetResults[0].fieldResult;
                                items.forEach(function (item) {
                                    item.bs = $SH.sandboxSpatialServiceUrl;
                                    item.ws = $SH.sandboxSpatialUiUrl;
                                    // get dataset_name and last_load_date
                                    BiocacheService.searchForOccurrences({
                                        qid: item.fq, // skip qid registration for this one-off query
                                        bs: item.bs,
                                        ws: item.ws
                                    }, [], 0, 0, 'datasetName,lastProcessedDate').then(function (data) {
                                        if (data.totalRecords > 0) {
                                            // handle facets returning in a different order
                                            var order = data.facetResults[0].fieldName === 'datasetName' ? 0 : 1;
                                            item.label = data.facetResults[order === 0 ? 0 : 1].fieldResult[0].label;
                                            item.date = data.facetResults[order === 0 ? 1 : 0].fieldResult[0].label;

                                            // format the date so that it is sortable. It is currently a string, e.g. "2010-11-01T00:00:00Z"
                                            item.date = new Date(item.date).toISOString().slice(0, 10);

                                            var a = item.fq.substring(item.fq.indexOf(":") + 1);
                                            scope.sandboxItems.push({
                                                ws: item.ws,
                                                bs: item.bs,
                                                uid: item.fq.substring(item.fq.indexOf(":") + 1),
                                                name: item.label,
                                                lastUpdated: item.date,
                                                numberOfRecords: item.count,
                                                selected: false
                                            })
                                        }
                                    });
                                });
                            });
                        }

                        // add items from the deprecated sandbox
                        if ($SH.sandboxServiceUrl && $SH.sandboxUrl) {
                            SandboxService.list($SH.userId).then(function (data) {
                                scope.setItems(data);
                            });
                        }

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
