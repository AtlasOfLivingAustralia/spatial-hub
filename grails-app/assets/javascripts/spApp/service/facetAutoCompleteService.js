(function (angular) {
    'use strict';
    angular.module('facet-auto-complete-service', [])
        .factory("FacetAutoCompleteService", ["$http", function ($http) {
            return {
                search: function (q) {
                    return $http.get($SH.biocacheServiceUrl + "/upload/dynamicFacets?q=" + q).then(function (dynamic) {
                        return $http.get($SH.biocacheServiceUrl + "/search/grouped/facets").then(function (groups) {
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