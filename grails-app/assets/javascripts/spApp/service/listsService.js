(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name ListsService
     * @description
     *   Access to species-lists services
     */
    angular.module('lists-service', [])
        .factory("ListsService", ["$http", '$cacheFactory', '$log', '$q', function ($http, $cacheFactory, $log, $q) {

            var cache = $cacheFactory('listServiceCache');

            var _httpDescription = function (method, httpconfig) {
                if (httpconfig === undefined) {
                    httpconfig = {};
                }
                httpconfig.service = 'ListsService';
                httpconfig.method = method;

                return httpconfig;
            };

            var scope = {

                list: function (q, max, offset, sort, order, user) {
                    var params = '';
                    if (q) params += "/" + encodeURIComponent(q);
                    // The new species-lists has separate graphql query that is more UI friendly. In the meantime,
                    // get everything, or an approximation of everything.
                    params += "?max=20000";
                    if ($SH.userId) {
                        // This is not used in the new species-lists. The purpose was to put lists by the current user at the top of the list.
                        params += "&user=" + $SH.userId
                    }
                    return $http.get($SH.baseUrl + "/portal/speciesList" + params, _httpDescription('list')).then(function (response) {
                        if (response.data.lists) {
                            return response.data.lists;
                        } else {
                            return response.data;
                        }
                    });
                },
                createList: function (name, description, items, makePrivate, listType) {

                    var list = {
                        "listName": name,
                        "listItems": items,
                        "description": description,
                        "isPrivate": makePrivate,
                        "listType": listType
                    };
                    return $http.post($SH.baseUrl + "/portal/postSpeciesList", list, _httpDescription('createList', {withCredentials: true})).then(function (resp) {
                        return resp;
                    }, function (error) {
                        return error;
                    });
                },
                items: function (listId, params) {
                    params = params || {};
                    return $http.get($SH.baseUrl + "/portal/speciesListItems/" + listId, _httpDescription('items', {
                        params: params,
                        withCredentials: true
                    })).then(function (response) {
                        return response.data
                    })
                },
                getItemsQCached: function (listId) {
                    return cache.get(listId);
                },
                getItemsQ: function (listId) {
                    return $q.when('species_list:' + listId);
                },
                url: function () {
                    return $SH.listsUrl
                },
                urlUi: function () {
                    return $SH.listsUrlUi
                },
                listToFq: function (data) {
                    var terms = [];
                    for (var i in data) {
                        var d = data[i];
                        var s;
                        if (d.lsid !== undefined && d.lsid !== null) {
                            s = "lsid:\"" + d.lsid + "\"";
                        } else {
                            s = "taxon_name:\"" + d.name + "\"";
                        }
                        if (terms.length % 200 == 0) {
                            if (terms.length > 0) {
                                terms[terms.length - 1] += ")";
                            }
                            terms.push("(" + s);
                        } else {
                            terms.push(s);
                        }
                    }
                    if (terms.length > 0) {
                        terms[terms.length - 1] += ")";
                    }
                    return terms.join(" OR ");
                }
            };

            return scope;
        }])
}(angular));
