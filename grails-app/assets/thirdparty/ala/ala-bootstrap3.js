// http://www2.ala.org.au/commonui-bs3/js/application.js

var navbarCollapseMinWidth = 768;
var _navbarWidthCheck = function() {
    var menu = $('#bs-example-navbar-collapse-1');
    var button = $('.navbar-toggle');
    var width = $(document).width();
    if (width < 768) {
        $('.navbar-header')[0].style.width = ""
    } else {
        $('.navbar-header')[0].style.width = "100%"
    }
    if (width <= navbarCollapseMinWidth || menu.height() > 50) {
        if (width > navbarCollapseMinWidth) {
            navbarCollapseMinWidth = width;
        }
        menu[0].className = "navbar-collapse collapse";
        button[0].style.display = 'block !important';
        button[0].className = "navbar-toggle";
    } else {
        menu[0].className = "navbar-collapse";
        button[0].className = "navbar-toggle collapse";
        button[0].style.display = 'none !important';
    }
};
var navbarWidthCheck = function() {
    _navbarWidthCheck();

    //recheck because _navbarWidthCheck() can expand the menu
    _navbarWidthCheck();
};

// initialise plugins
$(function(){
    $( window ).resize(function() {
        navbarWidthCheck();
    });
    setTimeout(navbarWidthCheck, 100);

    var autocompleteUrl = 'http://bie.ala.org.au/ws/search/auto.jsonp';

    if(typeof BIE_VARS != 'undefined' && BIE_VARS.autocompleteUrl){
        autocompleteUrl = BIE_VARS.autocompleteUrl;
    }

    // autocomplete on navbar search input
    $("input.general-search").autocomplete();
    $("input.general-search").autocomplete({
        source: function( request, response ) {
            $.ajax( {
                url: autocompleteUrl,
                dataType: "jsonp",
                data: {
                    term: request.term
                },
                extraParams: {limit: 100},
                success: function( data ) {
                    var rows = new Array();
                    data = data.autoCompleteList;
                    for (var i in data) {
                        var item = data[i];
                        if (item) {
                            rows.push({
                                value: item.matchedNames[0],
                                label: item.matchedNames[0]
                            });
                        }
                    }
                    response(rows);
                }
            } );
            },
        matchSubset: false,
        cacheLength: 10,
        minChars: 3,
        scroll: false,
        max: 10,
        selectFirst: false
    });

    // Mobile/desktop toggle
    // TODO: set a cookie so user's choice is remembered across pages
    var responsiveCssFile = $("#responsiveCss").attr("href"); // remember set href
    $(".toggleResponsive").click(function(e) {
        e.preventDefault();
        $(this).find("i").toggleClass("icon-resize-small icon-resize-full");
        var currentHref = $("#responsiveCss").attr("href");
        if (currentHref) {
            $("#responsiveCss").attr("href", ""); // set to desktop (fixed)
            $(this).find("span").html("Mobile");
        } else {
            $("#responsiveCss").attr("href", responsiveCssFile); // set to mobile (responsive)
            $(this).find("span").html("Desktop");
        }
    });
});