(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name selectPhylo
     * @description
     *    Table with selectable phylogenetic trees from phylolink
     */
    angular.module('select-phylo-directive', ['phylo-service'])
        .directive('selectPhylo', ['$http', 'PhyloService', 'LayoutService', '$timeout',
            function ($http, PhyloService, LayoutService, $timeout) {

                return {
                    templateUrl: '/spApp/selectPhyloCtrl.htm',
                    scope: {
                        _selection: "=selectedPhylo"
                    },
                    link: function (scope, element, attrs) {

                        scope.name = 'selectPhylo';
                        LayoutService.addToSave(scope);

                        scope.trees = [];
                        scope.loading = true;

                        scope.change = function (tree) {
                            if (tree.checked) {
                                var found = false;
                                for (var k in scope._selection) {
                                    if (scope._selection.hasOwnProperty(k)) {
                                        if (scope._selection[k].id === tree.id) {
                                            found = true
                                        }
                                    }
                                }
                                if (!found) scope._selection.push(tree.id)
                            } else {
                                for (k in scope._selection) {
                                    if (scope._selection.hasOwnProperty(k)) {
                                        if (scope._selection[k].id === tree.id) {
                                            scope._selection.splice(k, 1)
                                        }
                                    }
                                }
                            }
                        };

                        scope.clearSelection = function () {
                            for (var i in scope.trees) {
                                scope.trees[i].selected = false
                            }
                            while (scope._selection.length) {
                                scope._selection.pop()
                            }
                        };


                        scope.init = function () {
                            PhyloService.getExpertTrees().then(function (data) {
                                console.log("phylo");
                                console.log(data);
                                for (var k in data.data) {
                                    if (data.data.hasOwnProperty(k)) {
                                        scope.trees.push({
                                            id: data.data[k].studyId,
                                            group: data.data[k].focalClade,
                                            name: data.data[k].studyName,
                                            leaves: data.data[k].numberOfLeaves,
                                            checked: false
                                        })
                                    }
                                }
                                scope.loading = false;
                            },
                            function(error){
                              console.log(error)
                              alert("Aw,Snap! Error: " +error);
                              scope.loading = false;
                            })
                        }

                        $timeout(scope.init, 0);
                    }
                }
            }])
}(angular));

