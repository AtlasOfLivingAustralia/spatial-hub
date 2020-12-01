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
import org.apache.commons.io.FileUtils

import java.util.concurrent.atomic.AtomicLong

/**
 * Store for spatial-hub client session states.
 *
 * TODO: Add config option to persist in spatial-service instead of file system
 */
class SessionService {

    def grailsApplication

    def sessionCache = [:]
    def sessionLog = []

    def currentId = new AtomicLong(System.currentTimeMillis())

    static final String SAVED_SESSION_PARAM = '?ss='
    static final String ADD = 'add'
    static final String DELETE = 'delete'

    //sessions saves that do not persist on restart
    def tmpSaves = [:]

    def newId(userId) {
        //get id
        def id = currentId.updateAndGet({ v -> Math.max(v + 1, System.currentTimeMillis()) })

        //update session log
        sessionLog.push([id, 'newSession', userId])

        //update session cache
        sessionCache.put(id, [:])

        id
    }

    def put(id, userId, data, persist) {
        sessionCache.put(id, data)

        if (persist) {
            saveFile(id).parentFile.mkdirs()

            FileUtils.writeStringToFile(saveFile(id), (data as JSON).toString())

            updateUserSave(id, userId, ADD, data?.name, System.currentTimeMillis())
        } else {
            tmpSaves.put(id, data)
        }

        [status: 'saved', url: grailsApplication.config.grails.serverURL + SAVED_SESSION_PARAM + id]
    }

    def updateUserSave(id, userId, type, name, time) {
        def list = (List) (userFile(userId).exists() ? JSON.parse(FileUtils.readFileToString(userFile(userId))) : [])

        if (ADD == type) {
            list.push([id: id, name: name, time: time])
        } else if (DELETE == type) {
            list = list.findAll { ((Map) it).id.toString() != id.toString() }
        }

        FileUtils.writeStringToFile(userFile(userId), (list as JSON).toString(true))

        list
    }

    def userFile(userId) {
        new File("${grailsApplication.config.sessions.dir}/user_${userId}.json")
    }

    def saveFile(id) {
        new File("${grailsApplication.config.sessions.dir}/${id}.json")
    }

    def get(id) {
        sessionCache.get(id as Long) ?: saveFile(id).exists() ?
                JSON.parse(FileUtils.readFileToString(saveFile(id))) : [:]
    }

    def list(userId) {
        def sessions = userFile(userId).exists() ? JSON.parse(FileUtils.readFileToString(userFile(userId))) : []
        sessions.each {
            ((Map) it).url = grailsApplication.config.grails.serverURL + SAVED_SESSION_PARAM + ((Map) it).id
        }

        sessions
    }
}
