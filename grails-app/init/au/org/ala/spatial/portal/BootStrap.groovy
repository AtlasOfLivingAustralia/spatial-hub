package au.org.ala.spatial.portal

import asset.pipeline.AssetPipelineConfigHolder
import asset.pipeline.fs.FileSystemAssetResolver
import au.org.ala.cas.util.AuthenticationUtils
import au.org.ala.web.AuthService
import grails.converters.JSON
import org.apache.commons.io.FileUtils
import org.springframework.core.io.FileSystemResource
import org.springframework.core.io.Resource
import org.springframework.core.io.ResourceLoader
import org.springframework.web.context.request.RequestContextHolder

import javax.servlet.http.HttpServletRequest

class BootStrap {

    def portalService
    def grailsApplication
    def groovyPageLocator

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

        // support for external layouts
        //
        // e.g. config "skin.layout=myLayout" will use the layout file /data/spatial-hub/views/layouts/myLayout.gsp
        //
        // support external files with the asset tag in the layout gsp
        // e.g.
        //   files
        //     /data/spatial-hub/assets/css/externalCss.css
        //     /data/spatial-hub/assets/js/externalJs.js
        //     /data/spatial-hub/assets/img/externalImage.png
        //   asset tags
        //     <asset:stylesheet src="css/externalCss.css" />
        //     <asset:javascript src="js/externalJs.js" />
        //     <asset:image src="img/externalImg.png" />
        //
        // Support the use of the default "skin.layout=generic" with a local "headerAndFooter.baseURL" by the creating files
        //   /data/spatial-hub/assets/css/bootstrap.min.css
        //   /data/spatial-hub/assets/css/ala-styles.css
        addExternalViews()
        addExternalAssets(servletContext)

        portalService.updateListQueries()
    }

    def addExternalViews = {
        groovyPageLocator.addResourceLoader(new ResourceLoader() {

            @Override
            Resource getResource(String s) {
                File resource = new File('/data/spatial-hub/views' + s)
                if (resource.exists()) {
                    return new FileSystemResource(resource)
                }
                return null
            }

            @Override
            ClassLoader getClassLoader() {
                return null
            }
        })
    }

    def addExternalAssets = { servletContext ->
        try {
            File src = new File('/data/spatial-hub/assets')

            if (src.exists() && src.isDirectory()) {
                // asset-pipeline resolves files differently depending on the presence of a manifest
                if (AssetPipelineConfigHolder.manifest) {
                    // copy external asset files into expanded war assets directory so they can be discovered
                    File dst = new File(servletContext.getRealPath("/assets"))

                    if (dst.exists() && dst.isDirectory()) {
                        FileUtils.copyDirectory(src, dst)
                    } else {
                        log.error("External assets are unavailable. Expanded WAR asset directory '${dst.path}' does not exist.")
                    }
                } else {
                    // a new Resolver is required to find the external assets at runtime
                    def resolver = new FileSystemAssetResolver("external-assets", '/data/spatial-hub/assets', false)
                    AssetPipelineConfigHolder.registerResolver(resolver)
                }
            }
        } catch (err) {
            log.error("External assets are not available.", err)
        }
    }

    def destroy = {
    }
}
