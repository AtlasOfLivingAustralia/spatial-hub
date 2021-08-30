package au.org.ala.spatial.portal

import grails.converters.JSON
import groovy.json.JsonSlurper
import org.apache.http.client.methods.HttpGet

class CollectionController {
    def hubWebService

    def list() {
        String url = "${grailsApplication.config.collections.url}/ws/tempDataResource?alaId=" + params.alaId
        def headers = [:]
        headers.put ("apiKey",grailsApplication.config.api_key)
        request.headerNames.each { name -> headers.put(name, request.getHeader(name)) }
        def r = hubWebService.urlResponse(HttpGet.METHOD_NAME, url, null, headers,
               null, true)
        if (r.statusCode == 200) {
            def parser = new JsonSlurper()
            def json = parser.parseText(r.text)
            render json as JSON
        } else {
            def result = [error: 'Cannot fetch list from: ' + url]
            render result as JSON
        }
    }
}
