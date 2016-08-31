// initialise plugins
$(function () {
    // autocomplete on navbar search input
    $("input.general-search").autocomplete('http://bie.ala.org.au/ws/search/auto.jsonp', {
        extraParams: {limit: 100},
        dataType: 'jsonp',
        parse: function (data) {
            var rows = new Array();
            data = data.autoCompleteList;
            for (var i = 0; i < data.length; i++) {
                rows[i] = {
                    data: data[i],
                    value: data[i].matchedNames[0],
                    result: data[i].matchedNames[0]
                };
            }
            return rows;
        },
        matchSubset: false,
        formatItem: function (row, i, n) {
            return row.matchedNames[0];
        },
        cacheLength: 10,
        minChars: 3,
        scroll: false,
        max: 10,
        selectFirst: false
    });
    ////action on hitting enter
    //$("input.general-search").keypress(function(e) {
    //    if(e.which == 13) {
    //        var searchTerm = $("input.general-search").val().trim();
    //        alert("Search term: " + searchTerm);
    //        if(searchTerm != ""){
    //            console.log("redirecting to http://bie.ala.org.au/search?q=" + searchTerm);
    //            window.location = "http://bie.ala.org.au/search?q=" + searchTerm;
    //        }
    //    }
    //});
    // Mobile/desktop toggle
    // TODO: set a cookie so user's choice is remembered across pages
    var responsiveCssFile = $("#responsiveCss").attr("href"); // remember set href
    $(".toggleResponsive").click(function (e) {
        e.preventDefault();
        $(this).find("i").toggleClass("glyphicon-resize-small glyphicon-resize-full");
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