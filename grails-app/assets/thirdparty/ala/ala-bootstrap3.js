// https://www2.ala.org.au/commonui-bs3/js/application.js

var navbarCollapseMinWidth = 320;
var _navbarWidthCheck = function() {
    var menu = $('#login-buttons');
    var menuDrop = $('#login-buttons-dropdown');
    var button = $('.navbar-toggle');
    var width = $(document).width();

    //$('.navbar-header')[0].style.width = "";
    var biesearch = $('#biesearch-top');
    var biesearchDrop = $('#biesearch-dropdown');

    if (width <= navbarCollapseMinWidth || menu.height() > 60) {
        //hide search
        if (biesearch[0].style.display != "none") {
            biesearch[0].style.display = "none";

            if (!(width <= navbarCollapseMinWidth || menu.height() > 60)) {
                _navbarWidthCheckFinish()
                return
            }
        }
        if (width > navbarCollapseMinWidth) {
            navbarCollapseMinWidth = width;
        }

        menu[0].className = "navbar-collapse collapse";
        button[0].style.display = 'block !important';
        button[0].className = "navbar-toggle";
        // $('.navbar-header')[0].style.width = "100%"
    } else if (biesearch[0]) {
        var d0 = biesearch[0].style.display;
        if (biesearch[0].style.display == "none") {
            biesearch[0].style.display = "";
        }
        if (!(width <= navbarCollapseMinWidth || menu.height() > 60)) {
            menu[0].className = "navbar-collapse";
            button[0].className = "navbar-toggle collapse";
            button[0].style.display = 'none !important';
        } else {
            biesearch[0].style.display = d0;
        }
    }

    _navbarWidthCheckFinish()
};

var _navbarWidthCheckFinish = function() {
    var menu = $('#login-buttons');
    var menuDrop = $('#login-buttons-dropdown');

    var logoDrop = $('#logo-dropdown');

    var biesearch = $('#biesearch-top');
    var biesearchDrop = $('#biesearch-dropdown');

    if (biesearch[0]) {
        if (biesearch[0].style.display == "none" || getComputedStyle($('#bs-example-navbar-collapse-1')[0]).display == "none") {
            biesearchDrop[0].style.display = "";
        } else {
            biesearchDrop[0].style.display = "none";
        }

        if (getComputedStyle($('#bs-example-navbar-collapse-1')[0]).display == "none") {
            menuDrop[0].style.display = "";
            logoDrop[0].style.display = "";
        } else {
            menuDrop[0].style.display = "none";
            logoDrop[0].style.display = "none";
        }

        if (menu.height() > 60) {
            _navbarWidthCheck();
        }
    }

    var headerHeight = 0;
    var navbar = $('.navbar-default')[0];
    if (navbar) {
        headerHeight = getComputedStyle(navbar).height.replace("px", "").replace("auto", "0");
    }
    $("#map").height($(window).height() - headerHeight);
    $("body")[0].style.paddingTop = headerHeight + "px";
    if ($('#spMenu')[0]) {
        $("#defaultPanel").height($(window).height() - headerHeight - 20 - getComputedStyle($('#spMenu')[0]).height.replace("px", "").replace("auto", "0"));
    }

};

var navbarWidthCheck = function() {
    _navbarWidthCheck();
};

// initialise plugins
$(function(){
    $( window ).resize(function() {
        navbarWidthCheck();
    });
    setTimeout(navbarWidthCheck, 10);

    var autocompleteUrl = 'https://bie.ala.org.au/ws/search/auto.jsonp';

    if(typeof BIE_VARS != 'undefined' && BIE_VARS.autocompleteUrl){
        autocompleteUrl = BIE_VARS.autocompleteUrl;
    }

    // autocomplete on navbar search input
    $("input#biesearch").autocomplete();
    $("input#biesearch").autocomplete({
        source: function( request, response ) {
            $.ajax( {
                url: autocompleteUrl,
                dataType: "jsonp",
                data: {
                    q: request.term
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
