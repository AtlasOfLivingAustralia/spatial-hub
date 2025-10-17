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

                list: function (q, max, offset, sort, order) {
                    var params = '?';
                    if(q) params += 'q=' + encodeURIComponent(q);
                    if(max) params += '&max=' + max;
                    if(offset) params += '&offset=' + offset;
                    if(sort) params += '&sort=' + sort;
                    if(order) params += '&order=' + order;
                    return $http.get($SH.baseUrl + "/portal/speciesList" + params, _httpDescription('list')).then(function (response) {
                        return response.data;
                    });
                },
                createList: function (name, description, items, makePrivate, listType, listLicence) {

                    var list = {
                        "listName": name,
                        "listItems": items,
                        "description": description,
                        "isPrivate": makePrivate,
                        "listType": listType,
                        "listLicence": listLicence
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
                    if (scope.getItemsQCached(listId)) {
                        return scope.getListFq(listId);
                    } else {
                        return scope.items(listId, {includeKVP: true}).then(function (data) {
                            cache.put(listId, data);

                            return scope.getListFq(listId);
                        });
                    }
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
                        terms[0] = "(" + terms[0];
                        terms[terms.length - 1] += ")";
                    }
                    return terms.join(" OR ");
                },
                getListFq: function (listId) {
                    return $http.get($SH.baseUrl + "/portal/speciesListInfo?listId=" + listId, _httpDescription('getListInfo')).then(function (response) {
                        if (response.data.isAuthoritative) {
                            // list is indexed
                            return $q.when('species_list_uid:' + listId)
                        } else if (listId.startsWith("dr")) {
                            // list not indexed, can be very slow (minutes)es)
                            return $q.when('species_list:' + listId)
                        } else {
                            // private list, first 200 names only
                            // getListFq is only called after caching the items
                            var data = scope.getItemsQCached(listId)
                            var items = data.filter(item => item.lsid != null).map(item => "lsid:" + item.lsid);
                            var query = items.join(" OR ");
                            var limit = 200;
                            if (items.length > limit ) {
                                alert("Note: only the first 200 names will be used when when adding species to the map (for user-uploaded and private checklists)");
                                query = items.slice(0,limit).join(" OR ");
                            }
                            return $q.when(query);
                        }
                    }).catch(function () {
                        // fetching list info failed, use this fallback
                        return $q.when('species_list:' + listId);
                    });
                },
            };

            return scope;
        }])
}(angular));
