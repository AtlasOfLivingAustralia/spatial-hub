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

/**
 * Cache of biocache-service /facets/i18n lookup
 */
class MessageService {

    def grailsApplication
    def hubWebService

    def messages = [:]
    def messagesAge = System.currentTimeMillis()

    def updateMessages() {
        def url = "${grailsApplication.config.biocacheService.url}/facets/i18n"
        try {
            def newMessages = [:]
            String txt = hubWebService.getUrl(url, null, false)
            if (txt) {
                txt.split('\n').each { row ->
                    row.find('^([^#].*)=(.*)$') { match, key, value ->
                        newMessages.put(key.trim(), value.trim())
                    }
                }
            }
            if (newMessages != messages) {
                messagesAge = System.currentTimeMillis()
                messages = newMessages
            }
        } catch (IOException e) {
            log.error "failed to get ${url}", e
        }
    }

    def getMessages() {
        if (!messages) {
            updateMessages()
        }

        messages as JSON
    }
}
