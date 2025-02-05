package au.org.ala.spatial.portal

import grails.converters.JSON
import org.apache.http.entity.ContentType

class CollectionController {
    def webService

    // used to find the data resources for deprecated sandbox uploads
    def list() {
        String url = "${grailsApplication.config.collections.url}/ws/tempDataResource?alaId=" + params.alaId
        def r = webService.get(url, [:], ContentType.APPLICATION_JSON, false, true, [:])
        if (r.statusCode == 200) {
            render r.resp as JSON
        } else {
            def result = [error: 'Cannot fetch list from: ' + url]
            render result as JSON
        }
    }
}
