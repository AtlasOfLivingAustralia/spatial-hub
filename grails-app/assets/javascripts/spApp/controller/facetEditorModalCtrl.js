(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc controller
     * @name FacetEditorModalCtrl
     * @description
     *   Display facet classes (list and chart view) on a modal dialog
     */
    angular.module('facet-editor-modal-ctrl', [])
        .controller('FacetEditorModalCtrl', ['LayoutService', '$scope', '$timeout', 'data',
            function (LayoutService, $scope, $timeout, data) {
                var originalFacet = data.facet,
                    originalSettings = data.settings,
                    defaultTableStyle = 'table';
                $scope.facet = $scope.settings = undefined;
                $scope.$i18n = $i18n;
                $scope.selectedLayer = false;

                LayoutService.addToModeless($scope);

                if (originalFacet) {
                    $scope.facet = {};
                    angular.copy(originalFacet, $scope.facet);
                }

                if (originalSettings) {
                    $scope.settings = {};
                    angular.copy(originalSettings, $scope.settings);
                }

                function init() {
                    $scope.settings.tableStyle = defaultTableStyle;
                    hideLegendPanel()
                }

                function hideLegendPanel() {
                    if (LayoutService.showLegend[0] !== false) {
                        $scope.selectedLayer = LayoutService.showLegend[0]
                    }
                    // hide legend panel so that facet classes show only on modal
                    LayoutService.showLegend[0] = false;
                }

                function showLegendPanel() {
                    // show legend panel if options panel is not visible
                    if (!LayoutService.showOptions[0] && LayoutService.showLegend[0] == false) {
                        LayoutService.showLegend[0] = $scope.selectedLayer;
                    }
                }


                function synchronize() {
                    for (var index = 0; index < $scope.facet.data.length; index++) {
                        originalFacet.data[index].selected = $scope.facet.data[index].selected;
                    }

                    originalSettings.slider = $scope.settings.slider;
                    originalFacet.sortType = $scope.facet.sortType;
                    originalFacet.sortReverse = $scope.facet.sortReverse;
                    originalFacet.filter = $scope.facet.filter;
                    originalFacet.isAllFacetsSelected = $scope.facet.isAllFacetsSelected;
                }

                $scope.close = function () {
                    $scope.setModalStatus(false);
                    showLegendPanel();
                    $scope.updateSelection();
                    $scope.$close();
                };

                $scope.updateSelection = function () {
                    synchronize();
                    data.onUpdate && data.onUpdate();
                };

                $scope.setModalStatus = function (flag) {
                    originalSettings.showFacetOnModal = !!flag;
                };

                $scope.makeModeless = function () {
                    $('.modal').addClass('modeless');

                    $('.modal-dialog').draggable({
                        handle: ".modal-header"
                    });

                    $('.modal-content').resizable({
                        minHeight: 180,
                        minWidth: 350
                    });

                    $('.modal-content').on("resize", function () {
                        $('.modal-body').height($('.modal-dialog').height() - $('.modal-header').outerHeight() - $('.modal-footer').outerHeight() - ($('.modal-body').outerHeight() - $('.modal-body').height()))
                    }).trigger('resize');
                };

                init();
                $timeout($scope.makeModeless, 0);
            }
        ])
}(angular));
