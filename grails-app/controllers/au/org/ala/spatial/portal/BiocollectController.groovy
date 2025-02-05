package au.org.ala.spatial.portal

import grails.converters.JSON
import grails.util.Holders
import org.apache.http.entity.ContentType


class BiocollectController {
    def webService
    def authService
    String biocollectUrl = Holders.config.biocollect.url

    /**
     * Only proxy allowed methods to BioCollect
     * @return
     */
    def index() {
        String url = URLDecoder.decode(params.url, "UTF-8")
        if (!authService.userId || !isAllowed(url)) {
            notAuthorised()
        } else {
            def r = webService.get(url, [:], ContentType.APPLICATION_JSON, false, true, [:])
            return r
        }
    }

    private boolean isAllowed(url) {
        if (url.startsWith(biocollectUrl)) {
            // must be one of the allowed URLs
            List items = Holders.config.biocollect.areaReport
            for (def item : items) {
                if (item.count && url.startsWith(item.count.replace("_geoSearchJSON_", ""))) {
                    return true
                }
            }
            return false;
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
