package au.org.ala.spatial.portal

import grails.converters.JSON
import grails.util.Holders
import grails.web.http.HttpHeaders
import io.swagger.annotations.ApiImplicitParams
import io.swagger.annotations.ApiOperation
import io.swagger.annotations.ApiResponses
import org.apache.commons.httpclient.HttpStatus
import org.apache.commons.httpclient.methods.StringRequestEntity
import org.apache.commons.io.FileUtils
import org.apache.commons.lang.StringUtils
import org.apache.http.client.methods.HttpGet
import org.apache.http.client.methods.HttpPost
import org.jasig.cas.client.util.CommonUtils
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.multipart.MultipartHttpServletRequest

import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream

/**
 * Controller for all spatial-hub web services.
 */
class PortalController {

    def propertiesService

    private def defaultConfigLabel() {
        try {
            "app default: " + new Date(new File(PortalController.classLoader.getResource("menu-config.json").getFile()).lastModified()).toString()
        } catch (Exception e) {
            "app default: " + grailsApplication.metadata['app.version'].toString()
        }
    }

    def editConfig(String id) {
        def userId = getValidAdminUserId(params)

        if (!userId) {
            notAuthorised()
        } else {
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

            def availableVersions = new File("/data/spatial-hub/config").listFiles().findAll {
                file -> file.name.startsWith(type)
            }.toString() + defaultConfigLabel()

            render(view: "editConfig", model: [config  : (config), type: type, error: error,
                                               versions: availableVersions])
        }
    }

    private boolean equals(a, b) {
        if (a instanceof Map && b instanceof Map) {
            if (!((Map) a).keySet().containsAll(((Map) b).keySet()) ||
                    !((Map) b).keySet().containsAll(((Map) a).keySet())) return false
            ((Map) a).every { equals(it.value, ((Map) b)[it.key]) }
        } else if (a instanceof List && b instanceof List) {
            boolean eq = true
            a.eachWithIndex { def v, int i -> if (eq && !equals(v, b[i])) eq = false }
            eq
        } else {
            a == b
        }
    }

    static allowedMethods = [index          : ['GET'],
                             editConfig     : ['GET', 'POST'],
                             i18n           : ['GET', 'POST'],
                             messages       : ['GET'],
                             session        : ['POST', 'DELETE', 'GET'],
                             sessions       : 'GET',
                             sessionCache   : 'POST',
                             resetCache     : ['GET'],
                             postAreaWkt    : 'POST',
                             postAreaFile   : 'POST',
                             postArea       : 'POST',
                             postTask       : 'POST',
                             postSpeciesList: 'POST',
                             q              : 'POST',
                             proxy          : ['GET', 'POST'],
                             config         : 'GET',
                             getSampleCSV   : 'GET',
                             ping           : 'POST']

    def hubWebService
    def sessionService
    def messageService
    def authService
    def grailsCacheManager
    def portalService

    def index() {
        def userId = getValidUserId(params)

        def hub = params.hub

        if (params?.silent) {
            render html: '<html>' + (authService.userId != null ? 'isLoggedIn' : 'isLoggedOut') + '</html>'
        } else if (request.requestURL.contains(';jsessionid=')) {
            //clean forwards from CAS
            def queryParams = (request.queryString) ? '?' + request.queryString : ''
            redirect(url: request.requestURL.toString().replaceAll(';jsessionid=.*', '') + queryParams)
        } else {
            def config = portalService.getAppConfig(hub)
            if (!config && hub) {
                render status: HttpURLConnection.HTTP_NOT_FOUND, model: [config: config, hub: hub]
            } else {
                // test for user_role
                def authDisabled = grailsApplication.config.security.cas.bypass || grailsApplication.config.security.cas.disableCAS
                def userAllowed = userAllowed(config)

                if (authDisabled || userAllowed) {
                    // override config.spApp values with params
                    def spApp = [:]
                    config.spApp.each { k, v ->
                        spApp.put(k, v.class.newInstance(params.get(k, v)))
                    }
                    config.spApp = spApp

                    render(view: 'index',
                            model: [config     : config,
                                    userId     : userId,
                                    userDetails: authService.userDetails(),
                                    sessionId  : sessionService.newId(userId),
                                    messagesAge: messageService.messagesAge,
                                    hub        : hub])
                } else if (!authDisabled && userId == null) {
                    login()
                } else {
                    render status: HttpURLConnection.HTTP_UNAUTHORIZED, model: [config: config, hub: hub]
                }
            }
        }
    }

