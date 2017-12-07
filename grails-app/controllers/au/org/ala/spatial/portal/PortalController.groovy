package au.org.ala.spatial.portal

import grails.converters.JSON
import org.apache.commons.httpclient.methods.StringRequestEntity
import org.apache.commons.io.FileUtils
import org.apache.http.client.methods.HttpGet
import org.apache.http.client.methods.HttpPost
import grails.web.http.HttpHeaders
import org.springframework.web.multipart.MultipartHttpServletRequest
import org.springframework.web.multipart.commons.CommonsMultipartFile

import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream

/**
 * Controller for all spatial-hub web services.
 */
class PortalController {

    def propertiesService

    def defaultConfigLabel() {
        try {
            "app default: " + new Date(new File(PortalController.classLoader.getResource("menu-config.json").getFile()).lastModified()).toString()
        } catch (Exception e) {
            "app default: " + grailsApplication.metadata['app.version'].toString()
        }
    }

    def editConfig (String id) {
        def type = ["view", "menu"].contains(id) ? id : "view"
        def currentJSON = portalService.getConfig(type, false)
        def config = (currentJSON as JSON).toString(true)
        def error = ""
        if (request.isPost() && params.config) {
            def newJSON = null
            try {
                newJSON = JSON.parse(params.config)
                config = (newJSON as JSON).toString(true)
            } catch (Exception e) {
                error = "Invalid json. " + e.toString()
                config = params.config
            }
            if (!error && newJSON != null) {
                if (!equals(currentJSON, newJSON)) {
                    //backup
                    def current = new File("/data/spatial-hub/config/" + type + "-config.json")
                    def backup = new File("/data/spatial-hub/config/" + type + "-config." + (new Date()).toString() + ".json")

                    if (current.exists()) {
                        FileUtils.copyFile(current, backup)
                    }

                    //write new
                    FileUtils.writeStringToFile(current, params.config)

                    //update cache
                    grailsCacheManager.getCache("configCache").clear()

                    error = "Saved"
                } else {
                    error = "No change"
                }
            }
        }

        render(view: "editConfig", model: [config: (config), type: type, error: error,
                                           versions: new File("/data/spatial-hub/config").listFiles().findAll { file -> file.name.startsWith(type)} +
                                                   defaultConfigLabel()])
    }

    private boolean equals(a, b) {
        if (a instanceof Map && b instanceof Map) {
            if (!((Map)a).keySet().containsAll(((Map)b).keySet()) ||
                    !((Map)b).keySet().containsAll(((Map)a).keySet())) return false
            ((Map)a).every { equals(it.value, ((Map)b)[it.key]) }
        } else if (a instanceof List && b instanceof List) {
            boolean eq = true
            a.eachWithIndex { def v, int i -> if (eq && !equals(v, b[i])) eq = false }
            eq
        } else {
            a == b
        }
    }

    static allowedMethods = [index:['GET'],
                             messages:['GET'],
                             session: ['POST', 'DELETE', 'GET'],
                             sessions: 'GET',
                             sessionCache: 'POST',
                             resetCache:['GET'],
                             postAreaWkt: 'POST',
                             postAreaFile: 'POST',
                             postArea: 'POST',
                             postTask: 'POST',
                             postSpeciesList: 'POST',
                             q: 'POST',
                             proxy: ['GET', 'POST'],
                             config: 'GET',
                             getSampleCSV: 'GET',
                             ping: 'POST']

    def hubWebService
//    def grailsApplication
    def sessionService
    def messageService
    def authService
    def grailsCacheManager
    def portalService

    def index() {
        def userId = authService.userId

        if (params?.silent) {
            render html: '<html>' + (authService.userId != null ? 'isLoggedIn' : 'isLoggedOut') + '</html>'
        } else if (request.forwardURI.contains(';jsessionid=')) {
            //clean forwards from CAS
            redirect(url: grailsApplication.config.grails.serverURL, params: params)
        } else {
            render(view: 'index',
                    model: [config   : grailsApplication.config,
                            userId   : userId,
                            sessionId: sessionService.newId(userId),
                            messagesAge: messageService.messagesAge])
        }
    }

    def resetCache() {
        messageService.updateMessages()

        grailsCacheManager.getCache(portalService.caches.QID).clear()
        grailsCacheManager.getCache(portalService.caches.QID).clear()
    }

    def messages() {
        if (!params.id) {
            redirect(action: 'messages', params: [id: messageService.messagesAge])
        }

        //biocache-service facets/i18n
        String text = 'Messages = { messages: ' +
                messageService.messages +
                ',get: function(key, _default) { var value = this.messages[key]; if (!value) { ' +
                'if (_default !== undefined) { return _default; } else { return key; } } else { return value } } }; '
        response.outputStream << text

        response.contentType = 'text/javascript'
    }

