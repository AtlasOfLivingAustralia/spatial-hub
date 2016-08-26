<!doctype html>
<html lang="en">
<head>

    <script>

        SpatialPortalConfig = {
            biocacheUrl: '${config.biocache.url}',
            biocacheServiceUrl: '${config.biocacheService.url}',
            layersServiceUrl: '${config.layersService.url}',
            listsUrl: '${config.lists.url}',
            sandboxUrl: '${config.sandbox.url}',
            sandboxServiceUrl: '${config.sandboxService.url}',
            gazField: '${config.gazField}',
            geoserverUrl: '${config.geoserver.url}',
            collectionsUrl: '${config.collections.url}',
            userObjectsField: '${config.userObjectsField}',
            gazField: '${config.gazField}',
            userId: '${userId}',
            hoverLayers: [],
            proxyUrl: '${createLink(controller:'portal', action:'proxy')}'
        }
    </script>


    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <meta name="layout" content="portal"/>
    <title>Atlas of Living Australia | Spatial Portal</title>

    <script src="${resource(dir: 'js/ala', file: 'html5.js')}"></script>

    <script src="//code.jquery.com/jquery-2.1.1.min.js"></script>
    <script src="//code.jquery.com/ui/1.11.0/jquery-ui.min.js"></script>
    <script type="text/javascript"
            src="http://maps.google.com/maps/api/js?sensor=false&libraries=places&language=en-US"></script>

    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular.js"></script>
    <script src="http://ajax.googleapis.com/ajax/libs/angularjs/1.4.8/angular-animate.js"></script>
    <script src="http://cdn.leafletjs.com/leaflet-0.7.3/leaflet.js"></script>
    <script src="${resource(dir: 'js', file: 'angular-leaflet-directive.min.js')}"></script>
    <script src="${resource(dir: 'js', file: 'sortable.js')}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/0.2.3/leaflet.draw.js"></script>
    <script src="${resource(dir: 'js/ala', file: 'bootstrap.js')}"></script>
    <script src="${resource(dir: 'js', file: 'bootstrap-tpls.js')}"></script>
    <script src="${resource(dir: 'js', file: 'Google.js')}"></script>
    <script src="${resource(dir: 'js', file: 'slider.js')}"></script>
    <script src="${resource(dir: 'js', file: 'leaflet.label.js')}"></script>
    <script src="${resource(dir: 'js', file: 'jquery.csv.js')}"></script>
    <script src="${resource(dir: 'js', file: 'leaflet-geodesy.js')}"></script>

    <script src="${resource(dir: 'js/portal', file: 'infoPanel.js')}"></script>

    <link rel="stylesheet" href="${resource(dir: 'css', file: 'jquery.css')}" type="text/css">
    <link rel="stylesheet" href="${resource(dir: 'css', file: 'leaflet.css')}" type="text/css">
    <link rel="stylesheet" href="${resource(dir: 'css', file: 'leaflet.label.css')}" type="text/css">
    <link rel="stylesheet" href="${resource(dir: 'css', file: 'font-awesome-4.3.0.css')}" type="text/css">
    <link rel="stylesheet" href="${resource(dir: 'css', file: 'bootstrap.min.css')}" type="text/css">
    <link rel="stylesheet" href="${resource(dir: 'css', file: 'ala-styles.css')}" type="text/css">
    <link rel="stylesheet" href="${resource(dir: 'css', file: 'new.css')}" type="text/css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/0.2.3/leaflet.draw.css"
          type="text/css">

    <script src="${resource(dir: 'js/portal/controller', file: 'addAreaCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'addLayerCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'addSpeciesCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'addFacetCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'areaReportCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'backgroundProcessCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'basicTilesController.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'csvCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'drawArea.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'envelope.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'exportChecklistCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'exportSampleCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'exportMap.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'exportAreaCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'layoutCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'phyloCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'legend.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'map.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'modalIframeInstanceCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'nearestLocality.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'options.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'speciesInfoCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'tabulateCtrl.js')}"></script>
    <script src="${resource(dir: 'js/portal/controller', file: 'toolAreaReportCtrl.js')}"></script>

    <script src="${resource(dir: 'js/portal/directive', file: 'areaListSelect.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'gazAutoComplete.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'googlePlaces.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'layerAutocomplete.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'layerListSelect.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'layerListUpload.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'selectPhylo.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'listsList.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'menu.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'map.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'sandboxList.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'selectArea.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'selectLayers.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'selectSpecies.js')}"></script>
    <script src="${resource(dir: 'js/portal/directive', file: 'speciesAutoComplete.js')}"></script>

    <script src="${resource(dir: 'js/portal/service', file: 'biocacheService.js')}"></script>
    <script src="${resource(dir: 'js/portal/service', file: 'facetAutocompleteService.js')}"></script>
    <script src="${resource(dir: 'js/portal/service', file: 'gazAutocompleteService.js')}"></script>
    <script src="${resource(dir: 'js/portal/service', file: 'layerDistancesService.js')}"></script>
    <script src="${resource(dir: 'js/portal/service', file: 'layersAutocompleteService.js')}"></script>
    <script src="${resource(dir: 'js/portal/service', file: 'listsService.js')}"></script>
    <script src="${resource(dir: 'js/portal/service', file: 'phyloService.js')}"></script>
    <script src="${resource(dir: 'js/portal/service', file: 'layersService.js')}"></script>
    <script src="${resource(dir: 'js/portal/service', file: 'layoutService.js')}"></script>
    <script src="${resource(dir: 'js/portal/service', file: 'mapService.js')}"></script>
    <script src="${resource(dir: 'js/portal/service', file: 'predefinedAreasService.js')}"></script>
    <script src="${resource(dir: 'js/portal/service', file: 'predefinedLayerListsService.js')}"></script>
    <script src="${resource(dir: 'js/portal/service', file: 'sandboxService.js')}"></script>
    <script src="${resource(dir: 'js/portal/service', file: 'speciesAutoCompleteService.js')}"></script>

    <script src="${resource(dir: 'js/portal', file: 'util.js')}"></script>
    <script src="${resource(dir: 'js/portal', file: 'wellknown.js')}"></script>