    private def userAllowed(config) {
        if (!config.user_roles || grailsApplication.config.security.cas.bypass || grailsApplication.config.security.cas.disableCAS) {
            return true
        }
        for (role in config.user_roles) {
            if (authService.userInRole(role) || ("*".equals(role) && authService.userId)) {
                return true
            }
        }
        return false
    }

    private def login() {
        // redirect to login page
        String serverName = grailsApplication.config.security.cas.appServerName
        def protocol = org.jasig.cas.client.Protocol.CAS2
        String service = null

        def requestURL = CommonUtils.constructServiceUrl(request, response, service, serverName, protocol.getServiceParameterName(), protocol.getArtifactParameterName(), true);

        redirect(url: grailsApplication.config.security.cas.loginUrl + "?service=" + URLEncoder.encode(requestURL, "UTF-8"))
    }

    def resetCache() {
        def adminUserId = getValidAdminUserId(params)
        def userId = getValidUserId(params)

        if (!userId) {
            // redirect to login page
            login()
        } else if (!adminUserId) {
            render status: HttpURLConnection.HTTP_UNAUTHORIZED, model: [config: grailsApplication.config]
        } else {
            messageService.updateMessages()
            portalService.updateListQueries()

            grailsCacheManager.getCache(portalService.caches.QID).clear()
            grailsCacheManager.getCache(portalService.caches.PROXY).clear()
            grailsCacheManager.getCache('configCache').clear()

            def r = [message: 'caches cleared']
            render r as JSON
        }
    }

    def messages() {
        // when missing, redirect and apply parameter 'id' for browser caching purposes
        if (!params.id) {
            redirect(action: 'messages', params: [id: messageService.messagesAge])
        }

        response.contentType = 'text/javascript'

        String text = 'BiocacheI18n = { messages: ' +
                messageService.messages +
                ',get: function(key, _default) { var value = this.messages[key]; if (!value) { ' +
                'if (_default !== undefined) { return _default; } else { return key; } } else { return value } } }; '

        response.outputStream << text
    }


    @ApiOperation(
            value = "List all sessions for a user",
            notes = "authenticated user or userId with apiKey",
            produces = "application/json",
            code = 200,
            hidden = true
    )
    @ApiResponses([])
    @ApiImplicitParams([])
    def sessions() {
        render sessionService.list(getValidUserId(params)) as JSON
    }

    /**
     * Get the userId
     *
     * @param params
     * @return DEFAULT_USER_ID when CAS is disabled, params.userId whend params.apiKey is valid, logged in userId or
     * null when not logged in
     */
    private def getValidUserId(params) {
        //apiKey + userId (non-numeric) OR authenticated user
        def userId
        if (Holders.config.security.cas.disableCAS || Holders.config.security.cas.bypass) {
            userId = portalService.DEFAULT_USER_ID
        } else if (portalService.isValidApiKey(params.apiKey) && !StringUtils.isNumeric(params.userId)) {
            userId = params.userId
        } else {
            userId = authService.userId
        }

        userId
    }

    private def getValidAdminUserId(params) {
        def userId = getValidUserId(params)

        if (authService.userInRole(Holders.config.admin_role)) {
            userId
        } else {
            userId
        }
    }

    def sessionCache(Long sessionId) {
        //use a new id
        def id = sessionService.newId(null)

        render sessionService.put(id, null, request.JSON, false) as JSON
    }

