if (this.SANDBOX_CONFIG === undefined) {

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

// set $SH.config defaults
if (!$SH.config) $SH.config = {};
if ($SH.config.mapOptions === undefined) $SH.config.mapOptions = true;
if ($SH.config.collapseUp === undefined) $SH.config.collapseUp = true;
if ($SH.config.collapseLeft === undefined) $SH.config.collapseLeft = true;
if ($SH.config.cursorCoordinates === undefined) $SH.config.cursorCoordinates = true;
if ($SH.config.quicklinks === undefined) $SH.config.quicklinks = true;
if ($SH.config.optionsAddWms === undefined) $SH.config.optionsAddWms = true;
if ($SH.config.optionsDownloadMap === undefined) $SH.config.optionsDownloadMap = true;
if ($SH.config.optionsResetMap === undefined) $SH.config.optionsResetMap = true;
if ($SH.config.optionsSelectBaseMap === undefined) $SH.config.optionsSelectBaseMap = true;
if ($SH.config.layerDistances === undefined) $SH.config.layerDistances = true;
if ($SH.config.googleLocation === undefined) $SH.config.googleLocation = true;
if ($SH.config.leftPanel === undefined) $SH.config.leftPanel = true;

var spApp = angular.module('spApp', ['leaflet-directive', 'ngAnimate', 'ui.bootstrap', 'ui.sortable', 'ui.slider',
    'ngRoute', 'ngAnimate', 'chieffancypants.loadingBar', 'ngFileUpload', 'ngTouch', 'ala.sandbox.components',
    'ngAria'
].concat($spAppModules))
    .factory('ConfigService', [function () {
        return {}
    }]);

spApp.value('sandboxConfig', SANDBOX_CONFIG);
spApp.value('existing', 1);

spApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.otherwise({
        templateUrl: '/spApp/spApp.htm',
        reloadOnSearch: false
    });

}]);

spApp.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

}]);

spApp.config(['$logProvider', function ($logProvider) {
    $logProvider.debugEnabled(false);
}]);

spApp.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push(function ($q) {
        return {
            'request': function (config) {
                var httpService = angular.element(document.querySelector('sp-app')).injector().get('HttpService');
                if (httpService) httpService.push(config);

                return config;
            },

            'requestError': function (rejection) {
                var httpService = angular.element(document.querySelector('sp-app')).injector().get('HttpService');
                if (httpService) httpService.pop(rejection, 'requestError');

                return $q.reject(rejection);
            },

            // optional method
            'response': function (response) {
                var httpService = angular.element(document.querySelector('sp-app')).injector().get('HttpService');
                if (httpService) {
                    if (!httpService.pop(response)) {
                        // hopefully this will cause a failure
                        return response;
                    }
                }

                return response;
            },

            'responseError': function (rejection, a, c) {
                var httpService = angular.element(document.querySelector('sp-app')).injector().get('HttpService');
                if (httpService) httpService.pop(rejection, 'responseError');

                if (rejection.status == -1) {
                    // urls not accessible are ignored.
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
                }
                return $q.reject(rejection);
            }
        };
    });

}]);


spApp.config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
}]);

function isBrowserSupported() {
    try {
        Function("() => {};");
        return true;
    }
    catch (exception) {
        return false;
    }
}

/**
 * Get all data required to run the application.
 *
 * @returns {*}
 */
