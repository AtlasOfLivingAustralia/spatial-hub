(function (angular) {
    'use strict';
    /**
     * @memberof spApp
     * @ngdoc directive
     * @name gazAutoComplete
     * @description
     *   Gazetteer autocomplete
     */
    angular.module('gaz-auto-complete-directive', ['gaz-auto-complete-service']).directive('gazAutoComplete',
        ['$timeout', 'GazAutoCompleteService', function ($timeout, GazAutoCompleteService) {
            return {
                scope: {
                    _userobjects: '=',
                    _custom: '&onCustom',
                },
                link: function (scope, iElement, iAttrs) {
                    var a = iElement.autocomplete({
                        source: function (searchTerm, response) {
                            GazAutoCompleteService.search(searchTerm.term).then(function (data) {
                                var fields = new Set(data.map(function(item){return item.fieldname}))
                                var fidx = 0 //bypass possible disturbing chars by using assigned id
                                fields.forEach(function(item){
                                    data.unshift({label: item, fieldIdx: fidx, isField: true});
                                    fidx++;
                                })
                                response(
                                    $.map(data, function (item) {
                                        if (item.isField){
                                            return item;
                                        }else if (item.fid !== $SH.userObjectsField || scope._userobjects) {
                                            return {
                                                label: item.name,
                                                info: item.description ? item.description + " (" + item.fieldname + ")" : "(" + item.fieldname + ")",
                                                fieldIdx: data.find(function(a){return a.isField && a.label == item.fieldname }).fieldIdx,
                                                value: item
                                            }
                                        } else {
                                            return null
                                        }
                                })

                                )
                            });
                        },

                        select: function (event, ui) {
                            //check on filter checkbox
                            //if ($(event.toElement).is('input[name=filterOnFields]') || $(event.toElement).children(":first").is(':input[name=filterOnFields]')){
                            // click on radio button or label or outside label
                            if ($(event.toElement).is('input[name=filterOnFields]') || $(event.toElement).has('input[name=filterOnFields]').length >0 ){
                                event.stopPropagation();
                                event.preventDefault();
                                //Need to set radio button since default action stoped
                                //$(event.currentTarget).find('input[name=filterOnFields]').prop('checked', false);
                                $(event.toElement).find('input[name=filterOnFields]').prop('checked', true);

                                // on UL level
                                $(event.currentTarget).find('li[field]').hide();
                                $(event.currentTarget).find('li[field='+ui.item.fieldIdx+']').show();
                                $(iElement).autocomplete( "focus") //maintain dropdownlist appear
                                return false;

                            }else {
                                scope._custom()(ui.item.value.pid);
                                scope.label = ui.item.label;

                                $timeout(function () {
                                    iElement.val(scope.label);
                                }, 0)
                            }
                        }

                    })

                    a.data("ui-autocomplete")._renderItem = function (ul, item) {
                        if(item.isField){
                            var html = "<li class='autocomplete-item' ><label><input value="+item.fieldIdx+" type='radio' name='filterOnFields'>"+item.label+"</label></li>";
                            return $("<li>")
                                .append($("<a>").append(html))
                                .appendTo(ul);
                        }
                        else{
                            var html = "<li class='autocomplete-item' >" + item.label + "<br><i>" + item.info + "</i></li>";
                            return $("<li field="+item.fieldIdx+">")
                                .append($("<a>").append(html))
                                .appendTo(ul);
                        }

                    };


                }
            };
        }])
}(angular));