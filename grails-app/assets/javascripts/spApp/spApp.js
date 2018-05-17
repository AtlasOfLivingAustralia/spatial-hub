//sandbox config if not defined
if (SANDBOX_CONFIG === undefined) {

    SANDBOX_CONFIG = {
        autocompleteColumnHeadersUrl: $SH.sandboxUiUrl + '/dataCheck/autocomplete',
        biocacheServiceUrl: $SH.sandboxServiceUrl,
        chartOptionsUrl: $SH.sandboxUiUrl + '/myDatasets/chartOptions',
        deleteResourceUrl: $SH.sandboxUiUrl + '/myDatasets/deleteResource',
        getAllDatasetsUrl: $SH.sandboxUiUrl + '/myDatasets/allDatasets',
        getDatasetsUrl: $SH.sandboxUiUrl + '/myDatasets/userDatasets',
        keepaliveUrl: $SH.sandboxUiUrl + '/dataCheck/ping',
        loginUrl: '?service=' + $SH.baseUrl,
        parseColumnsUrl: $SH.sandboxUiUrl + '/dataCheck/parseColumns',
        processDataUrl: $SH.sandboxUiUrl + '/dataCheck/processData',
        reloadDataResourceUrl: $SH.sandboxUiUrl + '/dataCheck/reload',
        saveChartOptionsUrl: $SH.sandboxUiUrl + '/myDatasets/saveChartOptions',
        uploadCsvUrl: $SH.sandboxUiUrl + '/dataCheck/uploadFile',
        uploadToSandboxUrl: $SH.sandboxUiUrl + '/dataCheck/upload',
        uploadStatusUrl: $SH.sandboxUiUrl + '/dataCheck/uploadStatus',
        userId: $SH.userId,
        roles: ["ROLE_ADMIN", "ROLE_API_EDITOR", "ROLE_APPD_USER", "ROLE_BASE", "ROLE_FC_ADMIN", "ROLE_FC_OFFICER", "ROLE_SDS_NSW", "ROLE_SDS_SA", "ROLE_SDS_VIC", "ROLE_SDS_WA", "ROLE_SPATIAL_ADMIN", "ROLE_SYSTEM_ADMIN", "ROLE_USER"]
    };
}

var spApp = angular.module('spApp', ['leaflet-directive', 'ngAnimate', 'ui.bootstrap', 'ui.sortable', 'ui.slider',
    'ngRoute', 'ngAnimate', 'chieffancypants.loadingBar', 'ngFileUpload', 'ngTouch', 'ala.sandbox.components',
    'ngAria'
].concat($spAppModules))

    .factory('ConfigService', [function () {
        return {}
    }]);

/*
spApp.run(function($rootScope) {
    try
    {
        Function("() => {};");
        $('#warning-message').show()
        return true;
    }
    catch(exception)
    {
        $('#warning-message').show()
        return alert('Your web browser is not fully supported!');
    }
});

*/

spApp.value('sandboxConfig', SANDBOX_CONFIG);
spApp.value('existing', 1);

spApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.otherwise({
        templateUrl: '/spApp/spApp.htm'
    });

}]);

spApp.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

}]);

// spApp.config(function ($provide) {
//     $provide.decorator('$exceptionHandler', function ($delegate) {
//         return function (exception, cause) {
//             //$delegate(exception, cause);
//             alert('Aw, snap! An error occurred! Error: '+exception);
//         };
//     });
// });

spApp.config(['$httpProvider', function($httpProvider )
{
    $httpProvider.interceptors.push(function($q) {
        return {
            'responseError': function (rejection, a, c) {
                // window.informUser('Error '+rejection.status +': ' +rejection.config.url);
                if (rejection.status == -1){
                    // urls not accessible are ignored.
                    console.error('Request to '+rejection.config.url + ' is not accessible')
                } else if (rejection.status === 0) {
                    if (window.isInWrapper) {
                        //Logout if in an app;
                        window.location.href = 'ios:logout';
                    } else {
                        window.location.reload();
                    }
                } else if (rejection.status !== 404) {
                    //Ignore invalid urls
                    //HTTP interceptor can decorate the promise rejection with a property handled to indicate whether it's handled the error.
                    rejection.handled = true;
                    alert('Aw, Snap! Error in request url: ' + rejection.config.url +" (Status: "+ rejection.status +" " + rejection.statusText +" )" )
                }
                return $q.reject(rejection);
            }
        };
    });

}])


spApp.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
}]);

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
    //$http.get($SH.proxyUrl + "?url=" + encodeURIComponent(distancesUrl)).then(function (response) {
    $http.get(distancesUrl).then(function (response) {
        $.map(response.data, function (v, k) {
            gLayerDistances[k] = v
        });
    });

    promises.push($http.get($SH.baseUrl + "/portal/i18n?lang=" + $SH.i18n).then(function (result) {
        for (k in result.data) {
            gMessages[k + ""] = result.data[k]
        }
        $SH.gMessages = gMessages;
        $i18n = function (k) {
            var key = ("" + k).replace(" ", "_");
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

angular.element($('sp-app')[0]).ready(function () {
    var view = $('<div ng-view></div>');
    $('sp-app').append(view);

    fetchData().then(bootstrapApplication);
});

function bootstrapApplication() {
    angular.element($('sp-app')[0]).ready(function () {
        angular.bootstrap($('sp-app')[0], ['spApp'], {
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
    setTimeout(initLayoutContainer, 2000);
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

initLayoutContainer = function () {
    $(window).on("resize", function () {
        if ($('.ui-layout-container')[0]) {
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

            setTimeout(function () {
                //$('#left-panel')[0].style.overflowY = "scroll";
                $('#left-panel')[0].style.maxHeight = $('#map').height() + "px";

                setTimeout(function () {
                    $SH.defaultPaneResizer.resizeAll();
                    $SH.defaultPaneResizer.hide('south');
                }, 100);
            }, 100)
        }
    }).trigger("resize");
};

L.Icon.Default.imagePath = 'assets/leaflet/dist/images';

jQuery.ui.autocomplete.prototype._resizeMenu = function () {
    var ul = this.menu.element;
    ul.outerWidth(this.element.outerWidth());
};

