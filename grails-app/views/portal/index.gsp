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
        ]
    };

    BIE_VARS = {
        autocompleteUrl: '${config.autocompleteUrl}'
    }

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

<div style="width:400px" class="pull-left" ng-controller="LayoutCtrl" id="left-panel">
    <div ng-show="panelMode[0] == 'default'">
        <div sp-menu></div>
        <div sp-map></div>
        <div class="row" name="divSelectedLayer" id="legend" style="display:block;overflow:scroll;background-color: #fff">
            <ala:systemMessage/>
            <div class="panel panel-default" style="box-shadow: 0 0px; border: 0">
                <div class="panel-body" style="padding-top:0px;padding-left:5px">
                    <div ng-show="showOptions[0]" style="padding-right:15px" sp-options></div>
                    <div sp-legend ng-show="showLegend[0]"></div>
                </div>
            </div>
        </div>
    </div>
    <div ng-if="panelMode[0] == 'area'" draw-area config='panelData.area'></div>
    <div ng-if="panelMode[0] == 'envelope'" envelope></div>
    <div ng-if="panelMode[0] == 'nearestLocality'" nearest-locality></div>
    <div ng-if="panelMode[0] == 'pointComparison'" point-comparison></div>
</div>

<div style="margin-left:400px" id="right-panel">
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
