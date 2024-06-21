package au.org.ala.spatial.portal

import au.org.ala.cas.util.AuthenticationUtils
import au.org.ala.web.AuthService
import grails.converters.JSON
import org.apache.commons.lang3.StringUtils
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

        // fix config data types when using a .properties file
        parseConfig()

        portalService.updateListQueries()
    }

    def destroy = {
    }

    /**
     * Parse config to expected data types.
     *
     * When Boolean is expected, use .toBoolean()
     * When Integer is expected, use .toInteger()
     * When Double is expected, use .toDouble()
     * When List is expected, use the List, or parse the string as JSON list, or parse the string as comma delimited list
     * When Map is expected, use the Map, or parse the string as JSON map.
     *
     * When parsing JSON all elements must be in the expected data type.
     * When parsing a comma delimited list all elements are converted to the expected data type.
     *
     */
    def parseConfig = {

        grailsApplication.config.with {
            security.cas.gateway = security.cas.gateway.toBoolean()
            security.cas.bypass = security.cas.bypass.toBoolean()
            security.cas.enabled = security.cas.enabled.toBoolean()
            lists.facets = lists.facets.toBoolean()

            biocacheService.custom_facets = toMapOfLists(biocacheService.custom_facets)

            flickr.licensesData = toMap(flickr.licensesData)

            flickr.nbrOfPhotosToDisplay = flickr.nbrOfPhotosToDisplay.toInteger()

            skin.header = skin.header.toBoolean()
            skin.footer = skin.footer.toBoolean()
            skin.fluidLayout = skin.fluidLayout.toBoolean()

            speciesDotSize = speciesDotSize.toInteger()
            speciesDotOpacity = speciesDotOpacity.toInteger()
            workflow.speciesFilters = toListOfMaps(workflow.speciesFilters)

            webservice.readTimeout = webservice.readTimeout.toInteger()
            webservice.connectTimeout = webservice.connectTimeout.toInteger()

            cache.headers.enabled = cache.headers.enabled.toBoolean()

            http.timeout = http.timeout.toInteger()

            keep.alive.timeout.ms = keep.alive.timeout.ms.toInteger()

            startup.lat = startup.lat.toInteger()
            startup.lng = startup.lng.toInteger()
            startup.zoom = startup.zoom.toInteger()

            startup.baselayers = toMapOfMaps(startup.baselayers)

            defaultareas = toListOfMaps(defaultareas)

            defaultareas = toListOfMaps(defaultareas)

            presetWMSServers = toListOfMaps(presetWMSServers)

            getMapExamples = toListOfMaps(getMapExamples)

            wms.intersect = wms.intersect.toBoolean()

            projections = toMapOfMaps(projections)

            spApp.mapOptions = spApp.mapOptions.toBoolean()
            spApp.collapseUp = spApp.collapseUp.toBoolean()
            spApp.collapseLeft = spApp.collapseLeft.toBoolean()
            spApp.cursorCoordinates = spApp.cursorCoordinates.toBoolean()
            spApp.quicklinks = spApp.quicklinks.toBoolean()
            spApp.optionsAddWms = spApp.optionsAddWms.toBoolean()
            spApp.optionsDownloadMap = spApp.optionsDownloadMap.toBoolean()
            spApp.optionsResetMap = spApp.optionsResetMap.toBoolean()
            spApp.optionsSelectBaseMap = spApp.optionsSelectBaseMap.toBoolean()
            spApp.layerDistances = spApp.layerDistances.toBoolean()
            spApp.googleLocation = spApp.googleLocation.toBoolean()
            spApp.leftPanel = spApp.leftPanel.toBoolean()
        }
    }

    def toList(Object o) {
        if (o == null || StringUtils.isEmpty(o.toString())) {
            return []
        } else if (o instanceof List) {
            return o
        } else if (o.toString().startsWith("[")) {
            // JSON list
            return JSON.parse(o.toString())
        } else {
            // comma delimited
            return Arrays.asList(o.toString().split(","))
        }
    }

    def toListOfMaps(Object o) {
        if (o == null || o.toString().isEmpty()) {
            return new ArrayList()
        }

        def listOfMaps = toList(o)

        for (def i = 0; i < listOfMaps.size(); i++) {
            listOfMaps.set(i, toMap(listOfMaps.get(i)))
        }

        return listOfMaps
    }

    def toMap(Object o) {
        if (o == null || o.toString().isEmpty()) {
            return new HashMap()
        }

        def map = o

        if (!(map instanceof Map)) {
            map = JSON.parse(map.toString())
        }

        return map
    }

    def toMapOfMaps(Object o) {
        if (o == null || o.toString().isEmpty()) {
            return new HashMap()
        }

        def mapOfMaps = toMap(o)

        for (def key : mapOfMaps.keySet) {
            mapOfMaps[key] = toMap(mapOfMaps[key])
        }

        return mapOfMaps
    }

    def toMapOfLists(Object o) {
        if (o == null || o.toString().isEmpty()) {
            return new HashMap()
        }

        def mapOfLists = toMap(o)

        def result = [:]
        mapOfLists.each { k, v ->
            if (!k.contains('[')) { // exclude odd artifacts
                result[k] = toList(v)
            }
        }


        return result
    }
}
