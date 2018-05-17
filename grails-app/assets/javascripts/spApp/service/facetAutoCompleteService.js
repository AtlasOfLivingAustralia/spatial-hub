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
        .factory("FacetAutoCompleteService", ["$http", "BiocacheService", "ListsService", function ($http, BiocacheService, ListsService) {
            var scope = {
                /**
                 * List default facets and data resource specific facets for a biocache-service query
                 * @memberof FacetAutoCompleteService
                 * @param {Query} query Optional query or single fq term (e.g. single fq term is used to fetch
                 * dynamic facets for a data resource)
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
                 *
                 * TODO: add option to return /index/fields instead of search/grouped/facets
                 */
                search: function (query) {
                    return BiocacheService.registerQuery(query).then(function (response) {
                        return $http.get(query.bs + "/upload/dynamicFacets?q=" + response.qid).then(function (dynamic) {
                            return $http.get(query.bs + "/search/grouped/facets").then(function (groups) {
                                return scope.getFacets(dynamic, groups, query.species_list);
                            });
                        });
                    })
                },

                getFacets: function (dynamic, groups, species_list) {
                    var list = groups.data;
                    var i;
                    if (dynamic.length > 0) {
                        var dynamicList = [];
                        for (i = 0; i < dynamic.length; i++) {
                            dynamicList.add({
                                sort: 'index',
                                description: dynamic[i],
                                field: dynamic[i]
                            })
                        }
                        list.unshift({
                            title: $i18n("Other"),
                            facets: dynamicList
                        })
                    }

                    var expanded = [];
                    for (i = 0; i < list.length; i++) {
                        var o = {
                            name: '--- ' + list[i].title + ' ---',
                            separator: true
                        };
                        expanded.push(o);
                        for (var j = 0; j < list[i].facets.length; j++) {
                            var name = Messages.get('facet.' + list[i].facets[j].field, list[i].facets[j].field);
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

                    if (species_list) {
                        var data = ListsService.getItemsQCached(species_list);
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

                    return expanded
                }
            };

            return scope;
        }])
}(angular));