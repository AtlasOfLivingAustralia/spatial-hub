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
            'BiocacheService', 'data', '$http', 'ListsService', 'LayersService', 'EventService', '$q',
            function ($scope, MapService, $timeout, LayoutService, $uibModalInstance, BiocacheService, data, $http,
                      ListsService, LayersService, EventService, $q) {
                LayoutService.addToModeless($scope);

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
                        return $http.get(LayersService.url() + "/journalMap/search?wkt=" + $scope.area.wkt, $scope._httpDescription('journalmapCount')).then(function (response) {
                            return $scope.setJournalMapCount(response.data)
                        });
                    } else if (!($scope.area.pid.indexOf('~'))) {
                        return $http.get(LayersService.url() + "/journalMap/search?pid=" + $scope.area.pid, $scope._httpDescription('journalmapCount')).then(function (response) {
                            return $scope.setJournalMapCount(response.data)
                        });
                    } else {
                        var wkt = $scope.bboxToWkt($scope.area.bbox)
                        return $http.get(LayersService.url() + "/journalMap/search?wkt=" + wkt, $scope._httpDescription('journalmapCount')).then(function (response) {
                            return $scope.setJournalMapCount(response.data)
                        });
                    }
                };

                $scope.distributions = [];
                $scope.setDistributionCount = function (data) {
                    for (var i in data) {
                        if (data.hasOwnProperty(i)) {
                            $scope.distributions.push(data[i]);
                        }
                    }
                    for (var k in $scope.items) {
                        if ($scope.items.hasOwnProperty(k)) {
                            if ($i18n(356, "Expert distributions") === $scope.items[k].name) {
                                $scope.items[k].value = data.length
                            }
                        }
                    }
                    return $q.when(true)
                };

                $scope.journalMap = [];
                $scope.setJournalMapCount = function (data) {
                    for (var i in data.article) {
                        if (data.article.hasOwnProperty(i)) {
                            $scope.journalMap.push(data.article[i]);
                        }
                    }
                    for (var k in $scope.items) {
                        if ($scope.items.hasOwnProperty(k)) {
                            if ($i18n(357, "JournalMap articles") === $scope.items[k].name) {
                                $scope.items[k].value = data.count
                            }
                        }
                    }
                    return $q.when(true)
                };

                $scope.distributionCounts = function () {
                    if ($scope.area.wkt !== undefined && $scope.area.wkt.length > 0) {
                        return $http.get(LayersService.url() + "/distributions?wkt=" + $scope.area.wkt, $scope._httpDescription('distributionCounts')).then(function (response) {
                            return $scope.setDistributionCount(response.data)
                        });
                    } else if (($scope.area.pid + '').indexOf('~') < 0) {
                        return $http.get(LayersService.url() + "/distributions?pid=" + $scope.area.pid, $scope._httpDescription('distributionCounts')).then(function (response) {
                            return $scope.setDistributionCount(response.data)
                        });
                    } else {
                        var wkt = $scope.bboxToWkt($scope.area.bbox)
                        return $http.get(LayersService.url() + "/distributions?wkt=" + encodeURIComponent(wkt), $scope._httpDescription('distributionCounts')).then(function (response) {
                            return $scope.setDistributionCount(response.data)
                        });
                    }
                };

                $scope.checklists = [];
                $scope.setChecklistCount = function (data) {
                    for (var i in data) {
                        if (data.hasOwnProperty(i)) {
                            $scope.checklists.push(data[i]);
                        }
                    }
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
                    return $q.when(true)
                };
                $scope.checklistCounts = function () {
                    if ($scope.area.wkt !== undefined && $scope.area.wkt.length > 0) {
                        return $http.get(LayersService.url() + "/checklists?wkt=" + $scope.area.wkt, $scope._httpDescription('checklistCounts')).then(function (response) {
                            return $scope.setChecklistCount(response.data)
                        });
                    } else if (($scope.area.pid + '').indexOf('~') < 0) {
                        return $http.get(LayersService.url() + "/checklists?pid=" + $scope.area.pid, $scope._httpDescription('checklistCounts')).then(function (response) {
                            return $scope.setChecklistCount(response.data)
                        });
                    } else {
                        var wkt = $scope.bboxToWkt($scope.area.bbox)
                        return $http.get(LayersService.url() + "/checklists?wkt=" + encodeURIComponent(wkt), $scope._httpDescription('checklistCounts')).then(function (response) {
                            return $scope.setChecklistCount(response.data)
                        });
                    }
                };

                $scope.bboxToWkt = function (bbox) {
                    return 'POLYGON((' + bbox[0][1] + ' ' + bbox[0][0] + ',' + bbox[1][1] + ' ' + bbox[0][0] + ',' + bbox[1][1] + ' ' + bbox[1][0] + ',' + bbox[0][1] + ' ' + bbox[1][0] + ',' + bbox[0][1] + ' ' + bbox[0][0] + '))'
                }

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
                    return $q.when(true)
                };
                $scope.gazPointCounts = function () {
                    if ($scope.area.wkt !== undefined && $scope.area.wkt.length > 0) {
                        return $http.get(LayersService.url() + "/objects/inarea/" + LayersService.gazField() + "?wkt=" + $scope.area.wkt + "&limit=9999999", $scope._httpDescription('gazetteerCounts')).then(function (response) {
                            return $scope.setGazCount(response.data)
                        });
                    } else if (($scope.area.pid + '').indexOf('~') < 0) {
                        return $http.get(LayersService.url() + "/objects/inarea/" + LayersService.gazField() + "?pid=" + $scope.area.pid + "&limit=9999999", $scope._httpDescription('gazetteerCounts')).then(function (response) {
                            return $scope.setGazCount(response.data)
                        });
                    } else {
                        var wkt = $scope.bboxToWkt($scope.area.bbox)
                        return $http.get(LayersService.url() + "/objects/inarea/" + LayersService.gazField() + "?wkt=" + encodeURIComponent(wkt) + "&limit=9999999", $scope._httpDescription('gazetteerCounts')).then(function (response) {
                            return $scope.setGazCount(response.data)
                        });
                    }

                    return $q.when(true)
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
                    return $q.when(true)
                };

                $scope.biocollectCounts = function (idx) {
                    if ($SH.biocollectReport && $SH.biocollectReport.length > idx) {
                        var bbox = $scope.area.bbox
                        var shape = JSON.stringify({
                            type: 'Polygon',
                            coordinates: [[[bbox[0], bbox[1]], [bbox[2], bbox[1]], [bbox[2], bbox[3]], [bbox[0], bbox[3]], [bbox[0], bbox[1]]]]
                        })
                        var geoSearchJSON = encodeURIComponent(shape)
                        var geoSearchEncoded = encodeURIComponent(LZString.compressToBase64(shape))

                        var name = $SH.biocollectReport[idx].name
                        var countUrl = $SH.biocollectReport[idx].count.replace('_geoSearchJSON_', geoSearchJSON).replace('_geoSearchEncoded', geoSearchEncoded)
                        var linkUrl = $SH.biocollectReport[idx].link.replace('_geoSearchJSON_', geoSearchJSON).replace('_geoSearchEncoded', geoSearchEncoded)
                        var urlProxy = $SH.baseUrl + "/biocollect?url=" + encodeURIComponent(countUrl)
                        return $http.get(urlProxy, $scope._httpDescription('biocollectCounts')).then(function (response) {
                            return {count: response.data.hits.total, link: linkUrl, linkName: 'list', name: name}
                        });
                    } else {
                        return $q.when({})
                    }
                };

                $scope.pointOfInterestCounts = function () {
                    if ($scope.area.wkt !== undefined && $scope.area.wkt.length > 0) {
                        return $http.get(LayersService.url() + "/intersect/poi/wkt?wkt=" + $scope.area.wkt + "&limit=9999999", $scope._httpDescription('pointsOfInterestCount')).then(function (response) {
                            return $scope.setPoi(response.data)
                        });
                    } else if (($scope.area.pid + '').indexOf('~') < 0) {
                        return $http.get(LayersService.url() + "/intersect/poi/wkt?pid=" + $scope.area.pid + "&limit=9999999", $scope._httpDescription('pointsOfInterestCount')).then(function (response) {
                            return $scope.setPoi(response.data)
                        });
                    } else {
                        var wkt = $scope.bboxToWkt($scope.area.bbox)
                        return $http.get(LayersService.url() + "/intersect/poi/wkt?wkt=" + encodeURIComponent(wkt) + "&limit=9999999", $scope._httpDescription('pointsOfInterestCount')).then(function (response) {
                            return $scope.setPoi(response.data)
                        });
                    }

                };

                $scope.items = [];

                $scope.init = function (areaQ) {
                    BiocacheService.registerQuery(areaQ).then(function (response) {
                        if (response == null) {
                            return
                        }

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
                                extraQ: ["spatiallyValid:true"]
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
                                extraQ: ["spatiallyValid:true"]
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
                                extraQ: ["spatiallyValid:true"]
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
                                    wkt: areaQ.wkt,
                                    qid: areaQ.qid
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
                            'Bryophytes', 'Chromista', 'Crustaceans', 'Dicots', 'FernsAndAllies', 'Fishes', 'Fungi',
                            'Gymnosperms', 'Insects', 'Mammals', 'Molluscs', 'Monocots', 'Plants', 'Protozoa', 'Reptiles'], function (i, v) {
                            $scope.items.push({
                                name: v,
                                query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt, qid: areaQ.qid},
                                extraQ: ["species_group:" + v]
                            })
                        });

                        if ($SH.biocollectReport) {
                            $.each($SH.biocollectReport, function (i, v) {
                                $scope.biocollectCounts(i).then(function (data) {
                                    if (data) {
                                        $scope.items.push(data)
                                    }
                                })
                            })
                        }

                        $timeout(function () {
                            $scope.checklistCounts().then(function () {
                                $scope.distributionCounts().then(function () {
                                    $scope.journalMapDocumentCount().then(function () {
                                        $scope.gazPointCounts().then(function () {
                                            $scope.pointOfInterestCounts()
                                        })
                                    })
                                })
                            })
                        }, 0);

                        $scope.countNextItem($scope.items, 0);
                    });
                };

                $scope.countNextItem = function(items, index) {
                    if (items[index]) {
                        if (index < items.length) {
                            if (items[index].query !== undefined) {
                                items[index].value = '';
                                if (items[index].occurrences !== undefined && items[index].occurrences) {
                                    $scope.count(items[index], BiocacheService.count(items[index].query, items[index].extraQ)).then(function (count) {
                                        $scope.countNextItem(items, index + 1)
                                    })
                                } else if (items[index].name.indexOf('endemic') >= 0) {
                                    $scope.count(items[index], BiocacheService.speciesCountEndemic(items[index].query, items[index].extraQ))
                                    // endemic counts are slow, do not wait
                                    $scope.countNextItem(items, index + 1)
                                } else {
                                    $scope.count(items[index], BiocacheService.speciesCount(items[index].query, items[index].extraQ)).then(function (count) {
                                        $scope.countNextItem(items, index + 1)
                                    })
                                }
                            } else {
                                $scope.countNextItem(items, index + 1)
                            }
                        }
                    }
                    $scope.makeCSV()
                }

                $scope.count = function (item, promise) {
                    return promise.then(function (data) {
                        item.value = data
                    })
                };

                $scope.listCsv = function (data, name) {
                    var csv = '';
                    var header = [];
                    // use first record to determine the header
                    for (var j in data[0]) {
                        var content = data[0][j];
                        if (('' + content).indexOf("[object") < 0) {
                            header.push(j);
                            var value = '"' + j.replace('"', "'") + '"';
                            if (csv.length > 0) csv += ',';
                            csv += value;
                        }
                    }
                    csv += '\n'
                    for (var i in data) {
                        var rowLength = 0;
                        for (var j in header) {
                            var value = data[i][header[j]];
                            if (value === undefined) value = '';
                            var value = '"' + ('' + value).replace('"', "'") + '"';
                            if (rowLength > 0) csv += ',';
                            rowLength++;
                            csv += value;
                        }
                        csv += '\n'
                    }
                    LayoutService.openModal('csv', {
                        title: name,
                        csv: csv,
                        columnOrder: [],
                        info: name + ' csv',
                        filename: name.replace(' ', '') + '.csv',
                        display: {size: 'full'}
                    }, true)
                };

                $scope.list = function (item) {
                    if (item.endemic !== undefined){
                        BiocacheService.speciesListEndemic(item.query, item.extraQ, {}).then(function (data) {
                            LayoutService.openModal('csv', {
                                title: item.name,
                                csv: data,
                                columnOrder: [],
                                info: item.name + ' csv',
                                filename: item.name.replace(' ', '') + '.csv',
                                display: {size: 'full'}
                            }, true)
                        })
                    } else {
                        BiocacheService.speciesList(item.query, item.extraQ, {}).then(function (data) {
                            LayoutService.openModal('csv', {
                                title: item.name,
                                csv: data,
                                columnOrder: [],
                                info: item.name + ' csv',
                                filename: item.name.replace(' ', '') + '.csv',
                                display: {size: 'full'}
                            }, true)
                        })
                    }
                };

                $scope.map = function (event, item) {
                    event.currentTarget.classList.add('disabled');
                    if (item.extraQ === undefined) item.extraQ = [];
                    var q = {q: areaQ.q, ws: areaQ.ws, bs: areaQ.bs, wkt: areaQ.wkt, name: item.name};
                    EventService.facetNewLayer(areaQ, item.extraQ)
                };

                $scope.sample = function (item) {
                    if (item.extraQ === undefined) item.extraQ = [];
                    var query = {q: areaQ.q.concat(item.extraQ), ws: areaQ.ws, bs: areaQ.bs, wkt: areaQ.wkt};
                    var area = {area: [$scope.area]};
                    var data = {
                        overrideValues: {
                            ToolExportSampleService: {
                                input: {
                                    species: {constraints: {'defaultValue': query, disable: true}},
                                    area: {constraints: {'defaultValue': area, disable: true}}
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

                    $('.modal-dialog').draggable({
                        handle: ".modal-header"
                    });

                    $('.modal-content').resizable({
                        minHeight: 180,
                        minWidth: 350
                    });

                    $('.modal-content').on("resize", function () {
                        $('.modal-body').height($('.modal-dialog').height() - $('.modal-header').outerHeight() - $('.modal-footer').outerHeight() - ($('.modal-body').outerHeight() - $('.modal-body').height()))
                    }).trigger('resize');
                };

                // build area query
                var areaQ = jQuery.extend({}, $scope.area);
                areaQ.bs = BiocacheService.newQuery().bs;
                areaQ.ws = BiocacheService.newQuery().ws;
                if (areaQ.q === undefined || areaQ.q.length === 0) {
                    areaQ.q = ["*:*"];
                    if (areaQ.wkt === undefined && areaQ.pid !== undefined) {
                        areaQ.wkt = areaQ.pid
                    }
                } else {
                    areaQ.wkt = undefined;
                }
                $scope.init(areaQ);

                $timeout($scope.makeModeless, 0);
            }])
}(angular));
