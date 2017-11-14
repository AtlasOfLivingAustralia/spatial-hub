<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <meta name="layout" content="portal"/>
    <title>Atlas of Living Australia | Spatial Portal</title>
</head>

<body>

<script src="portal/messages.js?id=${messagesAge}" type="text/javascript" defer></script>
<script src="https://maps.google.com/maps/api/js?language=en-US&libraries=places&key=${grailsApplication.config.google.apikey}" type="text/javascript"></script>

<g:set var="sandboxUrl" value="${grailsApplication.config.sandbox.uiUrl}"></g:set>

<script type="text/javascript">
    $SH = {
        baseUrl: '${config.grails.serverURL}',
        biocacheUrl: '${config.biocache.url}',
        biocacheServiceUrl: '${config.biocacheService.url}',
        bieUrl: '${config.bie.baseURL}',
        layersServiceUrl: '${config.layersService.url}',
        samplingUrl: '${config.sampling.url}',
        listsUrl: '${config.lists.url}',
        sandboxUrl: '${config.sandbox.url}',
        sandboxServiceUrl: '${config.sandboxService.url}',
        sandboxUiUrl: '${config.sandbox.uiUrl}',
        sandboxUrls: ['${config.sandbox.url}'],
        sandboxServiceUrls: ['${config.sandboxService.url}'],
        gazField: '${config.gazField}',
        geoserverUrl: '${config.geoserver.url}',
        collectionsUrl: '${config.collections.url}',
        userObjectsField: '${config.userObjectsField}',
        gazField: '${config.gazField}',
        userId: '${userId}',
        hoverLayers: [],
        proxyUrl: '${createLink(controller: 'portal', action: 'proxy')}',
        url: '${createLink(controller: 'portal', action: 'index')}',
        sessionId: '${sessionId}',
        loginUrl: '${config.loginUrl}?service=',
        phylolinkUrl: '${config.phylolink.url}',
        threatenedQ: '${config.threatenedQ}',
        invasiveQ: '${config.invasiveQ}',
        bccvlLoginUrl: '${config.bccvl.login.url}',
        bccvlPostUrl: '${config.bccvl.post.url}',
        keepAliveTimeout: '${config.keep.alive.timeout.ms}',
        defaultLat: ${config.startup.lat},
        defaultLng: ${config.startup.lng},
        defaultZoom: ${config.startup.zoom},
        baseLayers: ${(config.startup.baselayers as grails.converters.JSON).toString().encodeAsRaw()},
        defaultBaseLayer: '${config.startup.baselayer.default}',
        validUrls: [
            'self',
            'http://*.ala.org.au/**',
            'https://*.ala.org.au/**',
            'https://www.openstreetmap.org/**',
            'https://www.google.com/**',
            'http://zoatrack.org/**',
            '${config.grails.serverURL}/**',
            '${config.biocache.url}/**',
            '${config.biocacheService.url}/**',
            '${config.bie.baseURL}/**',
            '${config.layersService.url}/**',
            '${config.lists.url}/**',
            '${config.sandbox.url}/**',
            '${config.sandboxService.url}/**',
            '${config.geoserver.url}/**',
            '${config.collections.url}/**',
            '${config.phylolink.url}/**'
        ],
        i18n: '${config.i18n?.region?:"default"}'
    };

    BIE_VARS = {
        autocompleteUrl: '${config.autocompleteUrl}'
    };

    var SANDBOX_CONFIG = {
        autocompleteColumnHeadersUrl: '${sandboxUrl}/dataCheck/autocomplete',
        biocacheServiceUrl: '${grailsApplication.config.biocacheServiceUrl}',
        chartOptionsUrl: '${sandboxUrl}/myDatasets/chartOptions',
        deleteResourceUrl: '${sandboxUrl}/myDatasets/deleteResource',
        getAllDatasetsUrl: '${sandboxUrl}/myDatasets/allDatasets',
        getDatasetsUrl: '${sandboxUrl}/myDatasets/userDatasets',
        keepaliveUrl: '${sandboxUrl}/dataCheck/ping',
        loginUrl: '${grailsApplication.config.casServerLoginUrl}?service=${createLink(uri: '/', absolute: true)}',
        parseColumnsUrl: '${sandboxUrl}/dataCheck/parseColumns',
        processDataUrl: '${sandboxUrl}/dataCheck/processData',
        reloadDataResourceUrl: '${sandboxUrl}/dataCheck/reload',
        saveChartOptionsUrl: '${sandboxUrl}/myDatasets/saveChartOptions',
        uploadCsvUrl: '${sandboxUrl}/dataCheck/uploadFile',
        uploadToSandboxUrl: '${sandboxUrl}/dataCheck/upload',
        uploadStatusUrl: '${sandboxUrl}/dataCheck/uploadStatus',
        userId: '${u.userId()}',
        roles:<u:roles />
    };
</script>

<div class="page-loading">
    <div class="progress">
        <div class="progress-bar progress-bar-info progress-bar-striped" role="progressbar" aria-valuenow="100"
             aria-valuemin="0" aria-valuemax="100">
            <span class="sr-only">Loading...</span>
        </div>
    </div>
</div>

<div style="width:410px;padding-left:25px;overflow-y:visible;overflow-x:visible" class="pull-left" ng-controller="LayoutCtrl" id="left-panel">

    <div ng-show="panelMode[0] == 'default'">
        <div id="spMenu" sp-menu></div>
        <div class="ui-layout-container" id="defaultPanel" style="height:500px;width:400px;margin-left:-15px;">
            <div class="ui-layout-center ui-layout-pane ui-layout-pane-center">
                <div class="row" sp-map style="margin-left:15px;margin-right: 0px;height:100%;"></div>
            </div>

            <div class="ui-layout-south ui-layout-pane ui-layout-pane-south" name="divSelectedLayer" id="legend"
                 ng-show="showOptions[0] || showLegend[0]"
                 style="display:block;overflow:hidden;background-color: #fff;height:100%">
                <div class="col-md-12" style="padding-left:0px;padding-right:0px;height:100%;padding-bottom:10px">
                    <div class="panel panel-default" style="overflow:hidden;height:100%">
                        <div class="panel-heading">
                            <i style="float:right" class="glyphicon glyphicon-menu-down" ng-click="toggleOptions(false)"></i>
                            <h3 class="panel-title">
                                <div ng-show="showOptions[0]">Edit map options</div>
                                <div ng-show="showLegend[0]">Edit layer options</div>
                            </h3>
                        </div>
                        <div class="panel-body" style="padding-left:5px;overflow:scroll;height:100%;">
                            <div sp-options ng-show="showOptions[0]" style="padding-right:15px"></div>
                            <div sp-legend ng-show="showLegend[0]"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div ng-if="panelMode[0] == 'area'" draw-area config='panelData.area'></div>
    <div ng-if="panelMode[0] == 'envelope'" envelope></div>
    <div ng-if="panelMode[0] == 'nearestLocality'" nearest-locality></div>
    <div ng-if="panelMode[0] == 'pointComparison'" point-comparison></div>
</div>

<div style="margin-left:420px" id="right-panel">
    <area-create style="height:500px;width:500px;"></area-create>
    <div class="row" style="margin:0px" ng-controller="LeafletMapController as leafletMapController">
        <leaflet id="map" lf-center="australia" layers="layers" controls="controls"
                 bounds="bounds" defaults="defaults" width="100%" height="480px">
            <leaflet-quick-links></leaflet-quick-links>
        </leaflet>
    </div>
</div>

<div style="display:none" id="loginWorkaround"></div>

</body>
</html>
