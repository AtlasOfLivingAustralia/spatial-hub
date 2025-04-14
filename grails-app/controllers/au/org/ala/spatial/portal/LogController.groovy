package au.org.ala.spatial.portal

import grails.converters.JSON
import org.apache.commons.httpclient.methods.StringRequestEntity
import org.apache.http.client.methods.HttpPost
import org.apache.http.client.methods.HttpGet
import org.apache.http.entity.ContentType

class LogController {
    def webService
    static allowedMethods = [index:'POST', search:'GET']

    /**
     * Post log
     * @return
     */
    def index() {
        String url = "${grailsApplication.config.layersService.url}/log"

        Map map = [data: (request.JSON as Map)]
        def r = webService.post(url, map, null, ContentType.APPLICATION_JSON, false, true)

        render status: r.statusCode
    }

    def search() {
        String url = "${grailsApplication.config.layersService.url}/log/search"

        Map inputs = params as Map
        def r = webService.get(url, inputs, ContentType.APPLICATION_JSON, false, true)

        response.status = r.statusCode
        render r.resp as JSON
    }
}
