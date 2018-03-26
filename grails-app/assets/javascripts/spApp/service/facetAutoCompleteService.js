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
        .factory("FacetAutoCompleteService", ["$http", function ($http) {
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
                    var bs = query.bs;
                    if (bs === undefined) {
                        bs = $SH.biocacheServiceUrl;
                    }
                    var q = query.q;
                    if (q === undefined) {
                        q = query;
                    }
                    return $http.get(bs + "/upload/dynamicFacets?q=" + q).then(function (dynamic) {
                        return $http.get(bs + "/search/grouped/facets").then(function (groups) {
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
                        })
                    });
                }
            };
        }])
}(angular));