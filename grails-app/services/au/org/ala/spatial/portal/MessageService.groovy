/*
 * Copyright (C) 2013 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
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

class MessageService {

    def grailsApplication
    def hubWebService

    def messages = [:]
    def messagesAge = System.currentTimeMillis()

    def updateMessages() {
        def newMessages = [:]
        def txt = hubWebService.get("${grailsApplication.config.biocacheService.url}/facets/i18n", false)
        if (txt) {
            def rows = txt.toString().split('\n')
            rows.each { row ->
                if (row.length() > 0 && row.charAt(0) != '#') {
                    def eq = row.indexOf('=')
                    if (eq > 0) {
                        newMessages.put(row.substring(0, eq), row.substring(eq + 1))
                    }
                }
            }
        }
        if (newMessages) {
            messagesAge = System.currentTimeMillis()
            messages = newMessages
        }
    }

    def getMessages() {
        if (!messages) {
            updateMessages()
        }

        return messages as JSON
    }
}