    def sessions() {
        render sessionService.list(authService.userId) as JSON
    }

    def sessionCache(Long sessionId) {
        //TODO: validate sessionId

        //no user id
        def userId = null

        //use a new id
        def id = sessionService.newId(userId)

        render sessionService.put(id, userId, request.JSON, false) as JSON
    }

    def session(Long sessionId) {
        if (request.method == 'POST') {
            //save
            render sessionService.put(sessionService.newId(authService.userId), authService.userId, request.JSON,
                    true) as JSON
        } else if (request.method == 'DELETE') {
            //delete
            render sessionService.updateUserSave(sessionId, authService.userId,
                    SessionService.TYPE_DELETE, null, null) as JSON
        } else if (request.method == 'GET') {
            //retrieve
            render sessionService.get(sessionId) as JSON
        }
    }

    def postAreaWkt() {
        def json = request.JSON as Map

        json.api_key = grailsApplication.config.api_key

        def url = "${grailsApplication.config.layersService.url}/shape/upload/wkt"
        def r = hubWebService.urlResponse(HttpPost.METHOD_NAME, url, null, null,
                new StringRequestEntity((json as JSON).toString()))

        render JSON.parse(String.valueOf(r?.text)) as JSON
    }

    def postAreaFile(String id) {
        def type = id
        def mFile = ((MultipartHttpServletRequest) request).getFile('shapeFile')
        def settings = [api_key: grailsApplication.config.api_key]

        String ce = grailsApplication.config.character.encoding

        def r = hubWebService.postUrl("${grailsApplication.config.layersService.url}/shape/upload/${type}?" +
                "name=${URLEncoder.encode((String) params.name, ce)}&" +
                "description=${URLEncoder.encode((String) params.description, ce)}&" +
                "api_key=${grailsApplication.config.api_key}", (Map) settings, null, (CommonsMultipartFile) mFile)

        if (!r) {
            render [:] as JSON
        } else if (r.error) {
            log.error("failed ${type} upload: ${r}")
            render [:] as JSON
        } else {
            def json = JSON.parse(String.valueOf(r?.text))
            def shapeFileId = json.id
            def area = json.collect { key, value ->
                if (key == 'shp_id') {
                    shapeFileId = value
                    null
                } else {
                    [id: key, values: value]
                }
            }
            area.remove(null)
            def msg = [shapeId: shapeFileId, area: area]
            render msg as JSON
        }
    }

    def postArea() {
        def userId = authService.userId

        if (userId) {
            def json = request.JSON as Map

            json.user_id = userId
            json.api_key = grailsApplication.config.api_key

            String url = "${grailsApplication.config.layersService.url}/shape/upload/shp/" +
                    "${json.shpId}/${json.featureIdx}"

            def r = hubWebService.urlResponse(HttpPost.METHOD_NAME, url, null, null,
                    new StringRequestEntity((json as JSON).toString()))

            render JSON.parse(String.valueOf(r?.text)) as JSON
        } else {
            render [:] as JSON
        }
    }

    def postTask() {
        def json = request.JSON as Map

        def userId = authService.userId

        json.api_key = grailsApplication.config.api_key

        def r = hubWebService.postUrl("${grailsApplication.config.layersService.url}/tasks/create?" +
                "userId=${userId}&sessionId=${params.sessionId}", json)

        if (r == null) {
            render [:] as JSON
        } else {
            render JSON.parse(String.valueOf(r?.text)) as JSON
        }
    }

    def postSpeciesList() {
        def r

        if (authService.userId) {
            def json = request.JSON as Map

            json.listType = PortalService.APP_CONSTANT

            def url = grailsApplication.config.lists.url

            def header = [:]
            def userId = authService.userId
            if (userId) {
                header.put(grailsApplication.config.app.http.header.userId, userId)
                header.put('Cookie', 'ALA-Auth=' + URLEncoder.encode(authService.email, 'UTF-8'))
            }

            r = hubWebService.urlResponse(HttpPost.METHOD_NAME, "${url}/ws/speciesList/", null, header,
                    new StringRequestEntity((json as JSON).toString()), true)

            if (r == null) {
                def status = response.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR)
                r = [status: status, error: 'Unknown error when creating list']
            } else if (r.error) {
                response.setStatus((int) r.statusCode)
            } else {
                response.setStatus(HttpURLConnection.HTTP_OK)
            }
        } else {
            log.info('UnAuthorized user trying to add new species.')
            response.setStatus(HttpURLConnection.HTTP_UNAUTHORIZED)
            r = [status: HttpURLConnection.HTTP_UNAUTHORIZED, error:
                    'You must be logged in before you can create a new species.']
        }

