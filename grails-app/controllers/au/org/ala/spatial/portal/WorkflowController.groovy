package au.org.ala.spatial.portal

import grails.converters.JSON
import org.apache.http.entity.ContentType

class WorkflowController {
    def webService
    def authService

    def delete(String id) {
        if (!authService.userId && (grailsApplication.config.security.oidc.enabled || grailsApplication.config.security.cas.enabled)) {
            render(status: 401, text: "Unauthorised")
            return
        }
        String url = grailsApplication.config.layersService.url + "/workflow/delete/${URLEncoder.encode(id, "UTF-8")}"
        def r = webService.get(url, null, ContentType.APPLICATION_JSON, false, true)

        response.status = r.statusCode
        render r.resp as JSON
    }

    def save() {
        if (!authService.userId && (grailsApplication.config.security.oidc.enabled || grailsApplication.config.security.cas.enabled)) {
            render(status: 401, text: "Unauthorised")
            return
        }
        String url = grailsApplication.config.layersService.url + "/workflow/save"
        def r = webService.post(url, request.JSON, null, ContentType.APPLICATION_JSON, false, true)

        response.status = r.statusCode
        render r.resp as JSON
    }

    def search() {
        if (!authService.userId && (grailsApplication.config.security.oidc.enabled || grailsApplication.config.security.cas.enabled)) {
            render(status: 401, text: "Unauthorised")
            return
        }

        String url = grailsApplication.config.layersService.url + "/workflow/search"
        def r = webService.get(url, params, ContentType.APPLICATION_JSON, false, true)

        response.status = r.statusCode
        render r.resp as JSON
    }

    def show(String id) {
        if (!authService.userId && (grailsApplication.config.security.oidc.enabled || grailsApplication.config.security.cas.enabled)) {
            render(status: 401, text: "Unauthorised")
            return
        }
        String url = grailsApplication.config.layersService.url + "/workflow/show/${URLEncoder.encode(id, "UTF-8")}"
        def r = webService.get(url, params, ContentType.APPLICATION_JSON, false, true)

        response.status = r.statusCode
        render r.resp as JSON
    }
}
