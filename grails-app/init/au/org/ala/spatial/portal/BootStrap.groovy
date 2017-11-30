package au.org.ala.spatial.portal

import au.org.ala.cas.util.AuthenticationUtils
import au.org.ala.web.AuthService
import grails.converters.JSON
import org.apache.naming.ContextAccessController
import org.springframework.web.context.request.RequestContextHolder

import javax.naming.InitialContext
import javax.naming.NamingException
import javax.servlet.http.HttpServletRequest
import java.lang.reflect.Field

class BootStrap {

    def portalService
    def grailsApplication

    def init = { servletContext ->

        //This application does not need to be authorised for userdetails. Update AuthService to prevent exceptions.
        AuthService.metaClass.getUserId = {
            def request = RequestContextHolder.currentRequestAttributes().request as HttpServletRequest
            AuthenticationUtils.getUserId(request)
        }

        //copy baselayers
        if (grailsApplication.config.startup.baselayers instanceof String) {
            grailsApplication.config.startup.baselayers = JSON.parse(grailsApplication.config.startup.baselayers)
        }

        portalService.updateListQueries()
    }

    def destroy = {
    }
}
