var spApp = angular.module('spApp', ['leaflet-directive', 'ngAnimate', 'ui.bootstrap', 'ui.sortable', 'ui.slider',
    'ngRoute', 'ngAnimate', 'chieffancypants.loadingBar', 'ngFileUpload', 'ngTouch', 'ala.sandbox.components',
    'ngAria',
    ].concat($spAppModules))

    .factory('ConfigService', [function () {
        return {}
    }]);


spApp.value('sandboxConfig', SANDBOX_CONFIG);
spApp.value('existing', 1);

spApp.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

}]);

spApp.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
}]);

fetchData().then(bootstrapApplication);

function fetchData() {
    var initInjector = angular.injector(["ng"]);
    var $http = initInjector.get("$http");
    var $q = initInjector.get("$q");
    var $rootScope = initInjector.get("$rootScope");

    var promises = [];

    var gLayerDistances = {};
    var gMessages = {};
    spApp.constant("gLayerDistances", gLayerDistances);
    spApp.constant("gMessages", gMessages);

    var distancesUrl = $SH.layersServiceUrl + "/layerDistances/layerdistancesJSON";
    $http.get($SH.proxyUrl + "?url=" + encodeURIComponent(distancesUrl)).then(function (response) {
        $.map(response.data, function (v, k) {
            gLayerDistances[k] = v
        });
    });

    promises.push($http.get($SH.baseUrl + "/portal/i18n?lang=" + $SH.i18n).then(function (result) {
        for (k in result.data) {
            gMessages[k + ""] = result.data[k]
        }
        $SH.gMessages = gMessages
        $i18n = function (k) {
            var key = ("" + k).replace(" ", "_")
            if ($SH.gMessages[key] !== undefined) {
                return $SH.gMessages[key]
            } else {
                return k
            }
        }
    }));

    // add to promises list if waiting is required before making the page visible
    return $q.all(promises).then(function (results) {
    });
}

spApp.config(['$provide', function ($provide) {
    //inject 'componentName' into controllers for use by LayoutService
    $provide.decorator('$controller', ['$delegate', function ($delegate) {
        return function (constructor, locals, later, indent) {
            if (typeof constructor === 'string' && !locals.$scope.controllerName) {
                locals.$scope.componentName = constructor;
            }
            return $delegate(constructor, locals, later, indent);
        };
    }]);

    //inject 'componentName' into directive scopes for use by LayoutService
    $.each(spApp.requires, function (x) {
        var v = spApp.requires[x];
        if (v.endsWith('-directive') && v != 'i18n-directive') {
            $provide.decorator($.camelCase(v), ['$delegate', 'LayoutService', function ($delegate, LayoutService) {
                var directive = $delegate[0];

                directive.compile = function () {
                    return function (scope, element, attrs) {
                        scope.componentName = directive.name;
                        if (scope._uniqueId)
                            scope.componentName += scope._uniqueId;

                        if (this.link)
                            this.link.apply(this, arguments);
                    };
                };
                return $delegate;
            }]);
        }
    })
}]);

function bootstrapApplication() {
    angular.element(document).ready(function () {
        angular.bootstrap(document, ['spApp'], {
            strictDi: true
        });
    });

    $spBootstrapReady();
}

$spBootstrapState = false;
$spMapLoadedState = false;
$spMapLoaded = function () {
    $spMapLoadedState = true;
    setTimeout( $spPageLoadingHide, 0 );
};
$spBootstrapReady = function () {
    $spBootstrapState = true;
    setTimeout( $spPageLoadingHide, 0 );
};
$spPageLoadingHide = function () {
    if ($spMapLoadedState && $spBootstrapState) {
        //$(".page-loading").fadeOut(0)
        $(".page-loading").detach()
    }
};

$spNc = function (obj, args, deflt, pos) {
    if (obj != null && obj != undefined) {
        if (pos != undefined) pos = 0;
        return $spNc(obj[args[pos]], args, deflt, pos + 1)
    } else {
        return deflt
    }
};

spApp.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist($SH.validUrls);
}]);

spApp.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|http|https):/);
    }]);

resizeSouth = function(a,b,c) {
    $('.ui-layout-resizer')[0].style.marginBottom = '-40px';
    $('.ui-layout-resizer')[0].style.minHeight = '40px';
    $('.ui-layout-resizer')[0].style.background = 'transparent';
    $('.ui-layout-resizer')[0].style.maxWidth = '350px';
};

$(window).on("resize", function () {

    $SH.defaultPaneResizer = $('.ui-layout-container').layout({
        west: {
            spacing_open: 0,
            spacing_closed: 0
        },
        east: {
            spacing_open: 0,
            spacing_closed: 0
        },
        north: {
            spacing_open: 0,
            spacing_closed: 0
        },
        south: {
            togglerLength_open: 0,
            togglerLength_closed: 0,
            resizerCursor: "ns-resize",
            size: $(window).height() - 350,
            spacing_closed: 40,
            onresize: 'resizeSouth',
            minSize: 40
        }
    });

    setTimeout(function() {
        //$('#left-panel')[0].style.overflowY = "scroll";
        $('#left-panel')[0].style.maxHeight = $('#map').height() + "px";

        setTimeout(function () {
            $SH.defaultPaneResizer.resizeAll();
            $SH.defaultPaneResizer.hide('south');
        }, 100);
    }, 100)
}).trigger("resize");

L.Icon.Default.imagePath = 'assets/leaflet/dist/images';

//call this after adding data to a fixed-head table
$resizeTables = function () {
    // var tables = $('table.fixed-head');
    // tables.each(function () {
    //     var widths = $(this).find('tbody tr:first').children().map(function (i, v) {
    //         return $(this).width()
    //     }).get();
    //
    //     $(this).find('thead tr').children().each(function (i, v) {
    //         $(v).width(widths[i]);
    //     });
    // })
};
//
// $(window).resize(function () {
//     $resizeTables()
//     setTimeout( function() {
//         $SH.defaultPaneResizer.resizeAll();
//         $SH.defaultPaneResizer.hide('south');
//     }, 100);
// }).resize(); // Trigger resize handler

jQuery.ui.autocomplete.prototype._resizeMenu = function () {
    var ul = this.menu.element;
    ul.outerWidth(this.element.outerWidth());
};