        render r as JSON
    }

    def q() {
        def json = (Map) request.JSON
        //{"q":"species_list:dr1782","bs":"https://biocache.ala.org.au/ws","fq":["geospatial_kosher:true"]}

        //caching
        def value = grailsCacheManager.getCache(portalService.caches.QID).get(json)
        if (value) {
            render value.get()
        } else {
            //remove null fqs
            if (json?.fq) {
                def nFqs = json?.fq?.findAll()
                json.fq = nFqs
            }
            //move q with qid to fq
            if (json.q?.contains("qid:")) {
                if (json?.fq?.size() > 0) {
                    def tmp = json.fq[0]
                    json.fq[0] = json.q
                    json.q = tmp
                } else if (json?.wkt || json?.qc) {
                    json.fq = [json.q]
                    json.q = '*:*'
                } else {
                    value = [qid: json.q.replaceFirst("qid:", "")] as JSON
                    render value
                }
            }

            def r = hubWebService.postUrl("${json.bs}/webportal/params", json)

            if (r.statusCode >= 400) {
                log.error("Couldn't post $json to ${json.bs}/webportal/params, status code ${r.statusCode}, body: ${r.text}")
                def result = ['error': "${r.statusCode} when calling ${json.bs}"]
                render result as JSON, status: 500
            } else {
                value = [qid: r.text] as JSON

                if (r?.text) {
                    grailsCacheManager.getCache(portalService.caches.QID).put(json, value)
                }

                render value
            }
        }
    }

    def proxy() {
        String url = params.url

        String extra = portalService.rebuildParameters(request.parameterMap, url.contains('?'))
        String target = url + extra

        //use caching for GET requests
        if (request.method == HttpGet.METHOD_NAME) {
            def value = null;//grailsCacheManager.getCache(portalService.caches.PROXY).get(params.url)
            if (value) {
                response.setContentType((String) ((Map) value.get()).contentType)
                ((Map) value.get()).headers.each { k, v ->
                    response.setHeader(k, v)
                }
                response.outputStream << String.valueOf(((Map) value.get()).text)
            } else {def headers = [:]
                request.headerNames.each { name -> headers.put(name, request.getHeader(name)) }


                value = hubWebService.getUrlMap(target, headers)
                if (value) {
                    grailsCacheManager.getCache(portalService.caches.PROXY).put(params.url, value)
                    response.setContentType(String.valueOf(value.contentType))
                    response.outputStream << String.valueOf(value.text)
                }
            }
        } else {
            def stream = hubWebService.getStream(url, HttpPost.METHOD_NAME, request.contentType, request.inputStream)

            def contentType = stream.call.getResponseHeader(HttpHeaders.CONTENT_TYPE).value
            if (contentType) {
                response.setContentType(contentType)
            }

            response.outputStream << stream.stream

            hubWebService.closeStream(stream)
        }

        response.addHeader(HttpHeaders.CACHE_CONTROL, (String) grailsApplication.config.cache.control)
    }

    def config(String id) {
        def type = ["view", "menu"].contains(id) ? id : "view"
        def config = portalService.getConfig(type, params?.version?.equalsIgnoreCase(defaultConfigLabel())?:false)

        if (params.version && !params.version.equalsIgnoreCase(defaultConfigLabel())) {
            if (params.version != "current" && params.version != "json") {
                def file = new File("/data/spatial-hub/config/" + type + "-config." + params.version + ".json")

                if (file.exists()) {
                    config = JSON.parse(new FileReader(file))
                } else {
                    config = ""
                }
            }
        } else {
            response.addHeader(HttpHeaders.CACHE_CONTROL, (String) grailsApplication.config.cache.control)
        }

        if (params.text=="true") {
            response.setContentType("text/plain")
            response.outputStream << (config as JSON).toString(true)
        } else {
            render config as JSON
        }
    }

    def getSampleCSV() {
        String url = params.url

        if (url && authService.userId) {
            InputStream stream = new URL(url).openStream()
            try {
                ZipInputStream zis = new ZipInputStream(stream)
                ZipEntry ze
                while ((ze = zis.nextEntry) != null) {
                    if (ze.name.endsWith('.csv') && !ze.name.endsWith('headings.csv') &&
                            !ze.name.endsWith('citations.csv')) {
                        //unzip the downloads file
                        response.contentType = 'text/csv'
                        response.outputStream << zis
                    }
                }
            } catch (IOException e) {
                log.error('failed to get download: ' + url, e)
            } finally {
                if (stream) {
                    stream.close()
                }
            }
        }
    }

    def ping() {
        response.addHeader("content-type", "application/json")
        render status: HttpURLConnection.HTTP_OK, text: "{}"
    }

    def i18n() {
        Map m = [:]

        if (request.isPost()) {
            def json = request.JSON;
            propertiesService.set(params.lang, json.key, json.value)
        } else {
            def p = propertiesService.get(params.lang)
            m.putAll(p)
        }

        render m as JSON
    }
}