</head>

<body>

<div style="width:400px" class="pull-left" ng-controller="LayoutCtrl">

    <div ng-show="panelMode == 'default'">

        <div sp-menu></div>

        <div sp-map></div>

        <div class="row" name="divSelectedLayer" id="legend" style="display:block;overflow:scroll">
            <div class="panel panel-default" style="height:100%">
                <div class="panel-body" style="padding-top:0px;padding-left:5px">
                    <div ng-show="settings().showOptions" style="padding-right:15px">
                        <div sp-options></div>
                    </div>

                    <div sp-legend ng-show="settings().showLegend"></div>
                </div>
            </div>
        </div>
    </div>

    <div ng-if="panelMode == 'area'">
        <div draw-area config='panelData.area'></div>
    </div>

    <div ng-if="panelMode == 'envelope'">
        <div envelope></div>
    </div>

    <div ng-if="panelMode == 'nearestLocality'" nearest-locality>
    </div>

</div>

<div style="margin-left:400px">
    <div class="row" style="margin:0px" ng-controller="BasicTilesController as basicTilesController">
        <leaflet id="map" lf-center="australia" layers="layers" controls="controls" bounds="bounds" defaults="defaults"
                 width="100%" height="480px">
        </leaflet>
    </div>
</div>
</div>

<script>

    var spApp = angular.module('spApp', ["leaflet-directive", 'ngAnimate', 'ui.bootstrap', 'ui.sortable', 'ui.slider',
                'biocache-service', 'facet-auto-complete-service', 'gaz-auto-complete-service', 'layer-distances-service',
                'layers-auto-complete-service', 'layers-service', 'layout-service', 'lists-service', 'map-service',
                'predefined-areas-service', 'predefined-layer-lists-service', 'sandbox-service', 'species-auto-complete-service',
                'area-list-select-directive', 'gaz-auto-complete-directive', 'google-places', 'layer-auto-complete-directive',
                'layer-list-select-directive', 'layer-list-upload-directive', 'lists-list-directive', 'sandbox-list-directive',
                'sp-menu-directive',
                'select-area-directive', 'select-layers-directive', 'select-species-directive', 'species-auto-complete-directive',
                'add-area-ctrl', 'add-layer-ctrl', 'add-species-ctrl', 'area-report-ctrl', 'background-process-ctrl',
                'basic-tiles-controller', 'csv-ctrl', 'export-checklist-ctrl',
                'export-sample-ctrl', 'layout-ctrl', 'modal-iframe-instance-ctrl',
                'legend-directive',
                'sp-map-directive',
                'envelope-directive',
                'draw-area-directive',
                'nearest-locality-directive',
                'sp-options-directive', 'add-facet-ctrl',
                'phylo-service', 'select-phylo-directive', 'phylo-ctrl',
                'export-map-ctrl', 'export-area-ctrl',
                'species-info-ctrl', 'tabulate-ctrl', 'tool-area-report-ctrl'])
            .factory("ConfigService", [function () {
                return {}
            }])

    fetchData().then(bootstrapApplication);

    function fetchData() {
        var initInjector = angular.injector(["ng"]);
        var $http = initInjector.get("$http");
        var $q = initInjector.get("$q");
        var $rootScope = initInjector.get("$rootScope");

        spApp.constant("gLayerDistances", {})

        return $q.all([
        ]).then(function (results) {
        });
    }

    function bootstrapApplication() {
        angular.element(document).ready(function () {
            angular.bootstrap(document, ["spApp"]);
            $("#map").height($(window).height() - $('.navbar-header').height());
            $("#legend").height($(window).height() - $('.navbar-header').height() - 195);
        });
    }

    spApp.config(function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'http://*.ala.org.au/**',
            'http://biocache.ala.org.au/**',
            'http://www.openstreetmap.org/**',
            'http://www.google.com/**',
            'http://local.ala.org.au/**',
            'http://**:**/**'
        ]);
    });
    spApp.config(['$compileProvider',
        function ($compileProvider) {
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|http|https):/);
        }]);


    $(window).on("resize", function () {
        $("#map").height($(window).height() - $('.navbar-header').height());
        $("#legend").height($(window).height() - $('.navbar-header').height() - 195);

    }).trigger("resize");



</script>


</body>
</html>
