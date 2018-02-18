package au.org.ala.spatial.portal

import au.org.ala.admin.AlaAdminController

class UrlMappings {

    static mappings = {

        "/$controller/$action?/$id?(.$format)?" {
            constraints {
                // apply constraints here
            }
        }

        "/admin"(controller:AlaAdminController, action:"index")

        "/docs"(redirect: "/static/index.html")

        "/"(controller: "portal", action: "index")
        "500"(view: '/error')
        "404"(view: '/error')
    }
}
