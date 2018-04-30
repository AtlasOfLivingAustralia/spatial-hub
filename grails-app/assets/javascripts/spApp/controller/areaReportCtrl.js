(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name AreaReportCtrl
     * @description
     *   Generate and display an area report
     */
    angular.module('area-report-ctrl', ['map-service', 'biocache-service', 'lists-service', 'layers-service'])
        .controller('AreaReportCtrl', ['$scope', 'MapService', '$timeout', 'LayoutService', '$uibModalInstance',
            'BiocacheService', 'data', '$http', 'ListsService', 'LayersService',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, data, $http,
                      ListsService, LayersService) {
                LayoutService.addToSave($scope);

                //$scope._autoClose = false;

                $scope.area = data;
                $scope.endemic = data.endemic;

                $scope.openExpertDistribution = '';
                $scope.openJournalMapDocuments = '';

                $scope.exportUrl = null;

                $scope.journalMapDocumentCount = function () {
                    if ($scope.area.wkt !== undefined && $scope.area.wkt.length > 0) {
                        $http.get(LayersService.url() + "/journalMap/search?wkt=" + $scope.area.wkt).then(function (response) {
                            $scope.setJournalMapCount(response.data)
                        });
                    } else {
                        $http.get(LayersService.url() + "/journalMap/search?pid=" + $scope.area.pid).then(function (response) {
                            $scope.setJournalMapCount(response.data)
                        });
                    }
                };

                $scope.distributions = [];
                $scope.setDistributionCount = function (data) {
                    $scope.distributions = data;
                    for (var k in $scope.items) {
                        if ($scope.items.hasOwnProperty(k)) {
                            if ($i18n('Expert distributions') === $scope.items[k].name) {
                                $scope.items[k].value = data.length
                            }
                        }
                    }
                };

                $scope.journalMap = [];
                $scope.setJournalMapCount = function (data) {
                    $scope.journalMap = data;
                    for (var k in $scope.items) {
                        if ($scope.items.hasOwnProperty(k)) {
                            if ($i18n('JournalMap articles') === $scope.items[k].name) {
                                $scope.items[k].value = data.count
                            }
                        }
                    }
                };

                $scope.distributionCounts = function () {
                    if ($scope.area.wkt !== undefined && $scope.area.wkt.length > 0) {
                        $http.get(LayersService.url() + "/distributions?wkt=" + $scope.area.wkt).then(function (response) {
                            $scope.setDistributionCount(response.data)
                        });
                    } else {
                        $http.get(LayersService.url() + "/distributions?pid=" + $scope.area.pid).then(function (response) {
                            $scope.setDistributionCount(response.data)
                        });
                    }
                };

                $scope.checklists = [];
                $scope.setChecklistCount = function (data) {
                    $scope.checklists = data;
                    var areas = {};
                    for (var k in data) {
                        if (data.hasOwnProperty(k)) {
                            areas[data[k].area_name] = data[k]
                        }
                    }
                    var areaCount = 0;
                    for (k in areas) {
                        areaCount++
                    }
                    for (k in $scope.items) {
                        if ($scope.items.hasOwnProperty(k)) {
                            if ($i18n('Checklist species distributions') === $scope.items[k].name) {
                                $scope.items[k].value = data.length
                            }
                            if ($i18n('Checklist areas') === $scope.items[k].name) {
                                $scope.items[k].value = areaCount
                            }
                        }
                    }
                };
                $scope.checklistCounts = function () {
                    if ($scope.area.wkt !== undefined && $scope.area.wkt.length > 0) {
                        $http.get(LayersService.url() + "/checklists?wkt=" + $scope.area.wkt).then(function (response) {
                            $scope.setChecklistCount(response.data)
                        });
                    } else {
                        $http.get(LayersService.url() + "/checklists?pid=" + $scope.area.pid).then(function (response) {
                            $scope.setChecklistCount(response.data)
                        });
                    }
                };


                $scope.gazPoints = [];
                $scope.setGazCount = function (data) {
                    $scope.gazPoints = data;
                    for (var k in $scope.items) {
                        if ($scope.items.hasOwnProperty(k)) {
                            if ($i18n('Gazetteer Points') === $scope.items[k].name) {
                                $scope.items[k].value = data.length
                            }
                        }
                    }
                };
                $scope.gazPointCounts = function () {
                    if ($scope.area.wkt !== undefined && $scope.area.wkt.length > 0) {
                        $http.get(LayersService.url() + "/objects/inarea/" + LayersService.gazField() + "?wkt=" + $scope.area.wkt + "&limit=9999999").then(function (response) {
                            $scope.setGazCount(response.data)
                        });
                    } else {
                        $http.get(LayersService.url() + "/objects/inarea/" + LayersService.gazField() + "?pid=" + $scope.area.pid + "&limit=9999999").then(function (response) {
                            $scope.setGazCount(response.data)
                        });
                    }
                };

                $scope.poi = [];
                $scope.setPoi = function (data) {
                    $scope.poi = data;
                    for (var k in $scope.items) {
                        if ($scope.items.hasOwnProperty(k)) {
                            if ($i18n('Points of interest') === $scope.items[k].name) {
                                $scope.items[k].value = data.length
                            }
                        }
                    }
                };
                $scope.pointOfInterestCounts = function () {
                    if ($scope.area.wkt !== undefined && $scope.area.wkt.length > 0) {
                        $http.get(LayersService.url() + "/intersect/poi/wkt?wkt=" + $scope.area.wkt + "&limit=9999999").then(function (response) {
                            $scope.setPoi(response.data)
                        });
                    } else {
                        $http.get(LayersService.url() + "/intersect/poi/wkt?pid=" + $scope.area.pid + "&limit=9999999").then(function (response) {
                            $scope.setPoi(response.data)
                        });
                    }
                };

                var areaQ = jQuery.extend({}, $scope.area);
                if (areaQ.q === undefined) {
                    areaQ.q = ["*:*"]
                } else {
                    areaQ.wkt = undefined
                }
                areaQ.bs = BiocacheService.newQuery().bs;
                areaQ.ws = BiocacheService.newQuery().ws;

                $scope.items = [];

                BiocacheService.registerQuery(areaQ).then(function (response) {
                    areaQ.qid = response.qid;

                    $scope.items = [
                        {
                            name: $i18n('Area (sq km)'),
                            link: $i18n('https://www.ala.org.au/spatial-portal-help/note-area-sq-km/'),
                            linkName: $i18n('Info'),
                            value: $scope.area.area_km.toFixed(2)
                        },
                        {
                            name: $i18n('Number of species'),
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            map: false
                        },
                        {
                            name: $i18n('Number of species - spatially valid only'),
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            map: false,
                            extraQ: ["geospatial_kosher:true"]
                        }];

                    if ($scope.endemic) {
                        $.each([
                            {
                                name: $i18n('Number of endemic species'),
                                query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                                map: false
                            },
                            {
                                name: $i18n('Number of endemic - spatially valid only'),
                                query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                                map: false,
                                extraQ: ["geospatial_kosher:true"]
                            }], function (i, v) {
                            $scope.items.push(v)
                        })
                    }

                    // TODO: move this into config and retrieve from $SH
                    $.each([
                        {
                            name: $i18n('Occurrences'),
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            occurrences: true
                        },
                        {
                            name: $i18n('Occurrences - spatially valid only'),
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            occurrences: true,
                            extraQ: ["geospatial_kosher:true"]
                        },
                        {
                            name: $i18n('Expert distributions'),
                            list: $scope.distributions,
                            value: ''
                        },
                        {
                            name: $i18n('Checklist areas'),
                            value: ''
                        },
                        {
                            name: $i18n('Checklist species distributions'),
                            list: $scope.checklists,
                            value: ''
                        },
                        {
                            name: $i18n('JournalMap articles'),
                            list: $scope.journalMap,
                            link: $i18n('https://www.journalmap.org'),
                            linkName: $i18n('JournalMap'),
                            value: ''
                        },
                        {
                            name: $i18n('Gazetteer Points'),
                            mapGaz: true,
                            value: ''
                        },
                        {
                            name: $i18n('Points of interest'),
                            value: ''
                        },
                        {
                            name: $i18n('Invasive Species'),
                            query: {
                                q: areaQ.q.concat([$SH.invasiveQ]),
                                bs: areaQ.bs,
                                ws: areaQ.ws,
                                wkt: areaQ.wkt,
                                qid: areaQ.qid
                            },
                            extraQ: [$SH.invasiveQ]
                        },
                        {
                            name: $i18n('Threatened Species'),
                            query: {
                                q: areaQ.q.concat([$SH.threatenedQ]),
                                bs: areaQ.bs,
                                ws: areaQ.ws,
                                wkt: areaQ.wkt
                            },
                            extraQ: [$SH.threatenedQ]
                        },
                        {
                            name: $i18n('Migratory species - EPBC'),
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            link: ListsService.url() + '/speciesListItem/list/dr1005',
                            linkName: $i18n('Full list'),
                            extraQ: ["species_list_uid:dr1005"]
                        },
                        {
                            name: $i18n('Australian iconic species'),
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            link: ListsService.url() + '/speciesListItem/list/dr781',
                            linkName: $i18n('Full list'),
                            extraQ: ["species_list_uid:dr781"]
                        }], function (i, v) {
                        $scope.items.push(v)
                    });

                    $.each(['Algae', 'Amphibians', 'Angiosperms', 'Animals', 'Arthropods', 'Bacteria', 'Birds',
                        'Bryophytes', 'Chromista', 'Crustaceans', 'Dicots', 'FernsAndAllies', 'Fish', 'Fungi',
                        'Gymnosperms', 'Insects', 'Mammals', 'Molluscs', 'Monocots', 'Plants', 'Protozoa', 'Reptiles'], function (i, v) {
                        $scope.items.push({
                            name: v,
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            extraQ: ["species_group:" + v]
                        })
                    });

                    $timeout(function () {
                        $scope.checklistCounts();
                        $scope.distributionCounts();
                        $scope.journalMapDocumentCount();
                        $scope.gazPointCounts();
                        $scope.pointOfInterestCounts()
                    }, 0);

                    var items = $scope.items;
                    var k;
                    for (k in items) {
                        if (items.hasOwnProperty(k)) {
                            if (items[k].query !== undefined) {
                                items[k].value = '';
                                if (items[k].occurrences !== undefined && items[k].occurrences) {
                                    $scope.count(items[k], BiocacheService.count(items[k].query, items[k].extraQ))
                                } else if (items[k].name.indexOf('endemic') >= 0) {
                                    $scope.count(items[k], BiocacheService.speciesCountEndemic(items[k].query, items[k].extraQ))
                                } else {
                                    $scope.count(items[k], BiocacheService.speciesCount(items[k].query, items[k].extraQ))
                                }
                            }
                        }
                    }

                    $scope.makeCSV()
                });

                $scope.count = function (item, promise) {
                    promise.then(function (data) {
                        item.value = data
                    })
                };

                $scope.list = function (item) {
                    BiocacheService.speciesList(item.query, item.extraQ).then(function (data) {
                        LayoutService.openModal('csv', {
                            title: item.name,
                            csv: data,
                            info: item.name + ' csv',
                            filename: item.name.replace(' ', '') + '.csv',
                            display: {size: 'full'}
                        }, true)
                    })
                };

                $scope.map = function (event, item) {
                    event.currentTarget.classList.add('disabled');
                    var q = {q: areaQ.q.concat(item.extraQ), ws: areaQ.ws, bs: areaQ.bs, wkt: areaQ.wkt};
                    BiocacheService.registerQuery(q).then(function (response) {
                        BiocacheService.newLayer(response, undefined, item.name).then(function (data) {
                            MapService.add(data)
                        })
                    })
                };

                $scope.sample = function (item) {
                    var q = {q: item.extraQ, ws: areaQ.ws, bs: areaQ.bs};
                    LayoutService.openModal('exportSample', {
                        selectedQ: q,
                        selectedArea: $scope.area,
                        step: 3
                    }, true)
                };

                $scope.makeCSV = function () {
                    var counting = false;
                    for (var k in $scope.items) {
                        if ($scope.items.hasOwnProperty(k)) {
                            if ($scope.items[k].value === '') {
                                counting = true
                            }
                        }
                    }

                    var csv = '';
                    for (k in $scope.items) {
                        if ($scope.items.hasOwnProperty(k)) {
                            csv = csv + $scope.items[k].name + ',' + $scope.items[k].value + '\n'
                        }
                    }
                    var blob = new Blob([csv], {type: 'text/plain'});
                    $scope.exportUrl = (window.URL || window.webkitURL).createObjectURL(blob);

                    if (counting) {
                        $timeout(function () {
                            $scope.makeCSV()
                        }, 2000)
                    }
                }
            }])
}(angular));
