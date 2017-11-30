package au.org.ala.spatial.portal

import grails.boot.GrailsApp
import grails.boot.config.GrailsAutoConfiguration
import org.springframework.context.EnvironmentAware
import org.springframework.core.env.Environment
import org.springframework.core.env.PropertiesPropertySource


class Application extends GrailsAutoConfiguration implements EnvironmentAware {
    static void main(String[] args) {
        GrailsApp.run(Application, args)
    }

    @Override
    void setEnvironment(Environment environment) {
        def envName = environment.getProperty("ENV_NAME")

        //set CAS appServerName from grails.serverURL when it is not defined
        if (!environment.getProperty("security.cas.appServerName")) {
            def url = new URL(environment.getProperty("grails.serverURL"))
            StringBuilder result = new StringBuilder()
            result.append(url.protocol)
            result.append(":")
            if (url.authority != null && url.authority.length() > 0) {
                result.append("//")
                result.append(url.authority)
            }

            if (url.file != null) {
                result.append(url.file)
            }

            Properties properties = new Properties()
            properties.put('security.cas.appServerName', result.toString())
            environment.propertySources.addFirst(new PropertiesPropertySource(envName + "cas", properties))
        }
    }
}