package au.org.ala.spatial.portal

import au.org.ala.admin.AlaAdminController

class UrlMappings {

    static mappings = {

        "/hub/$hub"(controller: "portal", action: "index")

        "/sandbox"(controller: "portal", action: "postSandboxFile", method: "POST")
        "/sandbox"(controller: "portal", action: "deleteSandboxFile", method: "DELETE")

        "/$controller/$action?/$id?(.$format)?" {
            constraints {
                // apply constraints here
            }
        }

        "/admin"(controller:AlaAdminController, action:"index")

        "/docs"(redirect: "/static/index.html")

        "/"(controller: "portal", action: "index")
        "500"(view: '/error')
        "401"(view: '/accessDenied')
        "404"(view: '/error')
    }
}
