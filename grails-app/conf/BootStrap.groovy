import au.org.ala.cas.util.AuthenticationUtils
import au.org.ala.web.AuthService
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
        casConfig()

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

    def casConfig = {
        //set CAS values that are determined from other config
        def url = new URL("${grailsApplication.config.grails.serverURL}")
        grailsApplication.config.security.cas.appServerName =
                url.protocol + '://' + url.host + (url.port > 0 ? ':' + url.port : '')
        grailsApplication.config.security.cas.serverName = grailsApplication.config.security.cas.appServerName
        grailsApplication.config.security.cas.contextPath = url.path
        grailsApplication.config.security.cas.casProperties = grailsApplication.config.security.cas.keySet().join(',')

        //set CAS values for ala-cas-client
        grailsApplication.config.security.cas.each { k, v ->
            grailsApplication.config[k] = v
        }

        //ensure ala-cas-client uses these config values
        try {
            File casConfig = File.createTempFile('casConfig', '')
            def stream = new FileOutputStream(casConfig)
            grailsApplication.config.toProperties().store(stream, '')
            stream.flush()
            stream.close()

            Field readOnlyContextsField = ContextAccessController.getDeclaredField('readOnlyContexts')
            readOnlyContextsField.setAccessible(true)
            Map hashtable = (Map) readOnlyContextsField.get(null)
            Map backup = (Map) hashtable.clone()
            hashtable.clear()

            try {
                def ctx = new InitialContext()
                String prop = 'java:comp/env/configPropFile'
                ctx.unbind(prop)
                ctx.bind(prop, casConfig.path)
            } catch (NamingException e) {
                log.error(e.message, e)
            }

            hashtable.putAll(backup)
        } catch (IOException ex) {
            log.error('CAS configuration failed.', ex)
        }
    }
}
