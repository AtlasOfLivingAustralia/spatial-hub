grails.project.groupId = 'au.org.ala' // change this to alter the default package name and Maven publishing destination
appName = 'spatial-hub'

grails.appName = appName

default_config = "/data/${appName}/config/${appName}-config.properties"
if (!grails.config.locations || !(grails.config.locations instanceof List)) {
    grails.config.locations = []
}
if (new File(default_config).exists()) {
    println "[${appName}] Including default configuration file: " + default_config;
    grails.config.locations.add 'file:' + default_config
} else {
    println "[${appName}] No external configuration file defined."
}

// The ACCEPT header will not be used for content negotiation for user agents containing the following strings (defaults to the 4 major rendering engines)
grails.mime.disable.accept.header.userAgents = ['Gecko', 'WebKit', 'Presto', 'Trident']
grails.mime.use.accept.header = true
grails.mime.types = [ // the first one is the default format
                      all          : '*/*', // 'all' maps to '*' or the first available format in withFormat
                      atom         : 'application/atom+xml',
                      css          : 'text/css',
                      csv          : 'text/csv',
                      form         : 'application/x-www-form-urlencoded',
                      html         : ['text/html', 'application/xhtml+xml'],
                      js           : 'text/javascript',
                      json         : ['application/json', 'text/json'],
                      multipartForm: 'multipart/form-data',
                      rss          : 'application/rss+xml',
                      text         : 'text/plain',
                      hal          : ['application/hal+json', 'application/hal+xml'],
                      xml          : ['text/xml', 'application/xml']
]

// Legacy setting for codec used to encode data with ${}
grails.views.default.codec = 'html'

// The default scope for controllers. May be prototype, session or singleton.
// If unspecified, controllers are prototype scoped.
grails.controllers.defaultScope = 'singleton'

//grails.config.locations = [ 'file:/data/spatial-service/config/spatial-service-config.properties']

// GSP settings
grails {
    views {
        gsp {
            encoding = 'UTF-8'
            htmlcodec = 'xml' // use xml escaping instead of HTML4 escaping
            codecs {
                expression = 'html' // escapes values inside ${}
                scriptlet = 'html' // escapes output from scriptlets in GSPs
                taglib = 'none' // escapes output from taglibs
                staticparts = 'none' // escapes output from static template parts
            }
        }
        // escapes all not-encoded output at final stage of outputting
        // filteringCodecForContentType.'text/html' = 'html'
    }
}


grails.converters.encoding = 'UTF-8'
// scaffolding templates configuration
grails.scaffolding.templates.domainSuffix = 'Instance'

// Set to false to use the new Grails 1.2 JSONBuilder in the render method
grails.json.legacy.builder = false
// enabled native2ascii conversion of i18n properties files
grails.enable.native2ascii = true
// packages to include in Spring bean scanning
grails.spring.bean.packages = []
// whether to disable processing of multi part requests
grails.web.disable.multipart = false

// request parameters to mask when logging exceptions
grails.exceptionresolver.params.exclude = ['password']

environments {
    development {
        grails.logging.jul.usebridge = true
        grails.serverURL = 'http://local.ala.org.au:8082/spatial-hub'
    }
    production {
        grails.logging.jul.usebridge = false
        grails.serverURL = 'https://spatial.ala.org.au/spatial-hub'
    }
}

// log4j configuration
log4j = {
    appenders {
        console name: 'stdout', layout: pattern(conversionPattern: '%d %c{1} %m%n')
    }

    error 'org.codehaus.groovy.grails.web.servlet',        // controllers
            'org.codehaus.groovy.grails.web.pages',          // GSP
            'org.codehaus.groovy.grails.web.sitemesh' // layouts
    error 'org.codehaus.groovy.grails.web.mapping.filter', // URL mapping
            'org.codehaus.groovy.grails.web.mapping'        // URL mapping

    error 'org.codehaus.groovy.grails.commons',            // core / classloading
            'org.codehaus.groovy.grails.plugins',            // plugins
            'org.codehaus.groovy.grails.orm.hibernate',      // hibernate integration
            'org.springframework',
            'org.hibernate',
            'net.sf.ehcache.hibernate'
    error 'org', 'net'

    all 'au.org.ala.spatial'
}

/******************************************************************************\
 *  CAS SETTINGS
 *
 *  NOTE: Some of these will be ignored if default_config exists
 \******************************************************************************/
security.cas.casServerName = 'https://auth.ala.org.au'
security.cas.uriFilterPattern = '/portal.*,,/,/alaAdmin,/alaAdmin.*'
security.cas.uriExclusionFilterPattern = '/portal/messages.*,/portal/sessionCache.*,/static.*,/assets.*'
security.cas.authenticateOnlyIfLoggedInFilterPattern = ''
security.cas.loginUrl = 'https://auth.ala.org.au/cas/login'
security.cas.logoutUrl = 'https://auth.ala.org.au/cas/logout'
security.cas.gateway = false
security.cas.casServerUrlPrefix = 'https://auth.ala.org.au/cas'
security.cas.bypass = false // set to true for non-ALA deployment
security.cas.casServerUrlPrefix = 'https://auth.ala.org.au/cas'
security.cas.disableCAS = false

autocompleteUrl = 'https://bie.ala.org.au/ws/search/auto.jsonp'

auth.admin_role = 'ROLE_ADMIN'
app.http.header.userId = 'X-ALA-userId'

headerAndFooter.baseURL = 'https://www2.ala.org.au/commonui-bs3'
ala.baseURL = 'https://www.ala.org.au'
bie.baseURL = 'https://bie.ala.org.au'
bie.searchPath = '/search'
userdetails.baseUrl = 'https://auth.ala.org.au/userdetails'
favicon.url = 'https://www.ala.org.au/wp-content/themes/ala2011/images/favicon.ico'

