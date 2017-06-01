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

/**
 * Helper class for invoking other ALA web services.
 */
class PortalService {

    def grailsApplication
    def hubWebService

    static final APP_CONSTANT = 'SPATIAL_PORTAL'

    def caches = [QID: 'qid', PROXY: 'proxy']

    def rebuildParameters(Map params, boolean returnWithAmpersand) {
        StringBuilder uri = new StringBuilder()
        String delim = returnWithAmpersand ? '?' : '&'
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

    def updateListQueries() {
        def joinStr = ' OR '
        def threatenedUrl =
                "${grailsApplication.config.lists.url}${grailsApplication.config.lists.threatenedSpeciesUrl}"
        def threatened = JSON.parse(hubWebService.getUrl(threatenedUrl, null, false)) as Map
        def threatenedQ = "species_list_uid:(${threatened.lists*.dataResourceUid.join(joinStr)})"
        grailsApplication.config.threatenedQ = threatenedQ

        def invasiveUrl = "${grailsApplication.config.lists.url}${grailsApplication.config.lists.invasiveSpeciesUrl}"
        def invasive = JSON.parse(hubWebService.getUrl(invasiveUrl, null, false)) as Map
        def invasiveQ = "species_list_uid:(${invasive.lists*.dataResourceUid.join(joinStr)})"
        grailsApplication.config.invasiveQ = invasiveQ
    }

    @Cacheable('viewConfigCache')
    def getViewConfig() {
        def viewConfig
        def defaultFile = 'view-config.json'
        def file = new File((String) grailsApplication.config.viewConfig?.json)

        if (file.exists()) {
            viewConfig = JSON.parse(new FileReader(file))
        } else {
            def text = PortalController.classLoader.getResourceAsStream(defaultFile).text
            viewConfig = JSON.parse(text)
        }
        viewConfig
    }

}
