(function (angular) {
    'use strict';
    angular.module('phylo-service', [])
        .factory('PhyloService', ['$http', function ($http) {

            return {
                getExpertTrees: function () {
                    var url = "http://phylolink.ala.org.au" + "/phylo/getExpertTrees"
                    return $http.get(SpatialPortalConfig.proxyUrl + "?url=" + encodeURIComponent(url))
                }
            };
        }])
}(angular));