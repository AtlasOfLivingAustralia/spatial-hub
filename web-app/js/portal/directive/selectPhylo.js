(function (angular) {
    'use strict';
    angular.module('select-phylo-directive', ['phylo-service'])
        .directive('selectPhylo', ['$http', 'PhyloService', 'LayoutService',
            function ($http, PhyloService, LayoutService) {

                return {
                    templateUrl: 'portal/' + 'selectPhyloCtrl.html',
                    scope: {
                        selection: "=selectedPhylo",
                    },
                    link: function (scope, element, attrs) {

                        scope.name = 'selectPhylo'
                        LayoutService.addToSave(scope)

                        scope.trees = []

                        scope.change = function (tree) {
                            if (tree.checked) {
                                var found = false
                                for (var k in scope.trees) {
                                    if (scope.trees[k].id == tree.id) {
                                        found = true
                                    }
                                }
                                if (!found) scope.selection.push(tree.id)
                            } else {
                                for (var k in scope.trees) {
                                    if (scope.trees[k].id == tree.id) {
                                        scope.selection.splice(k, 1)
                                    }
                                }
                            }
                        }

                        scope.clearSelection = function () {
                            for (var i in scope.trees) {
                                scope.trees[i].selected = false
                            }
                            while (scope.selection.length) {
                                scope.selection.pop()
                            }
                        }

                        PhyloService.getExpertTrees().then(function (data) {
                            for (var k in data.data) {
                                scope.trees.push({
                                    id: data.data[k].studyId,
                                    group: data.data[k].focalClade,
                                    name: data.data[k].studyName,
                                    leaves: data.data[k].numberOfLeaves,
                                    checked: false
                                })
                            }
                        })
                    }
                }
            }])
}(angular));

