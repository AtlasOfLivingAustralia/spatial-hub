(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name FacetAutoCompleteService
     * @description
     *   List of available facets for a biocache-service occurrences layer
     */
    angular.module('facet-auto-complete-service', [])
        .factory("FacetAutoCompleteService", ["$http", '$q', "BiocacheService", "ListsService",
            function ($http, $q, BiocacheService, ListsService) {
            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'FacetAutoCompleteService';
                httpconfig.method = method;

                return httpconfig;
            };

            var scope = {
                /**
                 * List default facets and data resource specific facets for a biocache-service query
                 * @memberof FacetAutoCompleteService
                 * @param {Query} query Optional query or single fq term (e.g. single fq term is used to fetch
                 * dynamic facets for a data resource)
                 * @allFacets true to use /index/fields instead of /search/grouped/facets
                 * @returns {Promise(List)} facet list
                 *
                 * @example
                 * Output:
                 *  [{
                 *      "title": "Taxon",
                 *      "facets": [{
                 *          "field": "taxon_name",
                 *          "sort": "index",
                 *          "description": "Matched Scientific Name",
                 *          "dwcTerm": "scientificName"
                 *          },
                 *          {
                 *          "field": "raw_taxon_name",
                 *          "sort": "index",
                 *          "description": "Scientific Name",
                 *          "dwcTerm": "scientificName_raw"
                 *          }]
                 *      }]
                 */
                search: function (query, allFacets) {
                    return BiocacheService.registerQuery(query).then(function (response) {
                        if (response == null) {
                            return $q.when([])
                        }
                        return $http.get(query.bs + "/upload/dynamicFacets?q=" + response.qid, _httpDescription('search')).then(function (dynamic) {
                            if (allFacets) {
                                return BiocacheService.getIndexFields().then(function (data) {
                                    var list = []
                                    var i;

                                    data.sort(function (a, b) {
                                        var sort1 = a.classs.localeCompare(b.classs);
                                        if (sort1 == 0) {
                                            return a.displayName.localeCompare(b.displayName)
                                        } else {
                                            return sort1
                                        }
                                    })

                                    return scope.getAllFacets(dynamic, data, query.species_list);
                                });
                            } else {
                                if ($SH.groupedFacets) {
                                    return scope.getGroupedFacets(dynamic, {data: $SH.groupedFacets}, query.species_list)
                                } else {
                                    return $http.get(query.bs + "/search/grouped/facets", _httpDescription('search')).then(function (groups) {
                                        return scope.getGroupedFacets(dynamic, groups, query.species_list);
                                    });
                                }
                            }
                        });
                    })
                },

                getGroupedFacets: function (dynamic, groups, species_list) {
                    var list = groups.data;
                    var i;
                    if (dynamic.data.length > 0) {
                        var dynamicList = [];
                        for (i = 0; i < dynamic.data.length; i++) {
                            if (!dynamic.data[i].name.endsWith("_RNG")) {
                                dynamicList.push({
                                    sort: 'index',
                                    description: dynamic.data[i].displayName,
                                    field: dynamic.data[i].name
                                })
                            }
                        }
                        list.unshift({
                            title: $i18n("Other"),
                            facets: dynamicList
                        })
                    }

                    var custom_facets = {};
                    $.map($SH.custom_facets, function (v, k) {
                        custom_facets[k] = $.merge([], v)
                    })

                    var expanded = [];
                    for (i = 0; i < list.length; i++) {
                        var o = {
                            name: '--- ' + list[i].title + ' ---',
                            separator: true
                        };
                        expanded.push(o);
                        for (var j = 0; j < list[i].facets.length; j++) {
                            if ($SH.default_facets_ignored.indexOf(list[i].facets[j].field) == -1) {
                                var name = BiocacheI18n.get('facet.' + list[i].facets[j].field, list[i].facets[j].field);
                                if (name === list[i].facets[j].field && list[i].facets[j].description) {
                                    name = list[i].facets[j].description;
                                }
                                expanded.push({
                                    name: name,
                                    separator: false,
                                    facet: list[i].facets[j].field
                                })
                            }
                        }

                        // insert custom facets
                        var custom = custom_facets[list[i].title];
                        if (custom) {
                            for (var j = 0; j < custom.length; j++) {
                                var nameField = custom[j].split(';');
                                if (nameField.length == 1) nameField.push(nameField[0]);
                                var name = BiocacheI18n.get('facet.' + nameField[1], nameField[0]);
                                expanded.push({
                                    name: name,
                                    separator: false,
                                    facet: nameField[1]
                                })
                            }
                        }
                        custom_facets[list[i].title] = undefined;
                    }

                    // add remaining custom facets
                    for (var key in custom_facets) {
                        var custom = custom_facets[key];
                        if (custom) {
                            expanded.push({
                                name: '--- ' + key + ' ---',
                                separator: true
                            });
                            for (j = 0; j < custom.length; j++) {
                                var nameField = custom[j].split(';');
                                if (nameField.length == 1) nameField.push(nameField[0]);
                                var name = BiocacheI18n.get('facet.' + nameField[1], nameField[0]);
                                expanded.push({
                                    name: name,
                                    separator: false,
                                    facet: nameField[1]
                                })
                            }
                        }
                    }

                    if (species_list && $SH.listsFacets) {
                        var data = ListsService.getItemsQCached(species_list);
                        if (data === undefined) {
                            return ListsService.getItemsQ(species_list).then(function () {
                                // species list info is now cached, retry this function
                                return scope.getGroupedFacets(dynamic, groups, species_list)
                            })
                        } else {
                            if (data.length > 0 && data[0].kvpValues && data[0].kvpValues.length > 0) {
                                expanded.push({
                                    name: "--- species list traits ---",
                                    separator: true
                                });

                                // convert kvp to usable map
                                var map = {};
                                for (var k in data) {
                                    var kvp = data[k].kvpValues;
                                    for (var i in kvp) {
                                        if (kvp[i].key) {
                                            if (!map[kvp[i].key]) {
                                                map[kvp[i].key] = {values: {}};
                                            }
                                            if (!map[kvp[i].key].values[kvp[i].value]) {
                                                map[kvp[i].key].values[kvp[i].value] = {listOfSpecies: []};
                                            }
                                            map[kvp[i].key].values[kvp[i].value].listOfSpecies.push(data[k])
                                        }
                                    }
                                }

                                // convert list of species to fq and push to 'expanded'
                                for (var k in map) {
                                    for (var i in map[k].values) {
                                        map[k].values[i].fq = ListsService.listToFq(map[k].values[i].listOfSpecies);
                                    }
                                    expanded.push({
                                        name: k,
                                        separator: false,
                                        facet: 'species_list' + k,
                                        species_list_facet: map[k].values
                                    })
                                }
                            }
                        }
                    }

                    return $q.when(expanded);
                },

                getAllFacets: function (dynamic, list, species_list) {
                    var i, name, properties, property, ranges, rangeString, min, max;

                    var expanded = [];
                    for (i = 0; i < list.length; i++) {
                        if ($SH.default_facets_ignored.indexOf(list[i].name) == -1) {
                            var label = BiocacheI18n.get('facet.' + list[i].name, list[i].name);
                            if (label === list[i].name && list[i].description) {
                                label = list[i].description;
                            }
                            expanded.push({
                                displayName: label,
                                class: list[i].classs,
                                dataType: list[i].dataType,
                                description: list[i].description,
                                info: list[i].info,
                                url: list[i].url,
                                facet: list[i].name
                            })
                        }
                    }

                    if (dynamic.data.length > 0) {
                        for (i = 0; i < dynamic.data.length; i++) {
                            if (!dynamic.data[i].name.endsWith("_RNG")) {
                                expanded.push({
                                    displayName: dynamic.data[i].displayName,
                                    class: "Other",
                                    facet: dynamic.data[i].name,
                                    description: '',
                                    info: ''
                                })
                            }
                        }
                    }

                    if (species_list && $SH.listsFacets) {
                        var data = ListsService.getItemsQCached(species_list);
                        if (data === undefined) {
                            return ListsService.getItemsQ(species_list).then(function () {
                                // species list info is now cached, retry this function
                                scope.getAllFacets(dynamic, list, species_list)
                            })
                        } else {
                            if (data.length > 0 && data[0].kvpValues && data[0].kvpValues.length > 0) {
                                properties = {};
                                // convert kvp to usable map
                                var map = {};
                                for (var k in data) {
                                    var kvp = data[k].kvpValues;
                                    for (var i in kvp) {
                                        if (kvp[i].key) {
                                            if (!map[kvp[i].key]) {
                                                map[kvp[i].key] = {values: {}};
                                            }
                                            if (!map[kvp[i].key].values[kvp[i].value]) {
                                                map[kvp[i].key].values[kvp[i].value] = {listOfSpecies: []};
                                            }
                                            map[kvp[i].key].values[kvp[i].value].listOfSpecies.push(data[k]);
                                            if (!properties[kvp[i].key]) {
                                                property = Util.inferDataTypeFromValue(kvp[i].value);
                                                kvp[i].value = Util.castValue(kvp[i].value, property);
                                                properties[kvp[i].key] = property = {dataType: property, min:kvp[i].value, max: kvp[i].value};
                                            }

                                            kvp[i].value = Util.castValue(kvp[i].value, properties[kvp[i].key].dataType);
                                            if (Util.isFacetOfRangeDataType(properties[kvp[i].key].dataType)) {
                                                if (properties[kvp[i].key].min > kvp[i].value)
                                                    properties[kvp[i].key].min = kvp[i].value;
                                                if (properties[kvp[i].key].max < kvp[i].value)
                                                    properties[kvp[i].key].max = kvp[i].value;
                                            }
                                        }
                                    }
                                }

                                for( var propertyName in properties){
                                    property = properties[propertyName];
                                    if (Util.isFacetOfRangeDataType(property.dataType)) {
                                        ranges = Util.getRanges(property.dataType, property.min, property.max);
                                        var values = map[propertyName].values, value,
                                            groupedValues = {}, rangeCounter =0, individualCounter = 0;
                                        for(var propertyValue in values) {
                                            value = Util.castValue(propertyValue, property.dataType);
                                            individualCounter += values[propertyValue].listOfSpecies.length;
                                            for (var j in ranges) {
                                                min = ranges[j][0];
                                                max = ranges[j][1];
                                                rangeString = min + " TO " + max;
                                                if (!groupedValues[rangeString]){
                                                    groupedValues[rangeString] = {listOfSpecies: [], max: max, min: min, isRangeDataType: true};
                                                }

                                                if (min <= value && max >= value) {
                                                    rangeCounter += values[propertyValue].listOfSpecies.length;
                                                    groupedValues[rangeString].listOfSpecies.push.apply(groupedValues[rangeString].listOfSpecies, values[propertyValue].listOfSpecies);
                                                    values[propertyValue] = undefined;
                                                    break;
                                                }
                                            }
                                        }

                                        map[propertyName].values = groupedValues;
                                    }
                                }

                                // convert list of species to fq and push to 'expanded'
                                for (var k in map) {
                                    for (var i in map[k].values) {
                                        map[k].values[i].fq = ListsService.listToFq(map[k].values[i].listOfSpecies);
                                    }
                                    expanded.push({
                                        displayName: k,
                                        facet: 'species_list' + k,
                                        species_list_facet: map[k].values,
                                        dataType: properties[k].dataType,
                                        class: 'Traits',
                                        description: '',
                                        info: ''
                                    })
                                }
                            }
                        }
                    }

                    return $q.when(expanded);
                }
            };

            return scope;
        }])
}(angular));
