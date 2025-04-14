package au.org.ala.spatial.portal

import grails.converters.JSON
import org.apache.http.entity.ContentType

class WorkflowController {
    def webService

    static allowedMethods = [
            save: 'POST',
            show: 'GET',
            delete: 'GET',
            search: 'GET'
    ]

    def save() {
        String url = "${grailsApplication.config.layersService.url}/workflow/save"
        def json = request.JSON
        def r = webService.post(url, json, null, ContentType.APPLICATION_JSON, false, true, [:])

        if (r.statusCode == 200) {
            render r.resp as JSON
        } else {
            def result = [error: 'Cannot save workflow']
            render result as JSON
        }
    }

    def show(Long id) {
        String url = "${grailsApplication.config.layersService.url}/workflow/show/${id}"
        def r = webService.get(url, [workflow: params.workflow], ContentType.APPLICATION_JSON, false, true, [:])

        if (r.statusCode == 200) {
            render r.resp as JSON
        } else {
            def result = [error: 'Cannot show workflow']
            render result as JSON
        }
    }

    def delete(Long id) {
        String url = "${grailsApplication.config.layersService.url}/workflow/delete/${id}"
        def r = webService.get(url, null, ContentType.APPLICATION_JSON, false, true, [:])

        if (r.statusCode == 200) {
            render r.resp as JSON
        } else {
            def result = [error: 'Cannot delete workflow']
            render result as JSON
        }
    }

    def search() {
        String url = "${grailsApplication.config.layersService.url}/workflow/search"
        def params = [q: params.q, start: params.start, limit: params.limit]
        def r = webService.get(url, params, ContentType.APPLICATION_JSON, false, true, [:])

        if (r.statusCode == 200) {
            render r.resp as JSON
        } else {
            def result = [error: 'Cannot search workflow']
            render result as JSON
        }
    }
}