function fetchData() {
    var _httpDescription = function (method) {
        return {service: 'startup', method: method}
    };

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

    if ($SH.config.layerDistances) {
        $http.get(distancesUrl, _httpDescription('getLayerDistances')).then(function (response) {
            if (response.data) {
                $.map(response.data, function (v, k) {
                    gLayerDistances[k] = v
                });
            } else {
                gLayerDistances = {}
            }
        });
    }

    promises.push($http.get($SH.baseUrl + "/portal/i18n?lang=" + $SH.i18n, _httpDescription('geti18n')).then(function (result) {
        for (k in result.data) {
            gMessages[k + ""] = result.data[k]
        }
        $SH.gMessages = gMessages;
        $i18n = function (k) {
            var key = ("" + k).replace(" ", "_"), match;
            if ($SH.gMessages[key] !== undefined) {
                return $SH.gMessages[key]
            } else {
                // turn pattern like "year:[1980 TO 1989]" to a more human readable format
                // The above example return "1980 TO 1989"
                match = (""+k).match(/[^-]*(-)*.*\[(.* TO .*)\]/);
                if(match && match.length === 3) {
                    match[1] = match[1] || "";
                    if(match[1] === '-') {
                        match[1] = $i18n(460)
                    }
                    return match[1] + match[2];
                }
                else
                    return k;
            }
        }
    }));

    promises.push($http.get($SH.baseUrl + '/portal/config/view?hub=' + $SH.hub, _httpDescription('getViewConfig')).then(function (data) {
        $SH.viewConfig = data.data;
        var url = $SH.layersServiceUrl + '/capabilities';
        return $http.get(url, _httpDescription('getLayersCapabilities')).then(function (data) {
            var k, merged, cap = {};
            for (k in data.data) {
                if (data.data.hasOwnProperty(k)) {
                    merged = data.data[k];

                    // merge spec input values from with view-config.json
                    if ($SH.viewConfig[k]) {
                        angular.merge(merged, $SH.viewConfig[k]);
                        angular.merge(merged.input, $SH.viewConfig[k].input)
                    }

                    cap[data.data[k].name] = merged
                }
            }

            $SH.layersServiceCapabilities = cap;

            return $q.when(cap)
        });
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
        if (v.match(/-directive$/g) != null && v != 'i18n-directive') {
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
$spPanelsResized = false;
$resetMap = undefined;
$spMapLoaded = function (resetMap) {
    $resetMap = resetMap;
    $spMapLoadedState = true;
    setTimeout($spPageLoadingHide, 0);
};
$spBootstrapReady = function () {
    $spBootstrapState = true;
    setTimeout($spPageLoadingHide, 0);
    setTimeout(initLayoutContainer, 2000);
};
$spPageLoadingHide = function () {
    if ($spMapLoadedState && $spBootstrapState && $spPanelsResized) {
        $resetMap();

        //$(".page-loading").fadeOut(0)
        $(".page-loading").detach();

        if (!isBrowserSupported()) {
            $('#browser-supported-message').removeClass('hide');
        }
    }
};

spApp.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist($SH.validUrls);
}]);

spApp.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|http|https):/);
    }]);

resizeSouth = function (a, b, c) {
    $('.ui-layout-resizer')[0].style.marginBottom = '-40px';
    $('.ui-layout-resizer')[0].style.minHeight = '40px';
    $('.ui-layout-resizer')[0].style.background = 'transparent';
    $('.ui-layout-resizer')[0].style.maxWidth = '350px';
};

initLayoutContainer = function () {
    if (!$SH.config.leftPanel) {
        $('#right-panel')[0].style.marginLeft = "0px";
        $('#left-panel')[0].style.marginLeft = "-420px";
    } else {
        $('#right-panel')[0].style.marginLeft = "420px";
        $('#left-panel')[0].style.marginLeft = "0px";
    }

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
                $('#left-panel')[0].style.maxHeight = $('#map').height() + "px";

                var panelHeader = $('#left-panel .panel-heading:last');
                var panelBody = $('#left-panel .panel-body:last');
                var panelFooter = $('#left-panel .modal-footer:last');
                if (panelFooter.size() > 0 && panelHeader.size() > 0 && panelBody.size() > 0) {
                    var bodyMargin = panelBody.outerHeight() - panelBody.height();
                    panelBody[0].style.maxHeight = ($('#map').height() - panelHeader.outerHeight() - panelFooter.outerHeight() - bodyMargin) + "px";
                }

                setTimeout(function () {
                    $SH.defaultPaneResizer.resizeAll();
                }, 100);
            }, 100)
        }

        $('#left-panel')[0].style.maxHeight = $('#map').height() + "px";

        if (!$spPanelsResized) {
            $spPanelsResized = true;
            setTimeout($spPageLoadingHide, 0);
        }
    }).trigger("resize");
};

L.Icon.Default.imagePath = $SH.baseUrl + '/assets/leaflet/dist/images';

jQuery.ui.autocomplete.prototype._resizeMenu = function () {
    var ul = this.menu.element;
    ul.outerWidth(this.element.outerWidth());
};

var authWorkaround = function (url) {
    if (url) {
        $("body").append('<div style="display:none"><iframe src="' + url + '"></iframe></div>')
    }
};

// This is to fix auth issues with ajax calls to other ala applications
if ($SH.biocollectUrl) {
    authWorkaround($SH.biocollectUrl);
}

// // Override Leaflet to fix map locking up when using different EPSGs
L.oldLatLng = L.LatLng;
L.LatLng = function (lat, lng, alt) { // (Number, Number, Number)
    this.lat = parseFloat(lat);
    this.lng = parseFloat(lng);

    if (alt !== undefined) {
        L.noConflict.alt = parseFloat(alt);
    }
};
L.extend(L.LatLng, L.oldLatLng);
L.LatLng.prototype = L.oldLatLng.prototype;