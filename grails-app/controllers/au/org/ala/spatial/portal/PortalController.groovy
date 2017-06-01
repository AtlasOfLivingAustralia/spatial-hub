package au.org.ala.spatial.portal

import grails.converters.JSON
import org.apache.commons.httpclient.methods.StringRequestEntity
import org.apache.http.client.methods.HttpGet
import org.apache.http.client.methods.HttpPost
import org.springframework.web.multipart.MultipartHttpServletRequest
import org.springframework.web.multipart.commons.CommonsMultipartFile
import org.codehaus.groovy.grails.web.servlet.HttpHeaders

import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream

/**
 * Controller for all spatial-hub web services.
 */
class PortalController {

    def hubWebService
    def grailsApplication
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
        response.outputStream << 'Messages = { messages: '
        response.outputStream << messageService.messages
        response.outputStream << ',get: function(key, _default) { var value = this.messages[key]; if (!value) { ' +
                'if (_default !== undefined) { return _default; } else { return key; } } else { return value } } }; '

        response.contentType = 'text/javascript'
    }

    def listSaves() {
        render sessionService.list(authService.userId) as JSON
    }

    def saveAny() {
        //no user id
        def userId = null

        //use a new id
        def id = sessionService.newId(userId)

        render sessionService.put(id, userId, request.JSON, params?.save ?: true) as JSON
    }

    def saveData() {
        def userId = authService.userId

        //use a new id
        def id = sessionService.newId(userId)

        render sessionService.put(id, userId, request.JSON, params?.save ?: true) as JSON
    }

    def deleteSaved() {
        def list = sessionService.updateUserSave(params.sessionId, authService.userId,
                SessionService.TYPE_DELETE, null, null)

        render list as JSON
    }

    def getSaved() {
        render sessionService.get(params.sessionId) as JSON
    }

    def postAreaWkt() {
        def json = request.JSON as Map

        json.api_key = grailsApplication.config.api_key

        def url = "${grailsApplication.config.layersService.url}/shape/upload/wkt"
        def r = hubWebService.urlResponse(HttpPost.METHOD_NAME, url, null, null,
                new StringRequestEntity((json as JSON).toString()))

        render JSON.parse(String.valueOf(r?.text)) as JSON
    }

    def postAreaFile(type) {
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
            def shapeFileId = r.remove('shp_id')
            def area = r.collect { key, value ->
                [id: key, values: value]
            }
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

    def addNewSpecies() {
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

        //caching
        def value = grailsCacheManager.getCache(portalService.caches.QID).get(json)
        if (value) {
            render(value.get())
        } else {
            def r = hubWebService.postUrl("${json.bs}/webportal/params", json)

            value = [qid: r.text] as JSON

            if (value) {
                grailsCacheManager.getCache(portalService.caches.QID).put(json, value)
                render(value)
            }
        }
    }

    def proxy() {
        String url = params.url

        String extra = portalService.rebuildParameters(request.parameterMap, url.contains('?'))
        String target = url + extra

        //use caching for GET requests
        if (request.method == HttpGet.METHOD_NAME) {
            def value = grailsCacheManager.getCache(portalService.caches.PROXY).get(params.url)
            if (value) {
                response.setContentType((String) ((Map) value.get()).contentType)
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

    def viewConfig() {
        def viewConfig = portalService.viewConfig

        response.addHeader(HttpHeaders.CACHE_CONTROL, (String) grailsApplication.config.cache.control)

        render viewConfig as JSON
    }

    def getSampleCSV() {
        String url = params.url

        if (url && authService.userId &&
                (url.startsWith("${grailsApplication.config.biocacheService.url}") ||
                        url.startsWith("${grailsApplication.config.sandboxService.url}"))) {
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
        render status: HttpURLConnection.HTTP_OK
    }
}
