/*
 * Copyright (C) 2013 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the 'License'); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 */

package au.org.ala.spatial.portal

import grails.converters.JSON
import grails.plugin.cache.Cacheable
import grails.util.Holders

/**
 * Helper class for invoking other ALA web services.
 */
class PortalService {

    def grailsApplication

    static final DEFAULT_USER_ID = -1

    def caches = [QID: 'qid', PROXY: 'proxy', FLICKR_LICENCES: 'flickr']

    def rebuildParameters(Map params, boolean returnWithAmpersand) {
        StringBuilder uri = new StringBuilder()
        String delim = returnWithAmpersand ? '' : '&'
        for (Object o : params.entrySet()) {
            Map.Entry entry = (Map.Entry) o
            // skip the url parameter - removal from the map is not allowed
            if (!'url'.equalsIgnoreCase((String) entry.key)) {
                String[] value = (String[]) entry.value
                try {
                    uri.append(delim).append(entry.key).append('=').append(URLEncoder.encode(value[0],
                            (String) grailsApplication.config.character.encoding))
                    delim = '&'
                } catch (UnsupportedEncodingException e) {
                    log.error "failed to encode ${value.join('|')}'", e
                }
            }
        }
        uri.toString()
    }


    @Cacheable('configCache')
    def getConfig(type, showDefault, hub) {
        def config
        def defaultFile = type + '-config.json'
        def configFilename = grailsApplication.config[type + "Config"]?.json
        File file = null
        if (configFilename) {
            if (hub) {
                file = new File(hub + "/" + configFilename)
            } else {
                file = new File((String) configFilename)
            }
        }

        if (file != null && file.exists()) {
            config = JSON.parse(new FileReader(file))
        } else {
            def filename = grailsApplication.config[type + "Config"]?.json?:defaultFile
            file = new File("/data/spatial-hub/config/" + (hub != null ? hub + "/" : "") + filename)
            if (!showDefault && file.exists()) {
                config = JSON.parse(new FileReader(file))
            } else {
                try {
                    def text = PortalController.classLoader.getResourceAsStream(defaultFile).text
                    config = JSON.parse(text)
                } catch (Exception e) {
                    if (!hub) {
                        log.error("Missing resource: " + defaultFile, e)
                    } else {
                        config = [:]
                    }
                }
            }
        }
        config
    }

    def validKeys = [] as Set

    def canProxy(url) {
        def predefined = url.toString().startsWith(Holders.config.layersService.url) ||
                url.toString().startsWith(Holders.config.phylolink.url) ||
                url.toString().startsWith(Holders.config.sampling.url)
        //REGEXP: ^(https:|http:)\/\/data.auscover.org.au\/*
        def proxies = Holders.config.allowProxy.server? Holders.config.allowProxy.server.split(";|,"):[];
        //def proxies = (Holders.config.allowProxy as grails.converters.JSON).toString().encodeAsRaw()
        def patterns = []
        def mode = '((^(https:|http:)\\/\\/)?SERVER\\/*)'
        for( proxy in proxies){
            patterns.add(mode.replace('SERVER',proxy))
        }
        def pattern =  patterns.join('|');
        print("Proxy regex pattern: " + pattern)

        (url =~/${pattern}/).find() | predefined
    }

    def getAppConfig(hub) {
        if (hub) {
            def hubConfig = getConfig("app", false, hub)
            if (hubConfig) {
                grailsApplication.config + hubConfig
            } else {
                [:]
            }
        } else {
            [:] + grailsApplication.config
        }
    }
}
