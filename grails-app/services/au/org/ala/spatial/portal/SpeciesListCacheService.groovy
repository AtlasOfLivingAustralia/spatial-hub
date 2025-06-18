package au.org.ala.spatial.portal

import grails.converters.JSON
import grails.plugin.cache.Cacheable

class SpeciesListCacheService {
    def grailsApplication
    def hubWebService

    @Cacheable("threatenedQCache")
    def getThreatenedQ() {
        log.info("Refreshing the threatened species lists query in threatenedQCache")
        if (grailsApplication.config.lists.url != '') {
            try {
                def threatenedQ = ''
                def threatenedUrl = "${grailsApplication.config.lists.url}${grailsApplication.config.lists.threatenedSpeciesUrl}"
                def threatened = JSON.parse(hubWebService.getUrl(threatenedUrl, null, false)) as Map
                def threatenedJoined = threatened.lists*.dataResourceUid.join(' OR ')
                if (threatenedJoined) {
                    threatenedQ = "species_list_uid:(${threatenedJoined})"
                }
                return threatenedQ
            } catch (err) {
                log.error("failed to construct threatened lists", err)
            }
        }
    }

    @Cacheable("invasiveQCache")
    def getInvasiveQ() {
        log.info("Refreshing the invasive species lists query in invasiveQCache")
        if (grailsApplication.config.lists.url != '') {
            try {
                def invasiveQ = ''
                def invasiveUrl = "${grailsApplication.config.lists.url}${grailsApplication.config.lists.invasiveSpeciesUrl}"
                def invasive = JSON.parse(hubWebService.getUrl(invasiveUrl, null, false)) as Map
                def invasiveJoined = invasive.lists*.dataResourceUid.join(' OR ')
                if (invasiveJoined) {
                    invasiveQ = "species_list_uid:(${invasiveJoined})"
                }
                return invasiveQ
            } catch (err) {
                log.error("failed to construct invasives lists", err)
            }
        }
    }
}
