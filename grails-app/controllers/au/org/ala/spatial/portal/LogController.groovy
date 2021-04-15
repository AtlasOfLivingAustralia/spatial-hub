package au.org.ala.spatial.portal

import grails.converters.JSON
import org.apache.commons.httpclient.methods.StringRequestEntity
import org.apache.http.client.methods.HttpPost
import org.apache.http.client.methods.HttpGet

class LogController {
    def hubWebService
    static allowedMethods = [index:'POST', search:'GET']

    def index() {
        String url = "${grailsApplication.config.layersService.url}/log/"
        def json = request.JSON as Map

        def headers = [:]
        headers.put("apiKey",grailsApplication.config.api_key)
        request.headerNames.each { name -> headers.put(name, request.getHeader(name)) }

        def r = hubWebService.urlResponse(HttpPost.METHOD_NAME, url, null, headers,
                new StringRequestEntity((json as JSON).toString()))
        render status: r.statusCode
    }

    def search() {
        String url = "${grailsApplication.config.layersService.url}/log/search"
        def json = request.JSON as Map

        def headers = [:]
        headers.put("apiKey",grailsApplication.config.api_key)
        request.headerNames.each { name -> headers.put(name, request.getHeader(name)) }

        def r = hubWebService.urlResponse(HttpGet.METHOD_NAME, url, null, headers,
                new StringRequestEntity((json as JSON).toString()))

        response.status = r.statusCode
        render JSON.parse(new String(r?.text ?: "")) as JSON
    }

}
