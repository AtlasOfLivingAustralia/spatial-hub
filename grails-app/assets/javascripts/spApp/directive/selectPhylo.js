(function (angular) {
    'use strict';
    angular.module('select-phylo-directive', ['phylo-service'])
        .directive('selectPhylo', ['$http', 'PhyloService', 'LayoutService',
            function ($http, PhyloService, LayoutService) {

                return {
                    templateUrl: '/spApp/selectPhyloCtrl.htm',
                    scope: {
                        _selection: "=selectedPhylo"
                    },
                    link: function (scope, element, attrs) {

                        scope.name = 'selectPhylo';
                        LayoutService.addToSave(scope);

                        scope.trees = [];

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

                        PhyloService.getExpertTrees().then(function (data) {
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
                        })
                    }
                }
            }])
}(angular));

