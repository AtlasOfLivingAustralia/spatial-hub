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
import org.apache.commons.io.FileUtils

/**
 * Helper class for invoking other ALA web services.
 */
class PropertiesService {

    def grailsApplication

    def get(type) {
        def defaultFile = "i18n/" + type + ".properties";
        def file = new File("/data/spatial-hub/config/" + defaultFile)

        def properties = new Properties()
        if (file.exists()) {
            properties.load(new FileReader(file))
        } else {
            def text = PortalController.classLoader.getResourceAsStream(defaultFile)?.text
            if (text) {
                properties.load(new StringReader(text))
            }
        }

        if (properties.size() == 0 && type != 'default') {
            get('default')
        } else {
            properties
        }
    }

    def set(type, key, value) {
        def defaultFile = "i18n/${type}.properties";
        def file = new File("/data/spatial-hub/config/" + defaultFile)
        file.getParentFile().mkdirs()

        //only append updates to preserve history
        FileUtils.writeStringToFile(file, "\n#${new Date()}\n$key=$value", true)
    }
}
