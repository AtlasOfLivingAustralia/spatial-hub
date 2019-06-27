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
                    var gaz_selected = false;

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
                            // click on radio button or label or outside label
                            if (ui.item.isField){
                                event.stopPropagation();
                                event.preventDefault();
                                //Tried to use radio button, Strangely, click on radio button does not make it checked
                                //Others worked properly

                                // if ($(event.toElement).is('input[name=filterOnFields]')) //click on checkbox
                                //      $(event.toElement).first().prop('checked', true);
                                //  else //click on lable
                                //     $(event.toElement).first().find('input[name=filterOnFields]').prop('checked', true);
                                // if (!$(event.toElement).is('input[name=filterOnFields]'))
                                //     $(event.toElement).first().find('input[name=filterOnFields]').prop('checked', true);

                                $(event.currentTarget).find('label span.glyphicon').removeClass('glyphicon-check').addClass('glyphicon-unchecked')
                                if($(event.toElement).is('span.glyphicon')) //Click on span icon
                                    $(event.toElement).removeClass('glyphicon-unchecked').addClass('glyphicon-check')
                                else //click on other area
                                    $(event.toElement).find('span.glyphicon').removeClass('glyphicon-unchecked').addClass('glyphicon-check')

                                // on UL level
                                $(event.currentTarget).first().find("li[field][field!=" + ui.item.fieldIdx + "]").hide();
                                $(event.currentTarget).first().find("li[field=" + ui.item.fieldIdx + "]").show();
                                gaz_selected = false;

                                //$(iElement).autocomplete('focus')
                                return false;

                            }else {
                                scope._custom()(ui.item.value.pid);
                                scope.label = ui.item.label;
                                gaz_selected = true;

                                $timeout(function () {
                                    iElement.val(scope.label);
                                }, 0)
                            }
                        },

                        close: function(event, ui){

                            // This function fires after select: and after autocomplete has already "closed" everything.  This is why event.preventDefault() won't work.
                            // ** ui is an empty object here so we have to use our own variable to check if the selected item is "selectable" or not..
                            if (! gaz_selected){
                                // We need to undo what autocomplete has already done..
                                $('#'+event.currentTarget.id).show(); // Keep the selection window open
                                // ta-da!  To the end user, nothing changes when clicking on an item that was not selectable.
                            }
                        }


                    })

                    a.data("ui-autocomplete")._renderItem = function (ul, item) {
                        if(item.isField){
                            var html = "<label><span class='glyphicon glyphicon-unchecked'></span>"+item.label+"</label>";
                            return $("<li class='autocomplete-item'>")
                                .append($("<a>").append(html))
                                .appendTo(ul);
                        }
                        else{
                            return $("<li field="+item.fieldIdx+" class='autocomplete-item'>")
                                .append($("<a>").append(item.label+ "<br><i>" + item.info + "</i>"))
                                .appendTo(ul);
                        }

                    };


                }
            };
        }])
}(angular));