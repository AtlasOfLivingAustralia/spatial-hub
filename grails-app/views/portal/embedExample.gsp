<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <meta name="layout" content="portal"/>
    <title>Atlas of Living Australia | Spatial Portal | Embed Example</title>
</head>

<body>

<script src="${config.grails.serverURL}/portal/messages.js?id=${messagesAge}" type="text/javascript" defer></script>
<script src="https://maps.google.com/maps/api/js?language=en-US&libraries=places&key=${grailsApplication.config.google.apikey}"
        type="text/javascript"></script>

<g:set var="sandboxUrl" value="${config.sandbox.uiUrl}"></g:set>

<script type="text/javascript">
    $SH = {
        baseUrl: '${config.grails.serverURL}',
        biocacheUrl: '${config.biocache.url}',
        biocacheServiceUrl: '${config.biocacheService.url}',
        bieUrl: '${config.bie.baseURL}',
        bieServiceUrl: '${config.bieService.baseURL}',
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
        userId: '${userId}',
        hoverLayers: [],
        proxyUrl: '${createLink(controller: 'portal', action: 'proxy', absolute: true)}',
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
        menu: '${config.grails.serverURL}/portal/config/menu',
        defaultAreas: ${(config.defaultareas as grails.converters.JSON).toString().encodeAsRaw()},
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
        i18n: '${language:"default"}',
        editable: ${params.edit?:'false'}
    };

</script>

<link rel="stylesheet" href="${config.grails.serverURL}/assets/application.css">
<script type="text/javascript" src="${config.grails.serverURL}/assets/application.js"></script>

<sp-app></sp-app>

</body>
</html>