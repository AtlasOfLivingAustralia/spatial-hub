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
import org.apache.commons.io.FileUtils

class SessionService {

    def grailsApplication

    def sessionCache = [:]
    def userCache = [:]
    def sessionLog = []

    def currentId = System.currentTimeMillis()

    synchronized def newId(userId) {
        //get id
        def newId = System.currentTimeMillis()
        if (newId == currentId) newId++

        //update user cache
        if (userId) {
            def userSessions = userCache.get(userId) ?: []
            userSessions.add(newId)
            userCache.put(userId, userSessions)
        }

        //update session log
        sessionLog.push([newId, 'newSession', userId])

        //update session cache
        sessionCache.put(newId, {})

        currentId = newId
    }

    def put(id, data) {
        sessionCache.put(id, data)

        saveFile(id).getParentFile().mkdirs()

        FileUtils.writeStringToFile(saveFile(id), (data as JSON).toString())

        [status: 'saved', url: grailsApplication.config.grails.serverURL + '?ss=' + id]
    }

    def saveFile(id) {
        new File(grailsApplication.config.sessions.dir + '/' + id + '.json')
    }

    def get(id) {
        sessionCache.get(id) ?: saveFile(id).exists() ? JSON.parse(FileUtils.readFileToString(saveFile(id))) : [:]
    }

    def list(userId) {
        userCache.get(userId) ?: []
    }
}
