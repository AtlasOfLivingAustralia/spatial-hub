(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name selectSpecies
     * @description
     *    Species autocomplete
     */
    angular.module('species-auto-complete-directive', ['species-auto-complete-service'])
        .directive('speciesAutoComplete', ['$timeout', 'SpeciesAutoCompleteService', 'LayoutService',
            function ($timeout, SpeciesAutoCompleteService, LayoutService) {
                return {
                    scope: {
                        _custom: '&onCustom'
                    },
                    link: function (scope, iElement, iAttrs) {
                        scope.savedData = [undefined];
                        LayoutService.addToSave(scope);

                        var a = iElement.autocomplete({
                            source: function (searchTerm, response) {
                                SpeciesAutoCompleteService.search(searchTerm.term, iElement).then(function (data) {
                                    response($.map(data.searchResults.results, function (item, idx) {
                                        var distributions = item.distributionsCount > 0 ? ' +' + item.distributionsCount + ' ' + $i18n(393, "expert distribution(s)") : '';
                                        var checklists = item.checklistsCount > 0 ? ' +' + item.checklistsCount + ' ' + $i18n(394, "checklist(s)") : '';
                                        var tracks = item.tracksCount > 0 ? ' +' + item.tracksCount + ' ' + $i18n(395, "track(s)") : '';

                                        return {
                                            label: item.name,
                                            info: item.rank + (item.commonNameSingle ? ' ' + item.commonNameSingle : ' ') +
                                            ' - ' + item.occCount + ' ' + $i18n(396, "found") + distributions + checklists + tracks,
                                            value: item
                                        }
                                    }))
                                });
                            },

                            select: function (event, ui) {
                                scope.savedData[0] = ui.item;

                                scope._custom()({
                                    q: ["lsid:" + ui.item.value.guid], name: ui.item.value.name,
                                    bs: $SH.biocacheServiceUrl, ws: $SH.biocacheUrl
                                });
                                scope.label = ui.item.label;

                                $timeout(function () {
                                    iElement.val(scope.label);
                                }, 0)
                            }
                        });

                        a.data('ui-autocomplete')._renderItem = function (ul, item) {
                            var html = "<li class='autocomplete-item' >" + item.label + "<br><i>" + item.info + "</i></li>";
                            return $("<li>")
                                .append($("<a>").append(html))
                                .appendTo(ul);
                        };

                        if (scope.savedData[0] !== undefined) {
                            scope.label = scope.savedData[0].label;

                            $timeout(function () {
                                iElement.val(scope.label);
                            }, 0)
                        }


                    }
                };

            }])
}(angular));
