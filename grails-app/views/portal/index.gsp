<%@ page import="grails.converters.JSON" %>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <meta name="layout" content="${grailsApplication.config.skin.layout}"/>
    <title>${grailsApplication.config.skin.orgNameLong} | Spatial Portal</title>
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
        default_facets_ignored: '${config.biocacheService.default_facets_ignored}',
        custom_facets: ${(config.biocacheService.custom_facets as grails.converters.JSON).toString().encodeAsRaw()},
        bieUrl: '${config.bie.baseURL}',
        bieServiceUrl: '${config.bieService.baseURL}',
        layersServiceUrl: '${config.layersService.url}',
        samplingUrl: '${config.sampling.url}',
        listsUrl: '${config.lists.url}',
        listsFacets: ${config.lists.facets},
        sandboxUrl: '${config.sandbox.url}',
        sandboxServiceUrl: '${config.sandboxService.url}',
        sandboxUiUrl: '${config.sandbox.uiUrl}',
        sandboxUrls: ['${config.sandbox.url}'],
        sandboxServiceUrls: ['${config.sandboxService.url}'],
        gazField: '${config.gazField}',
        geoserverUrl: '${config.geoserver.url}',
        collectionsUrl: '${config.collections.url}',
        userObjectsField: '${config.userObjectsField}',
        userId: '${userId}',
        hoverLayers: [],
        proxyUrl: '${createLink(controller: 'portal', action: 'proxy', absolute: true)}',
        url: '${createLink(controller: 'portal', action: 'index')}',
        sessionId: '${sessionId}',
        loginUrl: '${config.loginUrl}?service=',
        phylolinkUrl: '${config.phylolink.url}',
        threatenedQ: '${config.threatenedQ}',
        invasiveQ: '${config.invasiveQ}',
        migratoryDR: '${config.lists.migratoryDR}',
        iconicSpeciesDR: '${config.lists.iconicSpeciesDR}',
        journalMapUrl: '${config.journalmap.url}',
        bccvlLoginUrl: '${config.bccvl.login.url}',
        bccvlPostUrl: '${config.bccvl.post.url}',
        keepAliveTimeout: '${config.keep.alive.timeout.ms}',
        defaultLat: ${config.startup.lat},
        defaultLng: ${config.startup.lng},
        defaultZoom: ${config.startup.zoom},
        baseLayers: ${(config.startup.baselayers as grails.converters.JSON).toString().encodeAsRaw()},
        defaultBaseLayer: '${config.startup.baselayer.default}',
        flickrUrl: '${config.flickr.url}',
        flickrLicensesInfo: '${config.flickr.licensesInfo}',
        flickrSearchPhotos: '${config.flickr.searchPhotos}',
        flickrApiKey: '${config.flickr.apiKey}',
        flickrTags: '${config.flickr.tags}',
        flickrExtra: '${config.flickr.extra}',
        flickrContentType: '${config.flickr.contentType}',
        flickrGeoContext: '${config.flickr.geoContext}',
        flickrFilter: '${config.flickr.filter}',
        flickrNbrOfPhotosToDisplay: '${config.flickr.nbrOfPhotosToDisplay}',
        menu: '${config.grails.serverURL}/portal/config/menu',
        defaultAreas: ${(config.defaultareas as grails.converters.JSON).toString().encodeAsRaw()},
        defaultSpeciesDotSize: ${config.speciesDotSize},
        defaultSpeciesDotOpacity: ${config.speciesDotOpacity},
        presetWMSServers: ${(config.presetWMSServers as grails.converters.JSON).toString().encodeAsRaw()},
        getMapExamples: ${(config.getMapExamples as grails.converters.JSON).toString().encodeAsRaw()},

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
        i18n: '${config.i18n?.region?:"default"}',
        editable: ${params.edit?:'false'}
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

<sp-app></sp-app>

</body>
</html>
