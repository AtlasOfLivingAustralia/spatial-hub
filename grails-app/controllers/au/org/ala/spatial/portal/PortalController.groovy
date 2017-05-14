package au.org.ala.spatial.portal

import grails.converters.JSON
import org.apache.commons.io.IOUtils

import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream

class PortalController {

    def hubWebService
    def grailsApplication
    def sessionService
    def messageService
    def authService
    def grailsCacheManager

    static final APP_CONSTANT = 'SPATIAL_PORTAL'

    def index() {
        def userId = authService.getUserId()

        if (params?.silent) {
            render html: "<html>" + (authService.getUserId() != null ? "isLoggedIn" : "isLoggedOut") + "</html>"
        } else if (request.forwardURI.contains(";jsessionid=")) {
            //clean forwards from CAS
            redirect(url: grailsApplication.config.grails.serverURL, params: params)
        } else {
            render(view: "index",
                    model: [config   : grailsApplication.config,
                            userId   : userId,
                            sessionId: sessionService.newId(userId),
                            messagesAge: messageService.messagesAge])
        }
    }

    def resetCache() {
        messageService.updateMessages()

        grailsCacheManager.getCache('qid').clear()
        grailsCacheManager.getCache('proxy').clear()
    }

    def messages() {
        if (!params.id) {
            redirect(action: 'messages', params: [id: messageService.messagesAge])
        }

        //biocache-service facets/i18n
        response.outputStream << "Messages = { messages: "
        response.outputStream << messageService.getMessages()
        response.outputStream << ",get: function(key, _default) { var value = this.messages[key]; if (!value) { if (_default !== undefined) { return _default; } else { return key; } } else { return value } } }; "

        response.contentType= 'text/javascript'
    }

    def listSaves() {
        render sessionService.list(authService.getUserId()) as JSON
    }

    def saveData() {
        def userId = authService.getUserId()

        //use a new id
        def id = sessionService.newId(userId)

        render sessionService.put(id, userId, request.getJSON(), params?.save ?: true) as JSON
    }

    def deleteSaved() {
        def list = sessionService.updateUserSave(params.sessionId, authService.getUserId(), 'delete', null, null)

        render list as JSON
    }

    def getSaved() {
        render sessionService.get(params.sessionId) as JSON
    }

    def wkt() {
        def json = request.getJSON()

        json.putAt('api_key', grailsApplication.config.api_key)

        def r = hubWebService.doPostJSON(grailsApplication.config.layersService.url + "/shape/upload/wkt", json)

        render JSON.parse(r) as JSON
    }

    def shp() {
        def mFile = request.getFile('shapeFile')
        def settings = [api_key: grailsApplication.config.api_key]

        def r = hubWebService.doPostMultiPart(grailsApplication.config.layersService.url + "/shape/upload/shp?api_key=" + grailsApplication.config.api_key, settings, mFile)

        if (!r) {
            render [:] as JSON
        } else if (r.error) {
            log.error("failed shapefile upload: " + r.toString())
            render [:] as JSON
        } else {
            def shapeFileId = r.remove('shp_id')
            def area = r.collect { key, value ->
                [id: (key), values: (value)]
            }
            def msg = [shapeId: shapeFileId, area: area]
            render msg as JSON
        }
    }

    def kml() {
        def mFile = request.getFile('shapeFile')
        def settings = [:]

        def r = hubWebService.doPostMultiPart(grailsApplication.config.layersService.url +
                "/shape/upload/kml?name=${URLEncoder.encode(params.name, 'UTF-8')}&description=${URLEncoder.encode(params.description, 'UTF-8')}",
                settings, mFile)

        if (!r) {
            render [:] as JSON
        } else if (r.error) {
            render r as JSON
        } else {
            def msg = r.collect({ key, value -> [id: value] })
            render msg as JSON
        }
    }

    def createObj() {
        def userId = hubWebService.userId

        if (userId) {
            def json = request.getJSON()

            json.putAt('user_id', userId)
            json.putAt('api_key', grailsApplication.config.api_key)

            def r = hubWebService.doPostJSON(grailsApplication.config.layersService.url + "/shape/upload/shp/${json.getAt('shpId')}/${json.getAt('featureIdx')}", json)

            render JSON.parse(r) as JSON
        } else {
            render [:] as JSON
        }
    }

    def createTask() {
        def json = request.getJSON()

        def userId = authService.userId

        json.putAt('api_key', grailsApplication.config.api_key)

        def r = hubWebService.doPost(grailsApplication.config.layersService.url + "/tasks/create?userId=" + userId + '&sessionId=' + params.sessionId, json)

        if (r == null)
            render [:] as JSON

        render JSON.parse(r) as JSON
    }

