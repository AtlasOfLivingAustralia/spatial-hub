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

                $scope._httpDescription = function (method, httpconfig) {
                    if (httpconfig === undefined) {
                        httpconfig = {};
                    }
                    httpconfig.service = 'AreaReportCtrl';
                    httpconfig.method = method;
                    httpconfig.ignoreErrors = true;

                    return httpconfig;
                };

                $scope.area = data;
                $scope.endemic = data.endemic;

                $scope.openExpertDistribution = '';
                $scope.openJournalMapDocuments = '';

                $scope.exportUrl = null;

                $scope.journalMapDocumentCount = function () {
                    if ($scope.area.wkt !== undefined && $scope.area.wkt.length > 0) {
                        $http.get(LayersService.url() + "/journalMap/search?wkt=" + $scope.area.wkt, $scope._httpDescription('journalmapCount')).then(function (response) {
                            $scope.setJournalMapCount(response.data)
                        });
                    } else {
                        $http.get(LayersService.url() + "/journalMap/search?pid=" + $scope.area.pid, $scope._httpDescription('journalmapCount')).then(function (response) {
                            $scope.setJournalMapCount(response.data)
                        });
                    }
                };

                $scope.distributions = [];
                $scope.setDistributionCount = function (data) {
                    $scope.distributions = data;
                    for (var k in $scope.items) {
                        if ($scope.items.hasOwnProperty(k)) {
                            if ($i18n(356, "Expert distributions") === $scope.items[k].name) {
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
                            if ($i18n(357, "JournalMap articles") === $scope.items[k].name) {
                                $scope.items[k].value = data.count
                            }
                        }
                    }
                };

                $scope.distributionCounts = function () {
                    if ($scope.area.wkt !== undefined && $scope.area.wkt.length > 0) {
                        $http.get(LayersService.url() + "/distributions?wkt=" + $scope.area.wkt, $scope._httpDescription('distributionCounts')).then(function (response) {
                            $scope.setDistributionCount(response.data)
                        });
                    } else {
                        $http.get(LayersService.url() + "/distributions?pid=" + $scope.area.pid, $scope._httpDescription('distributionCounts')).then(function (response) {
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
                            if ($i18n(358, "Checklist species distributions") === $scope.items[k].name) {
                                $scope.items[k].value = data.length
                            }
                            if ($i18n(359, "Checklist areas") === $scope.items[k].name) {
                                $scope.items[k].value = areaCount
                            }
                        }
                    }
                };
                $scope.checklistCounts = function () {
                    if ($scope.area.wkt !== undefined && $scope.area.wkt.length > 0) {
                        $http.get(LayersService.url() + "/checklists?wkt=" + $scope.area.wkt, $scope._httpDescription('checklistCounts')).then(function (response) {
                            $scope.setChecklistCount(response.data)
                        });
                    } else {
                        $http.get(LayersService.url() + "/checklists?pid=" + $scope.area.pid, $scope._httpDescription('checklistCounts')).then(function (response) {
                            $scope.setChecklistCount(response.data)
                        });
                    }
                };


                $scope.gazPoints = [];
                $scope.setGazCount = function (data) {
                    $scope.gazPoints = data;
                    for (var k in $scope.items) {
                        if ($scope.items.hasOwnProperty(k)) {
                            if ($i18n(360, "Gazetteer Points") === $scope.items[k].name) {
                                $scope.items[k].value = data.length
                            }
                        }
                    }
                };
                $scope.gazPointCounts = function () {
                    if ($scope.area.wkt !== undefined && $scope.area.wkt.length > 0) {
                        $http.get(LayersService.url() + "/objects/inarea/" + LayersService.gazField() + "?wkt=" + $scope.area.wkt + "&limit=9999999", $scope._httpDescription('gazetteerCounts')).then(function (response) {
                            $scope.setGazCount(response.data)
                        });
                    } else {
                        $http.get(LayersService.url() + "/objects/inarea/" + LayersService.gazField() + "?pid=" + $scope.area.pid + "&limit=9999999", $scope._httpDescription('gazetteerCounts')).then(function (response) {
                            $scope.setGazCount(response.data)
                        });
                    }
                };

                $scope.poi = [];
                $scope.setPoi = function (data) {
                    $scope.poi = data;
                    for (var k in $scope.items) {
                        if ($scope.items.hasOwnProperty(k)) {
                            if ($i18n(361, "Points of interest") === $scope.items[k].name) {
                                $scope.items[k].value = data.length
                            }
                        }
                    }
                };
                $scope.pointOfInterestCounts = function () {
                    if ($scope.area.wkt !== undefined && $scope.area.wkt.length > 0) {
                        $http.get(LayersService.url() + "/intersect/poi/wkt?wkt=" + $scope.area.wkt + "&limit=9999999", $scope._httpDescription('pointsOfInterestCount')).then(function (response) {
                            $scope.setPoi(response.data)
                        });
                    } else {
                        $http.get(LayersService.url() + "/intersect/poi/wkt?pid=" + $scope.area.pid + "&limit=9999999", $scope._httpDescription('pointsOfInterestCount')).then(function (response) {
                            $scope.setPoi(response.data)
                        });
                    }
                };

                var areaQ = jQuery.extend({}, $scope.area);
                if (areaQ.q === undefined || areaQ.q.length === 0) {
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
                            name: $i18n(348, "Area (sq km)"),
                            link: $i18n(362, "https://www.ala.org.au/spatial-portal-help/note-area-sq-km/"),
                            linkName: $i18n(363, "Info"),
                            value: $scope.area.area_km.toFixed(2)
                        },
                        {
                            name: $i18n(364, "Number of species"),
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            map: false
                        },
                        {
                            name: $i18n(365, "Number of species - spatially valid only"),
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            map: false,
                            extraQ: ["geospatial_kosher:true"]
                        },
                        {
                            name: $i18n(366, "Number of endemic species"),
                            endemic: true,
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            map: false
                        },
                        {
                            name: $i18n(429, "Number of endemic species - spatially valid only"),
                            endemic: true,
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            map: false,
                            extraQ: ["geospatial_kosher:true"]
                        }];

                    // TODO: move this into config and retrieve from $SH
                    $.each([
                        {
                            name: $i18n(282, "Occurrences"),
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            occurrences: true
                        },
                        {
                            name: $i18n(368, "Occurrences - spatially valid only"),
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            occurrences: true,
                            extraQ: ["geospatial_kosher:true"]
                        },
                        {
                            name: $i18n(356, "Expert distributions"),
                            list: $scope.distributions,
                            value: ''
                        },
                        {
                            name: $i18n(359, "Checklist areas"),
                            value: ''
                        },
                        {
                            name: $i18n(358, "Checklist species distributions"),
                            list: $scope.checklists,
                            value: ''
                        },
                        {
                            name: $i18n(357, "JournalMap articles"),
                            list: $scope.journalMap,
                            link: $SH.journalMapUrl,
                            linkName: $i18n(369, "JournalMap"),
                            value: '',
                            ignore: $SH.journalMapUrl === ''
                        },
                        {
                            name: $i18n(360, "Gazetteer Points"),
                            mapGaz: true,
                            value: ''
                        },
                        {
                            name: $i18n(361, "Points of interest"),
                            value: ''
                        },
                        {
                            name: $i18n(370, "Invasive Species"),
                            query: {
                                q: areaQ.q.concat([$SH.invasiveQ]),
                                bs: areaQ.bs,
                                ws: areaQ.ws,
                                wkt: areaQ.wkt,
                                qid: areaQ.qid
                            },
                            extraQ: [$SH.invasiveQ],
                            ignore: $SH.listsUrl === '' || $SH.invasiveQ === ''
                        },
                        {
                            name: $i18n(371, "Threatened Species"),
                            query: {
                                q: areaQ.q.concat([$SH.threatenedQ]),
                                bs: areaQ.bs,
                                ws: areaQ.ws,
                                wkt: areaQ.wkt
                            },
                            extraQ: [$SH.threatenedQ],
                            ignore: $SH.listsUrl === '' || $SH.threatenedQ === ''
                        },
                        {
                            name: $i18n(372, "Migratory species - EPBC"),
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            link: ListsService.url() + '/speciesListItem/list/' + $SH.migratoryDR,
                            linkName: $i18n(373, "Full list"),
                            extraQ: ["species_list_uid:" + $SH.migratoryDR],
                            ignore: $SH.listsUrl === '' || $SH.migratoryDR === ''
                        },
                        {
                            name: $i18n(374, "Australian iconic species"),
                            query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                            link: ListsService.url() + '/speciesListItem/list/' + $SH.iconicSpeciesDR,
                            linkName: $i18n(373, "Full list"),
                            extraQ: ["species_list_uid:" + $SH.iconicSpeciesDR],
                            ignore: $SH.listsUrl === '' || $SH.iconicSpeciesDR === ''
                        }], function (i, v) {
                        if (v.ignore === undefined || !v.ignore) {
                            $scope.items.push(v)
                        }
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
                            columnOrder: ['Species Name',
                                'Vernacular Name',
                                'Number of records',
                                'Conservation',
                                'Invasive'],
                            info: item.name + ' csv',
                            filename: item.name.replace(' ', '') + '.csv',
                            display: {size: 'full'}
                        }, true)
                    })
                };

                $scope.map = function (event, item) {
                    event.currentTarget.classList.add('disabled');
                    if (item.extraQ === undefined) item.extraQ = [];
                    var q = {q: areaQ.q.concat(item.extraQ), ws: areaQ.ws, bs: areaQ.bs, wkt: areaQ.wkt};
                    BiocacheService.registerQuery(q).then(function (response) {
                        BiocacheService.newLayer(response, undefined, item.name).then(function (data) {
                            MapService.add(data)
                        })
                    })
                };

                $scope.sample = function (item) {
                    if (item.extraQ === undefined) item.extraQ = [];
                    var query = {q: areaQ.q.concat(item.extraQ), ws: areaQ.ws, bs: areaQ.bs, wkt: areaQ.wkt};
                    var area = {area: [$scope.area]};
                    var data = {
                        overrideValues: {
                            ToolExportSampleService: {
                                input: {
                                    species: {constraints: {'default': query, disable: true}},
                                    area: {constraints: {'default': area, disable: true}}
                                }
                            }
                        },
                        processName: "ToolExportSampleService"
                    };

                    LayoutService.clear();
                    LayoutService.openModal('tool', data)
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
                };

                $scope.makeModeless = function () {
                    $('.modal').addClass('modeless');

                    // $('.modal-backdrop')[0].style.display = 'none';
                    //
                    // $('.modal')[0].style.pointerEvents = 'none';
                    //
                    // $('.modal-dialog')[0].style.margin = '0px';

                    $('.modal-dialog').draggable({
                        handle: ".modal-header"
                    });

                    // $('.modal-dialog')[0].style.pointerEvents = 'all';
                    //
                    // $('.modal-content')[0].style.borderRadius = '6px 6px 0 0';
                    // $('.modal-content')[0].style.border = '2px solid';
                    //
                    // $('.modal-body')[0].style.height = '500px';
                    // $('.modal-body')[0].style.overflowY = 'scroll';

                    $('.modal-content').resizable({
                        minHeight: 180,
                        minWidth: 350
                    });

                    $('.modal-content').on("resize", function () {
                        $('.modal-body').height($('.modal-dialog').height() - $('.modal-header').outerHeight() - $('.modal-footer').outerHeight() - ($('.modal-body').outerHeight() - $('.modal-body').height()))
                    }).trigger('resize');
                }

                $timeout($scope.makeModeless, 0);
            }])
}(angular));