    @ApiOperation(
            value = "Authenticated peristant session service.",
            produces = "application/json",
            consumes = "application/json",
            code = 200
    )
    @ApiResponses([])
    @ApiImplicitParams([])
    def session(Long id) {
        def userId = getValidUserId(params)
        if (userId){
            if (request.method == 'POST') {
                //save
                render sessionService.put(sessionService.newId(userId), userId, request.JSON, true) as JSON
            } else if (request.method == 'DELETE') {
                //delete
                render sessionService.updateUserSave(id, userId, SessionService.DELETE, null, null) as JSON
            } else if (request.method == 'GET') {
                //retrieve
                render sessionService.get(id) as JSON
            }
        } else {
            response.status = 403
            Map error = [error : "Login required!"]
            render error as JSON
        }
    }

    private def notAuthorised() {
        response.setStatus(HttpURLConnection.HTTP_UNAUTHORIZED)
        def r = [error: 'not permitted']
        render r as JSON
    }

    def postAreaWkt() {
        def userId = getValidUserId(params)

        if (!userId) {
            notAuthorised()
        } else {
            Map headers = [apiKey: grailsApplication.config.api_key]
            def json = request.JSON as Map
            def url = "${grailsApplication.config.layersService.url}/shape/upload/wkt"
            def r = hubWebService.urlResponse(HttpPost.METHOD_NAME, url, null, headers,
                    new StringRequestEntity((json as JSON).toString()))
            response.status = r.statusCode
            render JSON.parse(new String(r?.text ?: "")) as JSON
        }
    }


    private String getWkt(objectId) {
        String wkt = null

        try {
            if (objectId != null) {
                String url = "${grailsApplication.config.layersService.url}/shapes/wkt/" + objectId
                wkt = hubWebService.getUrl(url, null, false)
            }
        } catch (err) {
            log.error "failed to lookup object wkt: ${objectId}", err
        }
        wkt
    }

    def postAreaFile(String id) {
        def userId = getValidUserId(params)

        if (!userId) {
            notAuthorised()
        } else {
            def type = id
            MultipartFile mFile = ((MultipartHttpServletRequest) request).getFile('shapeFile')
            def settings = [api_key: grailsApplication.config.api_key]

            String ce = grailsApplication.config.character.encoding

            def r = hubWebService.postUrl("${grailsApplication.config.layersService.url}/shape/upload/${type}?" +
                    "name=${URLEncoder.encode((String) params.name, ce)}&" +
                    "description=${URLEncoder.encode((String) params.description, ce)}&" +
                    "api_key=${grailsApplication.config.api_key}", null, settings, mFile);

            if (!r) {
                render [:] as JSON
            } else if (r.error || r.statusCode > 299) {
                log.error("failed ${type} upload: ${r}")
                def msg = JSON.parse(new String(r?.text ?: "{}"))
                Map error = [error: msg.error]
                response.status = r.statusCode
                render error as JSON
            } else {
                def json = JSON.parse(new String(r?.text ?: "{}"))
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
    }

    def postArea() {
        def userId = authService.userId

        if (!userId) {
            notAuthorised()
        } else{
            def json = request.JSON as Map
            json.user_id = userId
            Map headers = [apiKey: grailsApplication.config.api_key]
            String url = "${grailsApplication.config.layersService.url}/shape/upload/shp/" +
                    "${json.shpId}/${json.featureIdx}"
            def r = hubWebService.urlResponse(HttpPost.METHOD_NAME, url, null, headers,
                    new StringRequestEntity((json as JSON).toString()))
            response.status = r.statusCode
            render JSON.parse(new String(r?.text ?: "{}")) as JSON
        }
    }

    def postTask() {
        def userId = getValidUserId(params)

        if (!userId) {
            notAuthorised()
        } else {
            def json = request.JSON as Map

            Map headers = [apiKey: grailsApplication.config.api_key]

            def r = hubWebService.postUrl("${grailsApplication.config.layersService.url}/tasks/create?" +
                    "userId=${userId}&sessionId=${params.sessionId}", json, headers)

            if (r == null) {
                render [:] as JSON
            } else {
                response.status = r.statusCode
                render JSON.parse(new String(r?.text ?: "{}")) as JSON
            }
        }
    }

    def postSpeciesList() {
        def userId = getValidUserId(params)

        if (!userId) {
            notAuthorised()
        } else {
            def json = request.JSON as Map

            def url = grailsApplication.config.lists.url

            def header = [:]
//            if (!Holders.config.security.cas.disableCAS) {
//                header.put(grailsApplication.config.app.http.header.userId, userId)
//                header.put('Cookie', 'ALA-Auth=' + URLEncoder.encode(authService.email, 'UTF-8'))
//            }

            def r = hubWebService.urlResponse(HttpPost.METHOD_NAME, "${url}/ws/speciesList/", null, header,
                    new StringRequestEntity((json as JSON).toString()), true)

            if (r == null) {
                def status = response.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR)
                r = [status: status, error: 'Unknown error when creating list']
            } else if (r.error) {
                response.setStatus((int) r.statusCode)
            } else {
                response.setStatus(HttpURLConnection.HTTP_OK)
            }

            render r as JSON
        }
    }

    def q() {
        def json = (Map) request.JSON

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
                    log.error(getWkt(json?.wkt))
                    json.fq = [json.q]
                    json.q = '*:*'
                } else {
                    value = [qid: json.q.replaceFirst("qid:", "")] as JSON
                    render value
                }
            }

