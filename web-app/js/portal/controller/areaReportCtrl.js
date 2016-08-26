(function (angular) {
    'use strict';
    angular.module('area-report-ctrl', ['map-service', 'biocache-service', 'lists-service', 'layers-service'])
        .controller('AreaReportCtrl', ['$scope', 'MapService', '$timeout', '$rootScope', '$uibModalInstance',
            'BiocacheService', 'data', '$http', 'ListsService', 'LayersService',
            function ($scope, MapService, $timeout, $rootScope, $uibModalInstance, BiocacheService, data, $http, ListsService, LayersService) {
                $scope.area = data

                $scope.openExpertDistribution = ''
                $scope.openJournalMapDocuments = ''
                $scope.journalMapDocumentCount = function () {
                }


                $scope.distributions = []
                $scope.setDistributionCount = function (data) {
                    $scope.distributions = data
                    for (var k in $scope.items) {
                        if ('Expert distributions' == $scope.items[k].name) {
                            $scope.items[k].value = data.length
                        }
                    }
                }
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
                }

                $scope.checklists = []
                $scope.setChecklistCount = function (data) {
                    $scope.checklists = data
                    var areas = {}
                    for (var k in data) {
                        areas[data[k].area_name] = data[k]
                    }
                    var areaCount = 0
                    for (var k in areas) {
                        areaCount++
                    }
                    for (var k in $scope.items) {
                        if ('Checklist species distributions' == $scope.items[k].name) {
                            $scope.items[k].value = data.length
                        }
                        if ('Checklist areas' == $scope.items[k].name) {
                            $scope.items[k].value = areaCount
                        }
                    }
                }
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
                }


                $scope.gazPoints = []
                $scope.setGazCount = function (data) {
                    $scope.gazPoints = data
                    for (var k in $scope.items) {
                        if ('Gazetteer Points' == $scope.items[k].name) {
                            $scope.items[k].value = data.length
                        }
                    }
                }
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
                }

                $scope.poi = []
                $scope.setPoi = function (data) {
                    $scope.poi = data
                    for (var k in $scope.items) {
                        if ('Points of interest' == $scope.items[k].name) {
                            $scope.items[k].value = data.length
                        }
                    }
                }
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
                }

                $timeout(function () {
                    $scope.checklistCounts()
                    $scope.distributionCounts()
                    $scope.gazPointCounts()
                    $scope.pointOfInterestCounts()
                }, 0)

                var areaQ = $scope.area
                if (areaQ.q === undefined) {
                    areaQ.q = ["*:*"]
                } else {
                    areaQ.wkt = undefined
                }
                areaQ.bs = BiocacheService.newQuery().bs
                areaQ.ws = BiocacheService.newQuery().ws

                $scope.items = [
                    {
                        name: 'Area (sq km)',
                        link: 'http://www.ala.org.au/spatial-portal-help/note-area-sq-km/',
                        linkName: 'info',
                        value: $scope.area.area_km
                    },
                    {
                        name: 'Number of species',
                        query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt},
                        map: false
                    },
                    {
                        name: 'Number of species - spatially valid only',
                        query: {q: areaQ.q.concat(["geospatial_kosher:true"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt},
                        map: false
                    },
                    {
                        name: 'Occurrences',
                        query: {q: areaQ.q, bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt},
                        occurrences: true
                    },
                    {
                        name: 'Occurrences - spatially valid only',
                        query: {q: areaQ.q.concat(["geospatial_kosher:true"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt},
                        occurrences: true
                    },
                    {
                        name: 'Expert distributions',
                        list: $scope.openExpertDistribution,
                        value: 'counting...'
                    },
                    {
                        name: 'Checklist areas',
                        value: 'counting...'
                    },
                    {
                        name: 'Checklist species distributions',
                        list: $scope.openChecklists,
                        value: 'counting...'
                    },
                    {
                        name: 'Journalmap documents',
                        list: $scope.openJournalMapDocuments,
                        link: 'https://www.journalmap.org',
                        linkName: 'JournalMap',
                        value: 'counting....'
                    },
                    {
                        name: 'Gazetteer Points',
                        mapGaz: true,
                        value: 'counting...'
                    },
                    {
                        name: 'Points of interest',
                        value: 'counting...'
                    },
                    {
                        name: 'Invasive Species',
                        query: {q: areaQ.q.concat(["species_list_uid:dr947 OR species_list_uid:dr707 OR species_list_uid:dr945 OR species_list_uid:dr873 OR species_list_uid:dr872 OR species_list_uid:dr1105 OR species_list_uid:dr1787 OR species_list_uid:dr943 OR species_list_uid:dr877 OR species_list_uid:dr878 OR species_list_uid:dr1013 OR species_list_uid:dr879 OR species_list_uid:dr880 OR species_list_uid:dr881 OR species_list_uid:dr882 OR species_list_uid:dr883 OR species_list_uid:dr927 OR species_list_uid:dr823"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Threatened Species',
                        query: {q: areaQ.q.concat(["species_list_uid:dr1782 OR species_list_uid:dr967 OR species_list_uid:dr656 OR species_list_uid:dr649 OR species_list_uid:dr650 OR species_list_uid:dr651 OR species_list_uid:dr492 OR species_list_uid:dr1770 OR species_list_uid:dr493 OR species_list_uid:dr653 OR species_list_uid:dr884 OR species_list_uid:dr654 OR species_list_uid:dr655 OR species_list_uid:dr490 OR species_list_uid:dr2201"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Migratory species - EPBC',
                        query: {q: areaQ.q.concat(["species_list_uid:dr1005"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt},
                        link: ListsService.url() + '/speciesListItem/list/dr1005',
                        linkName: 'Full list'
                    },
                    {
                        name: 'Australian iconic species',
                        query: {q: areaQ.q.concat(["species_list_uid:dr781"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt},
                        link: ListsService.url() + '/speciesListItem/list/dr781',
                        linkName: 'Full list'
                    },
                    {
                        name: 'Algae',
                        query: {q: areaQ.q.concat(["species_group:Algae"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Amphibians',
                        query: {q: areaQ.q.concat(["species_group:Amphibians"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Angiosperms',
                        query: {q: areaQ.q.concat(["species_group:Angiosperms"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Animals',
                        query: {q: areaQ.q.concat(["species_group:Animals"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Arthropods',
                        query: {q: areaQ.q.concat(["species_group:Arthropods"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Bacteria',
                        query: {q: areaQ.q.concat(["species_group:Bacteria"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Birds',
                        query: {q: areaQ.q.concat(["species_group:Birds"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Bryophytes',
                        query: {q: areaQ.q.concat(["species_group:Bryophytes"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Chromista',
                        query: {q: areaQ.q.concat(["species_group:Chromista"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Crustaceans',
                        query: {q: areaQ.q.concat(["species_group:Crustaceans"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Dicots',
                        query: {q: areaQ.q.concat(["species_group:Dicots"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'FernsAndAllies',
                        query: {q: areaQ.q.concat(["species_group:FernsAndAllies"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Fish',
                        query: {q: areaQ.q.concat(["species_group:Fish"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Fungi',
                        query: {q: areaQ.q.concat(["species_group:Fungi"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Fish',
                        query: {q: areaQ.q.concat(["species_group:Fish"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Gymnosperms',
                        query: {q: areaQ.q.concat(["species_group:Gymnosperms"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Insects',
                        query: {q: areaQ.q.concat(["species_group:Insects"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Mammals',
                        query: {q: areaQ.q.concat(["species_group:Mammals"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Molluscs',
                        query: {q: areaQ.q.concat(["species_group:Molluscs"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Monocots',
                        query: {q: areaQ.q.concat(["species_group:Monocots"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Plants',
                        query: {q: areaQ.q.concat(["species_group:Plants"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt}
                    },
                    {
                        name: 'Protozoa',
                        query: {q: areaQ.q.concat(["species_group:Protozoa"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt},
                    },
                    {
                        name: 'Reptiles',
                        query: {q: areaQ.q.concat(["species_group:Reptiles"]), bs: areaQ.bs, ws: areaQ.ws, wkt: areaQ.wkt},
                    }
                ]

                $scope.count = function (item, promise) {
                    promise.then(function (data) {
                        item.value = data
                    })
                }

                var items = $scope.items
                var k
                for (k in items) {
                    if (items[k].query !== undefined) {
                        items[k].value = 'counting...'
                        items[k].formattedQ = BiocacheService.getQString(items[k].query)
                        if (items[k].occurrences !== undefined && items[k].occurrences) {
                            $scope.count(items[k], BiocacheService.count(items[k].query))
                        } else {
                            $scope.count(items[k], BiocacheService.speciesCount(items[k].query))
                        }
                    }
                }

                $scope.list = function (item) {

                }

                $scope.map = function (item) {
                    BiocacheService.newLayer(item.query, undefined, item.name).then(function (data) {
                        MapService.add(data)
                    })
                }

                $scope.sample = function (item) {

                }

                $scope.cancel = function (data) {
                    $uibModalInstance.close(data);
                };
            }])
}(angular));
