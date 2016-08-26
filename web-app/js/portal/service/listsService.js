(function (angular) {
    'use strict';
    angular.module('lists-service', [])
        .factory("ListsService", ["$http", function ($http) {
            return {
                list: function (q, max, offset, sort, order, user) {
                    var params = '';
//                        if(q) params += '&q=' + encodeURIComponent(q);
//                        if(max) params += '&max=' + max;
//                        if(offset) params += '&offset=' + offset;
//                        if(sort) params += '&sort=' + sort;
//                        if(order) params += '&order=' + order;
//                        if(user) params += '&user=' + user;
                    params += "&max=2000"
                    return $http.get(this.url() + "/ws/speciesList?" + params, {withCredentials: true}).then(function (response) {
                        return response.data.lists;
                    });
                },
                items: function (listId) {
                    return $http.get(this.url() + "/ws/speciesListItems/" + listId, {withCredentials: true}).then(function (response) {
                        return response.data
                    })
                },
                url: function () {
                    return SpatialPortalConfig.listsUrl
                }
            };
        }])
}(angular));