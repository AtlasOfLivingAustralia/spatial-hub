(function (angular) {
    'use strict';
    angular.module('phylo-service', [])
        .factory('PhyloService', ['$http', function ($http) {

            return {
                getExpertTrees: function () {
                    var url = $SH.phylolinkUrl + "/phylo/getExpertTrees";
                    return $http.get($SH.proxyUrl + "?url=" + encodeURIComponent(url), {headers: {
                        'Content-Type': 'application/json'
                    }})
                }
            };
        }])
}(angular));