    def addNewSpecies() {
        def r

        if (!authService.getUserId()) {
            log.info("UnAuthorized user trying to add new species.")
            response.setStatus(401)
            r = [status: 401, error: "You must be logged in before you can create a new species."]
        } else {
            def json = request.getJSON()

            json.putAt("listType", APP_CONSTANT)

            def url = grailsApplication.config.lists.url

            r = hubWebService.doPostJsonWithAuthentication(url + "/ws/speciesList/", json)

            if (r == null) {
                def status = response.setStatus(500)
                r = [status: status, error: 'Unknown error when creating list']
            } else if (r.error) {
                response.setStatus(r.statusCode)
            } else {
                response.setStatus(200)
            }
        }

        render r as JSON
    }

    def q() {
        def json = request.getJSON()

        //caching
        def value = grailsCacheManager.getCache('qid').get(json)
        if (!value) {
            def r = hubWebService.doPost(json.bs + "/webportal/params", json)

            value = [qid: r] as JSON

            if (value) {
                grailsCacheManager.getCache('qid').put(json, value)
                render(value)
            }
        } else {
            render(value.get())
        }
    }

    def proxy() {
        def url = params.url

        def requestBody = IOUtils.toString(request.getReader()).getBytes("UTF-8")

        String extra = rebuildParameters(request.getParameterMap())
        if (url.contains("?") && extra.startsWith("?")) {
            extra = "&" + extra.substring(1)
        }
        String target = url + extra

        //caching
        if (request.getMethod().equals("GET")) {
            def value = grailsCacheManager.getCache('proxy').get(params.url)
            if (!value) {
                value = fetchAndOutputUrl(target, null, request, requestBody)
                if (value) {
                    grailsCacheManager.getCache('proxy').put(params.url, value)
                }
            }
            response.addHeader("Cache-Control", "max-age=" + 360000 + "public must-revalidate")

            if (value) {
                response.setContentType(value.get().contentType)
                response.outputStream.write(value.get().bytes)
            }
        } else {
            fetchAndOutputUrl(target, response, request, requestBody)
        }
    }

    def viewConfig() {
        def viewConfig = hubWebService.getViewConfig()
        render viewConfig as JSON
    }

    private def rebuildParameters(Map params) {
        StringBuilder uri = new StringBuilder()
        String delim = "?"
        for (Object o : params.entrySet()) {
            Map.Entry entry = (Map.Entry) o
            // skip the url parameter - removal from the map is not allowed
            if (!"url".equalsIgnoreCase((String) entry.getKey())) {
                String[] value = (String[]) entry.getValue()
                try {
                    uri.append(delim).append(entry.getKey()).append("=").append(URLEncoder.encode(value[0], "UTF-8"))
                    delim = "&"
                } catch (UnsupportedEncodingException e) {
                }
            }
        }
        return uri.toString()
    }

    private
    def fetchAndOutputUrl(String url, HttpServletResponse response, HttpServletRequest request, byte[] requestBody) {
        URLConnection con = new URL(url).openConnection()
        InputStream is = null
        try {
            log.debug("will request '" + url + "' from remote server")

            // POST parameters
            if ("POST".equals(request.getMethod())) {
                HttpURLConnection hc = (HttpURLConnection) new URL(url).openConnection()
                if (request.getContentType() != null) {
                    hc.setRequestProperty("Content-Type", request.getContentType())
                }
                hc.setRequestMethod("POST")
                hc.setDoInput(true)
                hc.setDoOutput(true)

                if (requestBody != null && requestBody.length > 0) {
                    hc.getOutputStream().write(requestBody)
                }

                con = hc
            }

            // force the url to be cached by adding/replacing the cache-control header
            if (response) {
                response.addHeader("Cache-Control", "max-age=" + 360000 + "public must-revalidate")

                // restore the MIME type for correct handling
                response.setContentType(con.getContentType())

                response.outputStream << con.getInputStream()
            } else {
                [bytes: IOUtils.toByteArray(con.getInputStream()), contentType: con.getContentType()]
            }
        } catch (IOException e) {
            log.debug("IO error doing remote request: " + e.getMessage())
        } finally {
            if (is != null) {
                try {
                    is.close()
                } catch (IOException e) {
                    log.error("Error closing stream to " + url, e)
                }
            }
        }
    }

    def getSampleCSV() {
        String url = params.url

        if (url && authService.getUserId() &&
                (url.startsWith(grailsApplication.config.biocacheService.url) ||
                        url.startsWith(grailsApplication.config.sandboxService.url))) {
            InputStream stream = new URL(url).openStream()
            try {
                ZipInputStream zis = new ZipInputStream(stream)
                ZipEntry ze
                while ((ze = zis.getNextEntry())) {
                    if (ze.getName().endsWith(".csv") && !ze.getName().endsWith("headings.csv") &&
                            !ze.getName().endsWith("citations.csv")) {
                        //unzip the downloads file
                        response.contentType = "text/csv"
                        response.outputStream << zis
                    }
                }
            } catch (Exception e) {
                log.error("failed to get download: " + url, e)
            } finally {
                if (stream)
                    stream.close()
            }
        }
    }

    def ping() {
        def sessionId = params.sessionId
        def session = request.JSON

        //save session?

        render status: 200
    }
}
