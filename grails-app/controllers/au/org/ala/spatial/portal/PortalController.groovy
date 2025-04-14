package au.org.ala.spatial.portal

import au.org.ala.ws.service.WebService
import grails.converters.JSON
import grails.util.Holders
import grails.web.http.HttpHeaders
import org.apache.http.client.methods.HttpGet
import org.apache.http.client.utils.URLEncodedUtils
import org.apache.http.entity.ContentType
import org.springframework.context.i18n.LocaleContextHolder
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.multipart.MultipartHttpServletRequest
import org.apache.http.client.methods.HttpPost
import org.apache.http.message.BasicNameValuePair

import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream

/**
 * Controller for all spatial-hub web services.
 */
class PortalController {

    WebService webService

    def propertiesService

    private def defaultConfigLabel() {
        try {
            "app default: " + new Date(new File(PortalController.classLoader.getResource("menu-config.json").getFile()).lastModified()).toString()
        } catch (Exception e) {
            "app default: " + grailsApplication.metadata['app.version'].toString()
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
                def authDisabled = !grailsApplication.config.security.oidc.enabled
                def userAllowed = userAllowed(config)

                if (authDisabled || userAllowed) {
                    // override config.spApp values with params
                    def spApp = [:]
                    config.spApp.each { k, v ->
                        spApp.put(k, v.class.newInstance(params.get(k, v)))
                    }

                    render(view: 'index',
                            model: [config       : config,
                                    language     : LocaleContextHolder.getLocale()?.getLanguage(),
                                    userId       : userId,
                                    userDetails  : authService.userDetails(),
                                    sessionId    : sessionService.newId(userId),
                                    messagesAge  : messageService.messagesAge,
                                    hub          : hub,
                                    custom_facets: toMapOfLists(config.biocacheService.custom_facets)])
                } else if (!authDisabled && userId == null) {
                    login()
                } else {
                    render status: HttpURLConnection.HTTP_UNAUTHORIZED, model: [config: config, hub: hub]
                }
            }
        }
    }

    private def userAllowed(config) {
        if (!config.user_roles || !grailsApplication.config.security.oidc.enabled) {
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
        redirect(absolute: true, uri: authService.loginUrl(request))
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


//    @ApiOperation(
//            value = "List all sessions for a user",
//            notes = "authenticated user or userId with apiKey",
//            produces = "application/json",
//            code = 200,
//            hidden = true
//    )
//    @ApiResponses([])
//    @ApiImplicitParams([])
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
        // find the authenticated user, or the default user
        def userId
        if (!Holders.config.security.oidc.enabled) {
            userId = portalService.DEFAULT_USER_ID
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
            def json = request.JSON as Map
            def url = "${grailsApplication.config.layersService.url}/shape/upload/wkt"

            webService.proxyPostRequest(response, url, json.toString(), ContentType.APPLICATION_JSON, false, true)
            response.contentType = ContentType.APPLICATION_JSON
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

            // write the file to disk
            MultipartFile mFile = ((MultipartHttpServletRequest) request).getFile('shapeFile')

            String ce = grailsApplication.config.character.encoding

            String url = "${grailsApplication.config.layersService.url}/shape/upload/${type}?" +
                    "name=${URLEncoder.encode((String) params.name, ce)}&" +
                    "description=${URLEncoder.encode((String) params.description, ce)}"

            List files = [mFile]
            def r = webService.postMultipart(url, null, null, files, ContentType.APPLICATION_JSON, false, true)

            if (!r) {
                render [:] as JSON
            } else if (r.error || r.statusCode > 299) {
                log.error("failed ${type} upload: ${r}")
                def msg = r.resp
                Map error = [error: msg.error]
                response.status = r.statusCode
                render error as JSON
            } else {
                def shapeFileId
                if (r?.resp?.id) {
                    shapeFileId = r.resp.id
                }
                def area = r.resp.collect { key, value ->
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

            String url = "${grailsApplication.config.layersService.url}/shape/upload/shp/" +
                    "${json.shpId}/featureIndex"
            def r = webService.post(url, json, null, ContentType.APPLICATION_JSON, false, true)
            response.status = r.statusCode
            render r.resp as JSON
        }
    }

    def postTask() {
        def userId = getValidUserId(params)

        if (!userId) {
            notAuthorised()
        } else {
            def json = request.JSON as Map

            String url = "${grailsApplication.config.layersService.url}/tasks/create?userId=${userId}&sessionId=${params.sessionId}"
            def r = webService.post(url, json, null, ContentType.APPLICATION_JSON, false, true)

            if (r == null) {
                render [:] as JSON
            } else {
                response.status = r.statusCode
                render r.resp as JSON
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

            def r = webService.post("${url}/ws/speciesList/", json)

            if (r == null) {
                def status = response.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR)
                r = [status: status, error: 'Unknown error when creating list']
            }

            def status = r.statusCode
            if (r.statusCode < 200 || r.statusCode > 300) {
                r = [error: r.resp  ]
            }

            render status: status, r.resp as JSON
        }
    }

    def speciesListItems() {
        def userId = getValidUserId(params)

        if (!userId) {
            notAuthorised()
        } else {
            def url = grailsApplication.config.lists.url

            def r = webService.get("${url}/ws/speciesListItems/" + params.id, [:], org.apache.http.entity.ContentType.APPLICATION_JSON, false, true, [:])

            if (r == null) {
                def status = response.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR)
                r = [status: status, error: 'Unknown error when fetching list']
            }

            def status = r.statusCode
            if (r.statusCode < 200 || r.statusCode > 300) {
                r = [error: r.resp  ]
            }

            render status: status, r.resp as JSON
        }
    }

    def speciesList() {
        def userId = getValidUserId(params)

        if (!userId) {
            notAuthorised()
        } else {
            def url = grailsApplication.config.lists.url

            def r = webService.get("${url}/ws/speciesList", [user: params.user ? userId : null, max: params.max], org.apache.http.entity.ContentType.APPLICATION_JSON, false, true, [:])

            if (r == null) {
                def status = response.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR)
                r = [status: status, error: 'Unknown error when fetching list']
            }

            def status = r.statusCode
            if (r.statusCode < 200 || r.statusCode > 300) {
                r = [error: r.resp  ]
            }

            render status: status, r.resp as JSON
        }
    }

    def speciesListInfo() {
        def url = grailsApplication.config.lists.url

        def r = webService.get("${url}/ws/speciesList/${params.listId}".toString(), null, org.apache.http.entity.ContentType.APPLICATION_JSON, false, true, [:])

        if (r == null) {
            def status = response.setStatus(HttpURLConnection.HTTP_INTERNAL_ERROR)
            r = [status: status, error: 'Unknown error when fetching list']
        }

        def status = r.statusCode
        if (r.statusCode < 200 || r.statusCode > 300) {
            r = [error: r.resp  ]
        }

        render status: status, r.resp as JSON
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

            def params = []
            json.each { k, v ->
                if (v instanceof List) {
                    v.each { vv ->
                        params.add(new BasicNameValuePair(String.valueOf(k), String.valueOf(vv)))
                    }
                } else {
                    params.add(new BasicNameValuePair(String.valueOf(k), String.valueOf(v)))
                }
            }

            def body = URLEncodedUtils.format(params, "UTF-8")

            def r = webService.post("${json.bs}/webportal/params", body, null, ContentType.APPLICATION_FORM_URLENCODED, false, false)

            if (r.statusCode >= 400) {
                log.error("Couldn't post $json to ${json.bs}/webportal/params, status code ${r.statusCode}, body: ${new String(r.text ?: "")}")
                def result = ['error': "${r.statusCode} when calling ${json.bs}"]
                render result as JSON, status: 500
            } else {
                // The response is plain text and the webService returns it in a Map as the key of the only element
                value = [qid: new String(((Map) r.resp).keySet().first())] as JSON

                if (r?.resp) {
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
        render(view: 'embedExample',
                model: [config   : config,
                        language : LocaleContextHolder.getLocale()?.getLanguage(),
                        userId   : userId,
                        sessionId: sessionService.newId(userId),
                ])
    }

    private def toList(Object o) {
        if (o == null || org.apache.commons.lang3.StringUtils.isEmpty(o.toString())) {
            return []
        } else if (o instanceof List) {
            return o
        } else if (o.toString().startsWith("[")) {
            // JSON list
            return JSON.parse(o.toString())
        } else {
            // comma delimited
            return Arrays.asList(o.toString().split(","))
        }
    }

    private def toListOfMaps(Object o) {
        if (o == null || o.toString().isEmpty()) {
            return new ArrayList()
        }

        def listOfMaps = toList(o)

        for (def i = 0; i < listOfMaps.size(); i++) {
            listOfMaps.set(i, toMap(listOfMaps.get(i)))
        }

        return listOfMaps
    }

    private def toMap(Object o) {
        if (o == null || o.toString().isEmpty()) {
            return new HashMap()
        }

        def map = o

        if (!(map instanceof Map)) {
            map = JSON.parse(map.toString())
        }

        return map
    }

    private def toMapOfMaps(Object o) {
        if (o == null || o.toString().isEmpty()) {
            return new HashMap()
        }

        def mapOfMaps = toMap(o)

        for (def key : mapOfMaps.keySet) {
            mapOfMaps[key] = toMap(mapOfMaps[key])
        }

        return mapOfMaps
    }

    private def toMapOfLists(Object o) {
        if (o == null || o.toString().isEmpty()) {
            return new HashMap()
        }

        def mapOfLists = toMap(o)

        def result = [:]
        mapOfLists.each { k, v ->
            if (!k.contains('[')) { // exclude odd artifacts
                result[k] = toList(v)
            }
        }


        return result
    }

    def postSandboxFile() {
        def userId = getValidUserId(params)

        if (!userId) {
            notAuthorised()
        } else {
            MultipartFile mFile = ((MultipartHttpServletRequest) request).getFile('file')

            // write mFile to temporary file with the same extension
            File tempFile = File.createTempFile("sandbox", mFile.originalFilename.substring(mFile.originalFilename.lastIndexOf('.')))
            mFile.transferTo(tempFile)

            String ce = grailsApplication.config.character.encoding

            String url = "${grailsApplication.config.layersService.url}/sandbox/upload?name=${URLEncoder.encode((String) params.name, ce)}"
            def r = webService.postMultipart(url, null, null, [tempFile], ContentType.APPLICATION_JSON, false, true)

            if (!r) {
                render [:] as JSON
            } else {
                render r.resp as JSON, status: String.valueOf(r.statusCode)
            }
        }
    }

    def deleteSandboxFile(String id) {
        def userId = getValidUserId(params)

        if (!userId) {
            notAuthorised()
        } else {
            def url = "${grailsApplication.config.layersService.url}/sandbox/delete?id=${id}"
            def r = webService.delete(url, null, ContentType.APPLICATION_JSON, false, true)

            if (!r) {
                render [:] as JSON
            } else {
                response.status = r.statusCode
                if (r.statusCode >= 400) {
                    def resp = [error: "failed to delete"]
                    render resp as JSON
                } else {
                    render r.resp as JSON
                }
            }
        }
    }
}
