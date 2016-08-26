(function (angular) {
    'use strict';
    angular.module('facet-auto-complete-service', [])
        .factory("FacetAutoCompleteService", ["$http", function ($http) {
            return {
                search: function (q) {
                    return $http.get(SpatialPortalConfig.biocacheServiceUrl + "/upload/dynamicFacets?q=" + q).then(function (dynamic) {
                        return $http.get(SpatialPortalConfig.biocacheServiceUrl + "/search/grouped/facets").then(function (groups) {
                            var list = groups.data
                            if (dynamic.length > 0) {
                                var dynamicList = []
                                for (var i = 0; i < dynamic.length; i++) {
                                    dynamicList.add({
                                        sort: 'index',
                                        description: dynamic[i],
                                        field: dynamic[i]
                                    })
                                }
                                list.unshift({
                                    title: "Other",
                                    facets: dynamicList
                                })
                            }

                            var expanded = []
                            for (var i = 0; i < list.length; i++) {
                                var o = {
                                    name: '--- ' + list[i].title + ' ---',
                                    separator: true
                                }
                                expanded.push(o)
                                for (var j = 0; j < list[i].facets.length; j++) {
                                    expanded.push({
                                        name: list[i].facets[j].description ? list[i].facets[j].description : list[i].facets[j].field,
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