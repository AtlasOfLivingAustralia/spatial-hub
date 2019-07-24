(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name selectSpecies
     * @description
     *    Species autocomplete
     */
    angular.module('doi-auto-complete-directive', ['doi-service'])
        .directive('doiAutoComplete', ['$timeout', 'DoiService', 'LayoutService',
            function ($timeout, DoiService, LayoutService) {
                return {
                    scope: {
                        _doiSelected: '&onSelect'
                    },
                    link: function (scope, iElement, iAttrs) {

                        var loadingClass = 'species-spinner';
                        scope.savedData = [undefined];
                        LayoutService.addToSave(scope);
                        var mostRecentSearchTerm = '';

                        var a = iElement.autocomplete({
                            source: function (searchTerm, response) {
                                iElement.addClass(loadingClass);
                                mostRecentSearchTerm = searchTerm;

                                // Add a wildcard to the search to make it more intuitive for an as you type autocomplete
                                searchTerm.term+="*";
                                DoiService.search(searchTerm.term).then(function (data) {
                                    // Once the search finishes, clear the loading indicator if this is the most
                                    // recent search.
                                    if (searchTerm == mostRecentSearchTerm) {
                                        iElement.removeClass(loadingClass);
                                    }
                                    response($.map(data.searchResults, function (item, idx) {
                                        return {
                                            label: item.title,
                                            info: DoiService.buildInfoString(item),
                                            value: item
                                        }
                                    }));
                                },
                                function() {
                                    // Once the search finishes, clear the loading indicator if this is the most
                                    // recent search.
                                    if (searchTerm == mostRecentSearchTerm) {
                                        iElement.removeClass(loadingClass);
                                    }
                                });
                            },

                            select: function (event, ui) {

                                scope.savedData[0] = ui.item;

                                scope.label = ui.item.label;

                                $timeout(function () {
                                    iElement.val(scope.label);
                                }, 0);

                                scope._doiSelected()(ui.item.value);

                            },
                            focus: function(event, ui) {
                                event.preventDefault();
                                iElement.val(ui.item.label);
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
                            }, 0);
                        }
                    }
                };

            }])
}(angular));
