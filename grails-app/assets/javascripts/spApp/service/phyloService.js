(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc service
     * @name PhyloService
     * @description
     *   Access to phylolink services
     */
    angular.module('phylo-service', [])
        .factory('PhyloService', ['$http', function ($http) {

            return {
                /**
                 * Get phylolink tree list
                 *
                 * @memberof PhyloService
                 * @returns {List} list of public expert trees
                 *
                 * @example:
                 * Output:
                 *  [{
                        "studyId": 92,
                        "focalClade": "Acacia",
                        "treeFormat": "newick",
                        "studyName": "Miller, J. T., Murphy, D. J., Brown, G. K., Richardson, D. M. and González-Orozco, C. E. (2011), The evolution and phylogenetic placement of invasive Australian Acacia species. Diversity and Distributions, 17: 848–860. doi: 10.1111/j.1472-4642.2011.00780.x",
                        "year": 2011,
                        "authors": "Acacia – Miller et al 2012",
                        "doi": "http://onlinelibrary.wiley.com/doi/10.1111/j.1472-4642.2011.00780.x/full",
                        "numberOfLeaves": 510,
                        "numberOfInternalNodes": 509,
                        "treeId": null,
                        "notes": null,
                        "treeViewUrl": "http://phylolink.ala.org.au/phylo/getTree?studyId=92&treeId=null"
                        }]
                 */
                getExpertTrees: function () {
                    //TODO: add parameter to exclude "tree"
                    var url = $SH.phylolinkUrl + "/phylo/getExpertTrees?noTreeText=true";
                    return $http.get(url, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                }
            };
        }])
}(angular));