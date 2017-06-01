var spApp = angular.module('spApp', ['leaflet-directive', 'ngAnimate', 'ui.bootstrap', 'ui.sortable', 'ui.slider', 'biocache-service', 'facet-auto-complete-service', 'gaz-auto-complete-service', 'layer-distances-service', 'layers-auto-complete-service', 'layers-service', 'layout-service', 'lists-service', 'map-service', 'predefined-areas-service', 'predefined-layer-lists-service', 'sandbox-service', 'species-auto-complete-service', 'popup-service', 'area-list-select-directive', 'gaz-auto-complete-directive', 'google-places', 'layer-auto-complete-directive', 'layer-list-select-directive', 'layer-list-upload-directive', 'lists-list-directive', 'sandbox-list-directive', 'sp-menu-directive', 'select-area-directive', 'select-layers-directive', 'select-species-directive', 'species-auto-complete-directive', 'leaflet-quick-links-directive', 'add-area-ctrl', 'add-layer-ctrl', 'add-species-ctrl', 'area-report-ctrl', 'tool-ctrl', 'leaflet-map-controller', 'csv-ctrl', 'export-checklist-ctrl', 'export-sample-ctrl', 'layout-ctrl', 'modal-iframe-instance-ctrl', 'legend-directive', 'sp-map-directive', 'envelope-directive', 'export-bccvl-ctrl', 'draw-area-directive', 'nearest-locality-directive', 'point-comparison-directive', 'sp-options-directive', 'add-facet-ctrl', 'phylo-service', 'select-phylo-directive', 'export-map-ctrl', 'export-area-ctrl', 'species-info-ctrl', 'tabulate-ctrl', 'tool-area-report-ctrl', 'sand-box-ctrl', 'analysis-ctrl', 'ngAria', 'ngTouch', 'ala.sandbox.components', 'create-species-list-ctrl', 'ala.sandbox.preview', 'chieffancypants.loadingBar', 'ngFileUpload', 'playback-directive', 'colour-service', 'sessions-service', 'sessions-ctrl', 'bie-service', 'logger-service', 'url-params-service', 'ngRoute', 'ngAnimate', 'keep-alive-service'])
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

    var gLayerDistances = {};
    spApp.constant("gLayerDistances", gLayerDistances);

    var distancesUrl = $SH.layersServiceUrl + "/layerDistances/layerdistancesJSON";
    $http.get($SH.proxyUrl + "?url=" + encodeURIComponent(distancesUrl)).then(function (response) {
        $.map(response.data, function (v, k) {
            gLayerDistances[k] = v
        });
    });

    return $q.all([]).then(function (results) {
    });
}

spApp.config(['$provide', function ($provide) {
    $provide.decorator('$controller', ['$delegate', function ($delegate) {
        return function (constructor, locals, later, indent) {
            if (typeof constructor === 'string' && !locals.$scope.controllerName) {
                locals.$scope.componentName = constructor;
            }
            return $delegate(constructor, locals, later, indent);
        };
    }]);

    $.each(spApp.requires, function (x) {
        var v = spApp.requires[x];
        if (v.endsWith('-directive')) {
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

        var header = $('.navbar-header');
        var navLastFirst = $('.navbar-right .dropdown:last a:first');
        var dropdown = $('.navbar-right .dropdown');

        $("#map").height($(window).height() - header.height());
        $("#legend").height($(window).height() - header.height() - 195);

        //alter header
        if ($SH.userId) {
            $('<li class="dropdown font-xsmall"><a href="#" onclick="$(\'#saveSessionButton\')[0].click()" data-toggle="dropdown" role="button" aria-expanded="false">Save</a></li>').insertBefore(dropdown[0]);
            $('<li class="dropdown font-xsmall"><a href="#" onclick="$(\'#sessionsButton\')[0].click()" data-toggle="dropdown" role="button" aria-expanded="false">Load</a></li>').insertBefore(dropdown[0]);

            var userEmail = document.cookie.split(';').find(function (cookie) {
                return cookie.trim().startsWith('ALA-Auth=');
            }).trim().replace('ALA-Auth="', '').replace('"', '');
            navLastFirst.html(userEmail + '<span class="caret"/>')
        } else {
            //insert new login button
            $('<li class="dropdown font-xsmall"><a href="#" onclick="$(\'.navbar-right .dropdown a:last\')[0].click()" data-toggle="dropdown" role="button" aria-expanded="false">Log in</a></li>').insertBefore(dropdown[0]);

            //hide login button
            $('.navbar-right .dropdown a:last').hide();

            navLastFirst.html('<span class="caret"/>')
        }
    });
}

spApp.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist($SH.validUrls);
}]);

spApp.config(['$compileProvider',
    function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|http|https):/);
    }]);

$(window).on("resize", function () {
    var header = $('.navbar-header');
    $("#map").height($(window).height() - header.height());
    $("#legend").height($(window).height() - header.height() - 195);

}).trigger("resize");

L.Icon.Default.imagePath = 'assets/leaflet/dist/images';

//call this after adding data to a fixed-head table
$resizeTables = function () {
    var tables = $('table.fixed-head');
    tables.each(function () {
        var widths = $(this).find('tbody tr:first').children().map(function (i, v) {
            return $(this).width()
        }).get();

        $(this).find('thead tr').children().each(function (i, v) {
            $(v).width(widths[i]);
        });
    })
};

$(window).resize(function () {
    $resizeTables()
}).resize(); // Trigger resize handler

jQuery.ui.autocomplete.prototype._resizeMenu = function () {
    var ul = this.menu.element;
    ul.outerWidth(this.element.outerWidth());
};
