(function (angular) {
    'use strict';
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
                                    var distributions = item.distributionCount > 0 ? '+' + item.distributionCount + ' expert distributions' : '';
                                    var checklists = item.checklistCount > 0 ? '+' + item.checklistCount + ' checklists' : '';
                                    return {
                                        label: item.name,
                                        info: item.rank + (item.commonNameSingle ? ' ' + item.commonNameSingle : ' ') +
                                        ' - ' + item.occCount + ' found' + distributions + checklists,
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