            // if wkt is a number, it's a pid
            if (json?.wkt?.isNumber()) {
                json.wkt = getWkt(json?.wkt)
            }

            def r = hubWebService.postUrl("${json.bs}/webportal/params", json)

            if (r.statusCode >= 400) {
                log.error("Couldn't post $json to ${json.bs}/webportal/params, status code ${r.statusCode}, body: ${new String(r.text ?: "")}")
                def result = ['error': "${r.statusCode} when calling ${json.bs}"]
                render result as JSON, status: 500
            } else {
                value = [qid: new String(r.text)] as JSON

                if (r?.text) {
                    grailsCacheManager.getCache(portalService.caches.QID).put(json, value.toString())
                }

                render value
            }
        }
    }

    /**
     * Status code returned from proxied url will be stored in response body
     *
     * For example:
     *
     * if a proxied server return status code 401, the status code will be wrapped into  statusCode field in body
     * and returned to client with status 200
     *
     * @return
     */
    def proxy() {
        def userId = getValidUserId(params)

        if (!userId) {
            notAuthorised()
        } else if (!portalService.canProxy(params.url)) {
            response.setStatus(HttpURLConnection.HTTP_UNAUTHORIZED)
            def r = [error: 'url not permitted']
            render r as JSON
        } else {
            String url = params.url

            String extra = portalService.rebuildParameters(request.parameterMap, url.contains('?'))
            String target = url
            if (extra) {
                if (url.contains('?')) {
                    target += "&" + extra
                } else {
                    target += "?" + extra
                }
            }

            response.addHeader(HttpHeaders.CACHE_CONTROL, (String) grailsApplication.config.cache.headers.control)

            //use caching for GET requests
            if (request.method == HttpGet.METHOD_NAME) {
                def value = grailsCacheManager.getCache(portalService.caches.PROXY).get(target)
                if (value) {
                    response.setContentType((String) ((Map) value.get()).contentType)
                    ((Map) value.get()).headers.each { k, v ->
                        response.setHeader(k, v)
                    }
                    if (((Map) value.get()).contentType.startsWith("image")) {
                        response.outputStream << ((Map) value.get()).text
                    } else {
                        response.outputStream << new String(((Map) value.get()).text)
                    }
                } else {
                    def headers = [:]
                    request.headerNames.each { name -> headers.put(name, request.getHeader(name)) }

                    value = hubWebService.getUrlMap(target, headers)
                    if (value) {
                        grailsCacheManager.getCache(portalService.caches.PROXY).put(target, value)
                        response.setContentType(String.valueOf(value.contentType))
                        if (value.contentType.startsWith("image")) {
                            response.outputStream << value.text
                        } else {
                            response.outputStream << new String(value.text)
                        }
                    }
                }
            } else {
                def stream = hubWebService.getStream(url, HttpPost.METHOD_NAME, request.contentType, request.inputStream)

                def contentType = stream.call.getResponseHeader(HttpHeaders.CONTENT_TYPE)?.value
                if (contentType) {
                    response.setContentType(contentType)
                }

                response.outputStream << stream.stream

                hubWebService.closeStream(stream)
            }
        }
    }

    def config(String id) {
        def userId = getValidUserId(params)

        def hub = params.hub

        if (!userId && !userAllowed(portalService.getAppConfig(hub))) {
            notAuthorised()
        } else {
            def type = ["view", "menu"].contains(id) ? id : "view"
            def config = portalService.getConfig(type, params?.version?.equalsIgnoreCase(defaultConfigLabel()) ?: false, hub)

            if (params.version && !params.version.equalsIgnoreCase(defaultConfigLabel())) {
                if (params.version != "current" && params.version != "json") {
                    def file = new File("/data/spatial-hub/config/" + (hub != null ? hub + "/" : "") + type + "-config." + params.version + ".json")

                    if (file.exists()) {
                        config = JSON.parse(new FileReader(file))
                    } else {
                        config = "{}"
                    }
                }
            } else {
                response.addHeader(HttpHeaders.CACHE_CONTROL, (String) grailsApplication.config.cache.headers.control)
            }

            if (params.text == "true") {
                response.setContentType("text/plain")
                response.outputStream << (config as JSON).toString(true)
            } else {
                render config as JSON
            }
        }
    }

    def getSampleCSV() {
        String url = params.url
        def userId = getValidUserId(params)

        if (!userId || !portalService.canProxy(url)) {
            notAuthorised()
        } else {
            InputStream stream = new URL(url).openStream()
            byte[] buff = new byte[16384];
            try {
                ZipInputStream zis = new ZipInputStream(stream)
                ZipEntry ze
                while ((ze = zis.nextEntry) != null) {
                    if (ze.name.endsWith('.csv') && !ze.name.endsWith('headings.csv') &&
                            !ze.name.endsWith('citations.csv')) {
                        //unzip the downloads file
                        //response.outputStream << zis
                        int size;
                        while ((size = zis.read(buff)) != -1) {
                            response.outputStream.write(buff, 0, size);
                        }
                        response.contentType = 'text/csv'
                        response.outputStream.flush()
                        response.outputStream.close();
                    }
                }
            } catch (IOException e) {
                log.error('failed to get download: ' + url, e)
                throw "Failed to download " + url + " (Error: " + e + " )";
            } catch (Exception e) {
                log.error(e)
                throw "Error occurs in getting samples :" + e;
            }
            finally {
                if (stream)
                    stream.close()
            }
        }
    }


    def ping() {
        response.addHeader("content-type", "application/json")
        render status: HttpURLConnection.HTTP_OK, text: "{}"
    }

    def i18n() {
        if (request.isPost()) {
            def userId = getValidAdminUserId(params)
            if (!userId) {
                notAuthorised()
            } else {
                def json = request.JSON;
                def oldValue = propertiesService.get(params.lang).get(json.key)
                propertiesService.set(params.lang, json.key, json.value)
                Map m = [message: 'value changed', oldValue: oldValue, newValue: json.value, key: json.key]
                render m as JSON
            }
        } else {
            def p = propertiesService.get(params.lang)
            Map m = [:]
            m.putAll(p)
            render m as JSON
        }
    }

    def embedExample() {
        render(view: 'embedExample')
    }
}
