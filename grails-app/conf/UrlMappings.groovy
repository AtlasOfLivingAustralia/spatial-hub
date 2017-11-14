import au.org.ala.admin.AlaAdminController

class UrlMappings {

    static mappings = {

        "/$controller/$action?/$id?(.$format)?" {
            constraints {
                // apply constraints here
            }
        }

        "/admin"(controller:AlaAdminController, action:"/index")

        "/"(controller: "portal", action: "/index")
        "500"(view: '/error')
    }
}
