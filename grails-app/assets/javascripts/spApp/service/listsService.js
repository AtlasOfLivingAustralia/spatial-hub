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

            return {

                list: function (q, max, offset, sort, order, user) {
                    var params = '';
                    if (q) params += "/" + encodeURIComponent(q);
                    //TODO: investigate paging
//                        if(q) params += '&q=' + encodeURIComponent(q);
//                        if(max) params += '&max=' + max;
//                        if(offset) params += '&offset=' + offset;
//                        if(sort) params += '&sort=' + sort;
//                        if(order) params += '&order=' + order;
//                        if(user) params += '&user=' + user;
                    params += "?" + "&max=2000";
                    return $http.get(this.url() + "/ws/speciesList" + params, {withCredentials: true}).then(function (response) {
                        if (response.data.lists) {
                            return response.data.lists;
                        } else {
                            return response.data;
                        }
                    });
                },
                createList: function (name, description, items, makePrivate) {

                    var list = {
                        "listName": name,
                        "listItems": items,
                        "description": description,
                        "isPrivate": makePrivate
                    };
                    return $http.post($SH.baseUrl + "/portal/postSpeciesList", list, {withCredentials: true}).then(function (resp) {
                        $log.debug($i18n("Successfully call in list service") + ": " + resp.status + " " + resp.data.message);
                        return resp;
                    }, function (resp) {
                        $log.debug($i18n("Error in calling list service") + ": " + resp.status + " " + resp.data.error);
                        return resp;
                    });
                },
                items: function (listId, params) {
                    params = params || {};
                    return $http.get(this.url() + "/ws/speciesListItems/" + listId, {params: params, withCredentials: true}).then(function (response) {
                        return response.data
                    })
                },
                getItemsQ: function (listId) {
                    return $q.when('species_list:' + listId);
                },
                url: function () {
                    return $SH.listsUrl
                }
            };
        }])
}(angular));