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
                    var limit = 10;
                    var q = {};
                    var historicResults = [];
                    var hasMore = true;
                    var currentPos = 0; // Remember add more button position to let dropdown list scroll down to view

                    var a = iElement.autocomplete({
                        minLength: 2,
                        delay: 500,

                        source: function (searchTerm, response) {
                            // only search term if search is triggered by input box, like 'vic'
                            // q=vic&start=0, if triggered by 'Add more'
                            var urlParams = new URLSearchParams(searchTerm.term);
                            if (urlParams.has('q') && urlParams.has('start')){
                                q.q = urlParams.get('q');
                                q.start = urlParams.get('start');
                                q.limit = limit;
                                q.include = urlParams.get('include');
                            }else{
                                q.start = 0;
                                q.q = searchTerm.term;
                                q.limit = limit;
                                q.include=undefined;
                            }

                            GazAutoCompleteService.search(q).then(function (data) {
                                response(
                                    $.map(data, function (item) {
                                       if (item.fid !== $SH.userObjectsField || scope._userobjects) {
                                            return {
                                                label: item.name,
                                                info: item.description ? item.description + " (" + item.fieldname + ")" : "(" + item.fieldname + ")",
                                                fieldname: item.fieldname,
                                                fid: item.fid,
                                                value: item
                                            }
                                        } else {
                                            return null
                                        }
                                    })
                                )
                            });
                        },

                        response: function(event,ui){
                            var data = ui.content;
                            if (data.length < limit)
                                hasMore = false;
                            else
                                hasMore = true;

                            if (q.start > 0)
                            {
                              //reverse history records and then push them at FRONT
                              historicResults.reverse().forEach(function(item){
                                  data.unshift(item)
                              })
                            }
                            //update historic result
                            historicResults = data.slice();

                           //All related fields will be attached with result if query does not limit search on field

                            if(q.include){
                               // Get distinct field and fidx
                                var fids = data.map(function(item){
                                      return item.fid;
                                })
                                var fields = data.filter(function(value,index,final){
                                     return fids.indexOf(value.fid) == index;
                                 }).map(function(item){
                                     return {label: item.fieldname, fid: item.fid, isField: true}});

                            }else{

                                var fields = _.map( JSON.parse(data[0].value.fields),function(field){
                                    var fs = field.split('|');
                                    return {label: fs[1], fid: fs[0], isField: true}});
                            }




                           fields.forEach(function(item){
                               data.unshift(item);
                           })



                        },

                        select: function (event, ui) {
                            //click on category to show all fields or part
                            gaz_selected = false;
                            if(ui.item.isCategory){
                                if(ui.item.isExpanded){
                                    $(event.currentTarget).first().find("li[isField]").hide();
                                    $(event.currentTarget).first().find("li[expandedFieldFilter]").hide()
                                    $(event.currentTarget).first().find("li[expandedFieldFilter=false]").show()

                                }else{
                                    $(event.currentTarget).first().find("li[isField]").show();
                                    $(event.currentTarget).first().find("li[expandedFieldFilter]").show()
                                    $(event.currentTarget).first().find("li[expandedFieldFilter=false]").hide()
                                }
                                return false;
                            }else if (ui.item.isField){  //check on filter checkbox
                                // click on radio button or label or outside label
                                event.stopPropagation();
                                event.preventDefault();

                                //check q.include, if it is same as ui.item.fid,
                                //it clicks on a checked item  -> uncheck it

                                if (q.include === ui.item.fid)
                                    var term = "q=" + q.q +"&start=0";
                                else
                                    var term = "q=" + q.q +"&start=0&include="+ui.item.fid;

                                //Have to put the trigger method into setTimeout make  _renderItem working
                                setTimeout(function() {
                                    $('#gazAutoComplete').autocomplete('search', term );
                                }, 0);
                                return false;

                            }else if (ui.item.showMore){

                                q.start = parseInt(q.start) + limit;
                                var term = 'q=' + q.q +"&start="+q.start
                                if (q.include)
                                    term +='&include='+q.include;

                                event.stopPropagation();
                                event.preventDefault();
                                //Have to put the trigger method into setTimeout make  _renderItem working
                                setTimeout(function() {
                                    $('#gazAutoComplete').autocomplete('search', term );
                                }, 0);

                                return false;
                            }else{
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
                            if (! gaz_selected && event.currentTarget){
                                // We need to undo what autocomplete has already done..
                                $('#'+event.currentTarget.id).show(); // Keep the selection window open
                                // ta-da!  To the end user, nothing changes when clicking on an item that was not selectable.
                            }
                        },

                        open: function( event, ui ) {
                            $('.ui-autocomplete').css('height', 'auto');
                            $('.ui-autocomplete').css('width','auto');
                            //Get some values needed to determine whether the widget is on
                            //the screen
                            var $input = $(event.target),
                                inputTop = $input.offset().top,
                                inputHeight = $input.height(),
                                autocompleteHeight = $('.ui-autocomplete').height(),
                                windowHeight = $(window).height();


                            //The widget has left the screen if the input's height plus it's offset from the top of
                            //the screen, plus the height of the autocomplete are greater than the height of the
                            //window.
                            if ((inputHeight + inputTop + autocompleteHeight) > windowHeight) {

                                //Set the new height of the autocomplete to the height of the window, minus the
                                //height of the input and the offset of the input from the top of the screen.  The
                                //20 is simply there to give some spacing between the bottom of the screen and the
                                //bottom of the autocomplete widget.
                                $('.ui-autocomplete')
                                    .css('max-height', (windowHeight - inputHeight - inputTop - 20) + 'px');

                                $('.ui-autocomplete').css('overflow-y', 'auto');
                            }


                            //Scroll to last item if 'add more' clicked
                            // if(q.start > 0){
                            //     $('.ui-autocomplete').find('li').get(currentPos ).scrollIntoView()
                            // }

                        }


                    })

                    a.data("ui-autocomplete")._renderItem = function (ul, item) {
                         if(item.isField){
                            if(item.fid === q.include) // field has been checked
                                var html = "<label><span class='glyphicon glyphicon-check'></span>"+item.label+"</label>";
                            else
                                var html = "<label><span class='glyphicon glyphicon-unchecked'></span>"+item.label+"</label>";
                            return $("<li class='autocomplete-item' isField >")
                                .append($("<a>").append(html))
                                //.appendTo(ul);  //Let renderMenu to control
                        }else if (item.isCategory){
                            if (item.isExpanded)
                                return $("<li class='autocomplete-item' style='text-align:center' expandedFieldFilter=true>")
                                    .append($("<a>").append("<label>" + item.label +"</label> <span class='glyphicon glyphicon-menu-up'></span>"))
                            else
                                return $("<li class='autocomplete-item' style='text-align:center' expandedFieldFilter=false>")
                                    .append($("<a>").append("<label>" + item.label +"</label> <span class='glyphicon glyphicon-menu-down'></span>"))
                        }
                        else if (item.showMore){
                            return $("<li class='autocomplete-item' style='text-align:center'  showMore>")
                                .append($("<a>").append(" <label>" + item.label +"</label>  <span class='glyphicon glyphicon-menu-down'></span></a>"))
                        }
                        else{
                            return $("<li field="+item.fid+" class='autocomplete-item'>")
                                .append($("<a>").append(item.label+ "<br><i>" + item.info + "</i>"))
                                //.appendTo(ul);
                        }

                    };

                    a.data("ui-autocomplete")._renderMenu = function( ul, items ) {
                        var that = this;
                        var isExpanded = false;
                        var numOfFilters = items.filter(function(item){return item.isField}).length;
                        if (q.include) // One field is checked, expand field files
                            isExpanded = true;

                        if (numOfFilters > 1)
                            if (isExpanded){
                                ul.append(that._renderItemData( ul, {label: 'Show '+ numOfFilters +' filters', isCategory:true, isExpanded: false} ).hide())
                                ul.append(that._renderItemData( ul, {label: 'Hide filters', isCategory:true, isExpanded: true} ).show())
                            }else{
                                ul.append(that._renderItemData( ul, {label: 'Show '+ numOfFilters +' filters', isCategory:true, isExpanded: false} ).show())
                                ul.append(that._renderItemData( ul, {label: 'Hide filters', isCategory:true, isExpanded: true} ).hide())
                            }


                        $.each( items, function( index, item ) {
                            if ( item.isField) {
                                if (isExpanded)
                                    ul.append(that._renderItemData( ul, item ));
                                else
                                    ul.append(that._renderItemData( ul, item ).hide());
                            }else
                                ul.append(that._renderItemData( ul, item ));
                        });
                        if(hasMore)
                            ul.append(that._renderItemData( ul, {label: 'Show more', showMore: true} ))
                    }



                }
            };
        }])
}(angular));