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
        .directive('speciesAutoComplete', ['$timeout', 'SpeciesAutoCompleteService', function ($timeout, SpeciesAutoCompleteService) {
            return {
                scope: {
                    _custom: '&onCustom'
                },
                link: function (scope, iElement, iAttrs) {
                    var a = iElement.autocomplete({
                        source: function (searchTerm, response) {
                            SpeciesAutoCompleteService.search(searchTerm.term, iElement).then(function (data) {
                                response($.map(data.searchResults.results, function (item, idx) {
                                    var distributions = item.distributionsCount > 0 ? '+' + item.distributionsCount + ' ' + $i18n('expert distribution(s)') : '';
                                    var checklists = item.checklistsCount > 0 ? '+' + item.checklistsCount + ' ' + $i18n('checklist(s)') : '';
                                    var tracks = item.tracksCount > 0 ? '+' + item.tracksCount + ' ' + $i18n('track(s)') : '';
                                    return {
                                        label: item.name,
                                        info: item.rank + (item.commonNameSingle ? ' ' + item.commonNameSingle : ' ') +
                                        ' - ' + item.occCount + ' ' + $i18n('found') + distributions + checklists + tracks,
                                        value: item
                                    }
                                }))
                            });
                        },

                        select: function (event, ui) {
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
                        var html = "<div class='autocomplete-item'>" + item.label + "<br><i>" + item.info + "</i></div>";
                        return $("<li>")
                            .append($("<a>").append(html))
                            .appendTo(ul);
                    };
                }
            };

        }])
}(angular));
