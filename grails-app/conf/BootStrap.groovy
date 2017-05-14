import au.org.ala.cas.util.AuthenticationUtils
import au.org.ala.web.AuthService
import org.apache.naming.ContextAccessController
import org.springframework.web.context.request.RequestContextHolder

import javax.naming.InitialContext
import javax.servlet.http.HttpServletRequest
import java.lang.reflect.Field

class BootStrap {

    def hubWebService
    def grailsApplication

    def init = { servletContext ->
        casConfig()

        //This application does not need to be authorised for userdetails. Update AuthService to prevent exceptions.
        AuthService.metaClass.getUserId = {
            def request = RequestContextHolder.currentRequestAttributes().getRequest() as HttpServletRequest
            return AuthenticationUtils.getUserId(request)
        }

        //copy baselayers
        if (grailsApplication.config.startup.baselayers instanceof String) {
            grailsApplication.config.startup.baselayers = JSON.parse(grailsApplication.config.startup.baselayers)
        }

        hubWebService.updateListQueries()
    }

    def destroy = {
    }

    def casConfig = {
        //set CAS values that are determined from other config
        def url = new URL(grailsApplication.config.grails.serverURL)
        grailsApplication.config.security.cas.appServerName =
                url.getProtocol() + "://" + url.getHost() + (url.port > 0 ? ':' + url.port : '')
        grailsApplication.config.security.cas.serverName = grailsApplication.config.security.cas.appServerName
        grailsApplication.config.security.cas.contextPath = url.getPath()
        grailsApplication.config.security.cas.casProperties = grailsApplication.config.security.cas.keySet().join(',')

        //set CAS values for ala-cas-client
        grailsApplication.config.security.cas.each { k, v ->
            grailsApplication.config[k] = v
        }

        //ensure ala-cas-client uses these config values
        try {
            File casConfig = File.createTempFile("casConfig", "")
            def stream = new FileOutputStream(casConfig)
            grailsApplication.config.toProperties().store(stream, '')
            stream.flush()
            stream.close()

            Field readOnlyContextsField = ContextAccessController.class.getDeclaredField("readOnlyContexts")
            readOnlyContextsField.setAccessible(true)
            Hashtable hashtable = (Hashtable) readOnlyContextsField.get(null)
            Hashtable backup = (Hashtable) hashtable.clone()
            hashtable.clear()

            try {
                def ctx = new InitialContext()
                ctx.unbind("java:comp/env/configPropFile")
                ctx.bind("java:comp/env/configPropFile", casConfig.getPath())
            } catch (Exception e) {
                e.printStackTrace()
            }

            hashtable.putAll(backup)
        } catch (Exception ex) {
            log.error("CAS configuration failed.", ex)
        }
    }
}
