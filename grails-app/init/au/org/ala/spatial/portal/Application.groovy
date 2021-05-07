package au.org.ala.spatial.portal

import grails.boot.GrailsApp
import grails.boot.config.GrailsAutoConfiguration
import groovy.transform.CompileStatic
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

            // ala-cas-client in ala-auth:3.1.1 needs appServerName to exclude url.file

            Properties properties = new Properties()
            properties.put('security.cas.appServerName', result.toString())
            environment.propertySources.addFirst(new PropertiesPropertySource(envName + "cas", properties))
        }
    }
//
//    // 3. **Optionally** define a custom docket or omit this step to use the default
//     //For grails it is preferrable to use use the following settings.
//    @Bean
//    Docket api() {
//        new Docket(DocumentationType.SWAGGER_2)
//                .ignoredParameterTypes(MetaClass)
//                .select()
//                .paths(regex("/|/portal/.*"))
//                .build()
//    }
//
//    // 4. **Optionally** in the absense of asset pipeline configure the swagger-ui webjar to serve the scaffolded swagger UI
//    @Bean
//    static WebMvcConfigurerAdapter webConfigurer() {
//        new WebMvcConfigurerAdapter() {
//            @Override
//            void addResourceHandlers(ResourceHandlerRegistry registry) {
//                if (!registry.hasMappingForPattern("/webjars/**")) {
//                    registry
//                            .addResourceHandler("/webjars/**")
//                            .addResourceLocations("classpath:/META-INF/resources/webjars/")
//                }
//                if (!registry.hasMappingForPattern("/swagger-ui.html")) {
//                    registry
//                            .addResourceHandler("/swagger-ui.html")
//                            .addResourceLocations("classpath:/META-INF/resources/swagger-ui.html")
//                }
//            }
//        }
//    }
}