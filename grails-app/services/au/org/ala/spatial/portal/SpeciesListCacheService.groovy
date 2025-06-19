package au.org.ala.spatial.portal

import grails.converters.JSON

class SpeciesListCacheService {
    def grailsApplication
    def hubWebService
    def grailsCacheManager

    def getThreatenedQValue() {
        if (grailsApplication.config.lists.url == '') {
            log.warn("No species lists URL configured in application. Threatened species lists query for threatenedQCache is therefore set to empty value.")
            return ''
        }

        log.info("Refreshing the threatened species lists query for threatenedQCache")
        def cachedThreatenedQ = grailsCacheManager.getCache("threatenedQCache").get("threatenedQ")?.get()
        if (!cachedThreatenedQ) {
            try {
                def threatenedUrl = "${grailsApplication.config.lists.url}${grailsApplication.config.lists.threatenedSpeciesUrl}"
                def threatened = JSON.parse(hubWebService.getUrl(threatenedUrl, null, false)) as Map
                def threatenedJoined = threatened.lists*.dataResourceUid.join(' OR ')
                if (threatenedJoined) {
                    def threatenedQ = "species_list_uid:(${threatenedJoined})"
                    grailsCacheManager.getCache("threatenedQCache").put("threatenedQ", threatenedQ) // update cache
                    return threatenedQ
                }
            } catch (err) {
                log.error("Failed to fetch threatened species lists query for threatenedQCache. Next cache refresh attempt will occur in 15 minutes. You can invalidate caches explicitly with resetCaches method. ", err)
                return ''
            }
        }
        return cachedThreatenedQ
    }

    def getInvasiveQValue() {
        if (grailsApplication.config.lists.url == '') {
            log.warn("No species lists URL configured in application. Threatened species lists query for threatenedQCache is therefore set to empty value.")
            return ''
        }

        log.info("Refreshing the invasive species lists query for invasiveQCache")
        def cachedInvasiveQ = grailsCacheManager.getCache("invasiveQCache").get("invasiveQ")?.get()
        if (!cachedInvasiveQ) {
            try {
                def invasiveUrl = "${grailsApplication.config.lists.url}${grailsApplication.config.lists.invasiveSpeciesUrl}"
                def invasive = JSON.parse(hubWebService.getUrl(invasiveUrl, null, false)) as Map
                def invasiveJoined = invasive.lists*.dataResourceUid.join(' OR ')
                if (invasiveJoined) {
                    def invasiveQ = "species_list_uid:(${invasiveJoined})"
                    grailsCacheManager.getCache("invasiveQCache").put("invasiveQ", invasiveQ) // update cache
                    return invasiveQ
                }
            } catch (err) {
                log.error("Failed to fetch invasive species lists query for invasiveQCache. Next cache refresh attempt will occur in 15 minutes. You can invalidate caches explicitly with resetCaches method. ", err)
                return ''
            }
        }
        return cachedInvasiveQ
    }
}
