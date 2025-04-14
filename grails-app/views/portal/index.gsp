<%@ page import="grails.converters.JSON" %>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <meta name="layout" content="${config.skin.layout}"/>
    <title>Spatial Portal | ${config.skin.orgNameLong}</title>

    <g:if test="${hub != null}">
        <asset:stylesheet href="hub/${hub}.css"/>
    </g:if>
</head>

<body>

<script src="${config.grails.serverURL}/portal/messages.js?id=${messagesAge}" type="text/javascript" defer></script>
<g:if test="${config.google?.apikey != null}">
    <script src="https://maps.google.com/maps/api/js?language=en-US&libraries=places&key=${config.google.apikey}"
    type="text/javascript"></script>
</g:if>

<g:set var="sandboxUrl" value="${config.sandbox.uiUrl}"></g:set>

<script type="text/javascript" asset-defer="false">
    $SH = {
        hub: '${hub}',
        enviroment:'${grails.util.Environment.current}',
        baseUrl: '${config.grails.serverURL}',
        biocacheUrl: '${config.biocache.url}',
        biocacheServiceUrl: '${config.biocacheService.url}',
        default_facets_ignored: '${config.biocacheService.default_facets_ignored}',
        custom_facets: ${(custom_facets as grails.converters.JSON).toString().encodeAsRaw()},
        bieUrl: '${config.bie.baseURL}',
        bieServiceUrl: '${config.bieService.baseURL}',
        namematchingUrl: '${config.namematching.baseURL}',
        layersServiceUrl: '${config.layersService.url}',
        samplingUrl: '${config.sampling.url}',
        listsUrl: '${config.lists.url}',
        listsFacets: ${config.lists.facets},
        sandboxUrl: '${config.sandbox.url}',
        sandboxServiceUrl: '${config.sandboxService.url}',
        sandboxUiUrl: '${config.sandbox.uiUrl}',
        sandboxUrls: ['${config.sandbox.url}'],
        sandboxServiceUrls: ['${config.sandboxService.url}'],
        sandboxSpatialUiUrl: '${config.sandboxSpatial.hubUrl}',
        sandboxSpatialServiceUrl: '${config.sandboxSpatial.serviceUrl}',
        gazField: '${config.gazField}',
        geoserverUrl: '${config.geoserver.url}',
        collectionsUrl: '${config.collections.url}',
        userObjectsField: '${config.userObjectsField}',
        userId: '${userId}',
        userDisplayName: '${userDetails?.displayName ?: ""}', // Used to pre-populate DOI metadata for CSDM
        userOrganisation: '${userDetails?.organisation ?: ""}', // Used to pre-populate DOI metadata for CSDM
        userEmail: '${raw(userDetails?.email ?: "")}',
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
        bccvlLoginUrl: '${config.bccvl.login.url.toString().encodeAsRaw()}',
        bccvlPostUrl: '${config.bccvl.post.url.toString().encodeAsRaw()}',
        keepAliveTimeout: '${config.keep.alive.timeout.ms}',
        defaultLat: ${config.startup.lat},
        defaultLng: ${config.startup.lng},
        defaultZoom: ${config.startup.zoom},
        baseLayers: ${(config.startup.baselayers as grails.converters.JSON).toString().encodeAsRaw()},
        defaultBaseLayer: '${config.startup.baselayer.default}',

        i18n: '${language}',

        <g:if test="${config.flickr.url}">
        flickrUrl: '${config.flickr.url}',
        flickrLicensesData: ${(config.flickr.licensesData as grails.converters.JSON).toString().encodeAsRaw()},
        flickrSearchPhotos: '${config.flickr.searchPhotos}',
        flickrApiKey: '${config.flickr.apiKey}',
        flickrTags: '${config.flickr.tags}',
        flickrExtra: '${config.flickr.extra}',
        flickrContentType: '${config.flickr.contentType}',
        flickrGeoContext: '${config.flickr.geoContext}',
        flickrFilter: '${(config.flickr.filter?:'').toString().encodeAsRaw()}',
        flickrNbrOfPhotosToDisplay: '${config.flickr.nbrOfPhotosToDisplay}',
        </g:if>

        menu: '${config.grails.serverURL}/portal/config/menu?hub=${hub}',
        defaultAreas: ${(config.defaultareas as grails.converters.JSON).toString().encodeAsRaw()},
        defaultSpeciesDotSize: ${config.speciesDotSize},
        defaultSpeciesDotOpacity: ${config.speciesDotOpacity},
        presetWMSServers: ${(config.presetWMSServers as grails.converters.JSON).toString().encodeAsRaw()},
        getMapExamples: ${(config.getMapExamples as grails.converters.JSON).toString().encodeAsRaw()},



        <g:if test="${config.doiService?.url}">
        doiServiceUrl: '${config.doiService.url}',
        </g:if>

        <g:if test="${config.doiService?.searchFilter}">
        doiSearchFilter: '${config.doiService.searchFilter}',
        </g:if>

        <g:if test="${config.doiService?.displayTemplate}">
        doiDisplayTemplate: '${config.doiService.displayTemplate}',
        </g:if>

        <g:if test="${config.doiService?.emailTemplate}">
        doiEmailTemplate: '${config.doiService.emailTemplate}',
        </g:if>
        <g:if test="${config.doiService?.sourceTypeId}">
        doiSourceTypeId: '${config.doiService.sourceTypeId}',
        </g:if>
        <g:if test="${config.doiService?.hubName}">
        doiHubName: '${config.doiService.hubName}',
        </g:if>
        <g:if test="${config.doiService?.reasonTypeId}">
        doiReasonTypeId: '${config.doiService.reasonTypeId}',
        </g:if>

        annotateDatasetOnExport: ${Boolean.valueOf(config.annotateDatasetOnExport)},
        qc: '${config.qc}',

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
            <g:if test="${config.doiService?.url}">
            , '${config.doiService.url}/**'
            </g:if>
        ],

        editable: ${params.edit?:'false'},
        wmsIntersect: ${config.wms.intersect},
        projections: ${(config.projections as grails.converters.JSON).toString().encodeAsRaw()},
        projection: '${config.projection.default}',
        fqExcludeAbsent: '${config.fq.excludeAbsent}',
        biocollectUrl: '${config.biocollect.url}',
        biocollectLoginUrl: '${config.biocollect.loginUrl}',
        biocollectReport: ${(config.biocollect.areaReport as grails.converters.JSON).toString().encodeAsRaw()},
        lifeforms: ${(config.lifeforms as grails.converters.JSON).toString().encodeAsRaw()},

        config: ${(config.spApp as grails.converters.JSON).toString().encodeAsRaw()},

        rangeDataTypes: ${(config.rangeDataTypes as grails.converters.JSON).toString().encodeAsRaw()},
        numberOfIntervalsForRangeData: ${(config.numberOfIntervalsForRangeData).toString().encodeAsRaw()},

        dateFacet: '${config.date.facet}',
        dateMin: '${config.date.min}',
        dateMax: '${config.date.max}'

        /**
         * Override the list of grouped facets from biocache-service (biocacheService.url/search/grouped/facets).
         *
         * This is used in a drop down list within the 'Edit species layer' section that is used to  colour or facet
         * upon the species layer.
         */
        <g:if test="${config.get('groupedFacets', null) != null}">
        , groupedFacets: ${(config.groupedFacets as grails.converters.JSON).toString().encodeAsRaw()}
        </g:if>

        /**
         * Remove fields that are retrieved from biocache-service (biocacheService.url/search/grouped/facets) and
         * (biocacheService.url/index/fields)
         */
        <g:if test="${config.get('fieldsIgnored', null) != null}">
        , fieldsIgnored: ${(config.fieldsIgnored as grails.converters.JSON).toString().encodeAsRaw()}
        </g:if>

        /**
         * Include or Exclude the 'Search facets...' option. This is used in a drop down list within
         * the 'Edit species layer' section that is used to colour or facet upon the species layer.
         */
        , facetSearch: '${config.facet.search}'

        /**
         * Include or Exclude the grouped facet listing. These grouped facets appear at the end of the drop down list
         * within the 'Edit species layer' section that is used to colour or facet upon the species layer.
         */
        , facetList: '${config.facet.list}'

        /**
         * Enabled multiple species layer filters within the 'Edit species layer' section.
         */
        , filtersEnabled: ${config.filters.enabled}

        /**
         * Enable workflow button in the header
         */
        , workflowEnabled: ${config.workflow.enabled}

        /**
         * List of public workflow Ids for the species filter
         */
        , workflowFilters: ${(config.workflow.speciesFilters as grails.converters.JSON).toString().encodeAsRaw()}

        , maxUploadSize: ${config.grails.controllers.upload.maxFileSize}
    };

    if (!$SH.i18n) {
        if (( navigator.language || navigator.browserLanguage).startsWith('en')) {
            $SH.i18n = 'default';
        } else if ((navigator.language || navigator.browserLanguage).startsWith('de')) {
            $SH.i18n = 'de';
        } else {
            $SH.i18n = navigator.language || navigator.browserLanguage;
        }
    }


    BIE_VARS = {
        autocompleteUrl: '${config.autocompleteUrl}'
    };

    SANDBOX_CONFIG = {
        autocompleteColumnHeadersUrl: '${sandboxUrl}/dataCheck/autocomplete',
        biocacheServiceUrl: '${config.biocacheServiceUrl}',
        chartOptionsUrl: '${sandboxUrl}/myDatasets/chartOptions',
        deleteResourceUrl: '${sandboxUrl}/myDatasets/deleteResource',
        getAllDatasetsUrl: '${sandboxUrl}/myDatasets/allDatasets',
        getDatasetsUrl: '${sandboxUrl}/myDatasets/userDatasets',
        keepaliveUrl: '${sandboxUrl}/dataCheck/ping',
        loginUrl: '${config.casServerLoginUrl}?service=${createLink(uri: '/', absolute: true)}',
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
<asset:javascript src="application.js"/>

<sp-app></sp-app>
</body>
</html>