//layersService.url = 'https://spatial-test.ala.org.au/layers-service/'
layersService.url = 'https://localhost:8085/spatial-service/'
lists.url = 'https://lists.ala.org.au'
collections.url = 'https://collections.ala.org.au'
sandbox.url = 'http://sandbox.ala.org.au/ala-hub'
sandboxService.url = 'http://sandbox.ala.org.au/biocache-service'
sandbox.uiUrl = 'http://sandbox.ala.org.au/datacheck'

gazField = 'cl915'
userObjectsField = 'cl1082'

biocache.url = 'https://biocache.ala.org.au'
biocacheService.url = 'https://biocache.ala.org.au/ws'
sampling.url = 'http://ala-dylan.it.csiro.au/sampling-service'
geoserver.url = 'http://spatial-test.ala.org.au/geoserver'

viewConfig.json = 'view-config.json'
//google.apikey=

sessions.dir = '/data/spatial-hub/sessions'

grails.cache.config = {

    defaults {
        eternal false
        overflowToDisk false
        maxElementsInMemory 20000
        timeToLiveSeconds 3600
    }
    cache {
        name 'viewConfigCache'
        timeToLiveSeconds(3600 * 12)
    }

}

//download source type
skin.fluidLayout = true
skin.layout = 'mainbs3'

logger.baseUrl = 'https://logger.ala.org.au/service'

webservice.readTimeout = 60000
webservice.connectTimeout = 20000

grails.ziplet.urlPatterns = ['/*']
grails.ziplet.enabled = true
grails.ziplet.includeContentTypes = ['text/javascript', 'application/json']

cache.headers.enabled = true

phylolink.url = 'http://phylolink.ala.org.au'

lists.threatenedSpeciesUrl = '/ws/speciesList/?isThreatened=eq:true&isAuthoritative=eq:true'
lists.invasiveSpeciesUrl = '/ws/speciesList/?isInvasive=eq:true&isAuthoritative=eq:true'

bccvl.login.url = 'https://demo.bccvl.org.au/bccvl/oauth2/authorize?client_id=F031d7ce-abb0-11e6-a678-0242ac120005&response_type=token&redirect_uri='
bccvl.post.url = 'https://demo.bccvl.org.au/API/dm/v1/import_ala_data'

keep.alive.timeout.ms = 10000

startup.lat = -25
startup.lng = 131
startup.zoom = 4
startup.baselayer.default = 'google_roadmaps'
startup.baselayers = [
    google_roadmaps: [
        name: 'Streets',
        layerType: 'ROADMAP',
        type: 'google',
        exportType: 'normal',
        link: 'https://www.google.com/intl/en_au/help/terms_maps.html'
    ],
    google_hybrid: [
        name: 'Hybrid',
        layerType: 'HYBRID',
        type: 'google',
        exportType: 'hybrid',
        link: 'https://www.google.com/intl/en_au/help/terms_maps.html'
    ],
    outline: [
        name: 'Outline',
        type: 'wms',
        url: 'https://spatial.ala.org.au/geoserver/gwc/service/wms/reflect?',
        layerParams: [
            layers: 'ALA:world',
            format: 'image/png'
        ],
        exportType: 'outline'
    ],
    osm: [
        name: 'Open Street Map',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        type: 'xyz',
        exportType: 'minimal',
        link: 'https://www.openstreetmap.org/about'
    ],
    google_satellite: [
        name: 'Satellite',
        layerType: 'SATELLITE',
        type: 'google',
        exportType: 'normal',
        link: 'https://www.google.com/intl/en_au/help/terms_maps.html'
    ]
]

grails {
    cache {
        enabled = true
        config {
            diskStore {
                path = "/data/${appName}/cache"
            }

            cache {
                name = 'proxy'
                eternal = false
                overflowToDisk = true
                maxElementsInMemory = 10000
                maxElementsOnDisk = 100000
            }

            cache {
                name = 'qid'
                eternal = false
                overflowToDisk = true
                maxElementsInMemory = 10000
                maxElementsOnDisk = 100000
            }

            defaultCache {
                maxElementsInMemory = 10000
                eternal = false
                timeToIdleSeconds = 120
                timeToLiveSeconds = 120
                overflowToDisk = true
                maxElementsOnDisk = 100000
                diskPersistent = false
                diskExpiryThreadIntervalSeconds = 120
                memoryStoreEvictionPolicy = 'LRU'
            }

            defaults {
                maxElementsInMemory = 10000
                eternal = false
                timeToIdleSeconds = 120
                timeToLiveSeconds = 120
                overflowToDisk = true
                maxElementsOnDisk = 100000
                diskPersistent = false
                diskExpiryThreadIntervalSeconds = 120
                memoryStoreEvictionPolicy = 'LRU'
            }
        }
    }
}

grails.assets.minifyOptions.excludes = ['**/*.min.js']
grails.assets.excludes=['node_modules/**', 'target/**']
grails.assets.plugin.'sandbox-hub'.excludes = ['**/*.*']
grails.assets.plugin.'ala-bootstrap3'.excludes = ['**/*.*']
grails.assets.enableGzip=true
//grails.assets.bundle=true
//grails.assets.minifyJs=true
//grails.assets.minifyCss=true
//grails.assets.enableSourceMaps=true
//grails.assets.maxThreads=4


character.encoding='UTF-8'
cache.control='max-age=36000 public must-revalidate'
http.so.timeout=60000
http.timeout=10000
