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
        .factory("FacetAutoCompleteService", ["$http", "BiocacheService", function ($http, BiocacheService) {
            return {
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

                                return expanded
                            });
                        });
                    })
                }
            };
        }])
}(angular));