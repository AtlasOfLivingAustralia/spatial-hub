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
    def sessionLog = []

    def currentId = System.currentTimeMillis()

    //sessions saves that do not persist on restart
    def tmpSaves = [:]

    synchronized def newId(userId) {
        //get id
        def newId = System.currentTimeMillis()
        if (newId == currentId) newId++

        //update session log
        sessionLog.push([newId, 'newSession', userId])

        //update session cache
        sessionCache.put(newId, {})

        currentId = newId
    }

    def put(id, userId, data, save) {
        sessionCache.put(id, data)

        if (!save) {
            saveFile(id).getParentFile().mkdirs()

            FileUtils.writeStringToFile(saveFile(id), (data as JSON).toString())

            updateUserSave(id, userId, 'add', data?.name, System.currentTimeMillis())
        } else {
            tmpSaves.put(id, data)
        }

        [status: 'saved', url: grailsApplication.config.grails.serverURL + '?ss=' + id]
    }

    synchronized def updateUserSave(id, userId, type, name, time) {
        def list = userFile(userId).exists() ? JSON.parse(FileUtils.readFileToString(userFile(userId))) : []

        if ('add' == type) {
            list.push([id: id, name: name, time: time])
        } else if ('delete' == type) {
            list = list.findAll { it.id.toString() != id }
        }

        FileUtils.writeStringToFile(userFile(userId), (list as JSON).toString(true))

        list
    }

    def userFile(userId) {
        new File(grailsApplication.config.sessions.dir + '/user_' + userId + '.json')
    }

    def saveFile(id) {
        new File(grailsApplication.config.sessions.dir + '/' + id + '.json')
    }

    def get(id) {
        sessionCache.get(id) ?: saveFile(id).exists() ? JSON.parse(FileUtils.readFileToString(saveFile(id))) : [:]
    }

    def list(userId) {
        def sessions = userFile(userId).exists() ? JSON.parse(FileUtils.readFileToString(userFile(userId))) : []
        sessions.each {
            it.url = grailsApplication.config.grails.serverURL + "?ss=" + it.id
        }

        sessions
    }
}
