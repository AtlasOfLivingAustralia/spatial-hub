package au.org.ala.spatial.portal

import grails.converters.JSON
import org.apache.http.client.methods.HttpGet
import grails.util.Holders


class BiocollectController {
    def hubWebService
    def authService
    def allowCalls = ["/acsa/nocas/geoService"]
    String biocollectUrl = Holders.config.biocollect.url

    /**
     * Only proxy allowed methods to BioCollect
     * @return
     */
    def index() {
        String url = URLDecoder.decode(params.url, "UTF-8")
        if (!authService.userId && isAllowed(url)) {
            notAuthorised()
        } else {
            def headers = [:]
            headers.put ("apiKey",grailsApplication.config.api_key)
            def r = hubWebService.urlResponse(HttpGet.METHOD_NAME, url, null, headers)
            return r
        }
    }

    private boolean isAllowed(url) {
        if (url.startsWith(biocollectUrl)) {
            //url.matches(".*(?i)(Nocas|test).*")
            String pattern = ".*(?i)("+ allowCalls.join("|") +").*"
            return url.matches(pattern)
        } else {
            return false
        }

    }

    private def notAuthorised() {
        response.setStatus(HttpURLConnection.HTTP_UNAUTHORIZED)
        def r = [error: 'User is not authorized or this service call is not permitted to server: ' + biocollectUrl]
        render r as JSON
    }
}
