package au.org.ala.spatial.portal

import grails.testing.services.ServiceUnitTest
import spock.lang.Specification

import java.nio.file.Files

class PortalServiceSpec extends Specification implements ServiceUnitTest<PortalService> {

    HubWebService hubWebService = Mock(HubWebService)

    @Override
    Set<String> getIncludePlugins() {
        ['core', 'eventBus', 'converters'].toSet()
    }


    @Override
    Closure doWithConfig() {
        { config ->
            config.character.encoding = 'UTF-8'
            config.lists.url = 'https://lists.example.org'
            config.lists.threatenedSpeciesUrl = '/threatened'
            config.lists.invasiveSpeciesUrl = '/invasive'
            config.biocacheService.url = 'https://biocache.example.org/ws'
        }
    }

    def setup() {
        service.hubWebService = hubWebService
        service.lifeforms = []
    }

    void "rebuildParameters encodes the first value of each parameter and skips url"() {
        given:
        Map params = new LinkedHashMap([q: ['taxa:"Iris germanica"', 'ignored'] as String[],
                                        url: ['https://example.org'] as String[],
                                        fq: ['year:[2000 TO *]'] as String[]])

        expect:
        service.rebuildParameters(params, true) == 'q=taxa%3A%22Iris+germanica%22&fq=year%3A%5B2000+TO+*%5D'
        service.rebuildParameters(params, false) == '&q=taxa%3A%22Iris+germanica%22&fq=year%3A%5B2000+TO+*%5D'
    }

    void "updateListQueries builds the threatened and invasive queries from the lists"() {
        when:
        service.updateListQueries()

        then:
        1 * hubWebService.getUrl('https://lists.example.org/threatened', null, false) >>
                '{"lists": [{"dataResourceUid": "dr1"}, {"id": "dr2"}]}'
        1 * hubWebService.getUrl('https://lists.example.org/invasive', null, false) >>
                '{"lists": [{"dataResourceUid": "dr3"}]}'
        config.threatenedQ == 'species_list_uid:(dr1 OR dr2)'
        config.invasiveQ == 'species_list_uid:(dr3)'
    }

    void "updateListQueries survives a lists service error"() {
        when:
        service.updateListQueries()

        then:
        1 * hubWebService.getUrl(_, null, false) >> { throw new IOException('down') }
        noExceptionThrown()
    }

    void "getLifeforms reads the species groups once"() {
        when:
        def first = service.getLifeforms()
        def second = service.getLifeforms()

        then:
        1 * hubWebService.getUrl('https://biocache.example.org/ws/occurrence/facets?facets=species_group&flimit=-1', null, false) >>
                '{"fieldResult": [[{"label": "Birds", "count": 10}, {"label": "Plants", "count": 5}]]}'
        first*.label == ['Birds', 'Plants']
        second.is(first)
    }

    void "getLifeforms is empty when biocache fails"() {
        when:
        def lifeforms = service.getLifeforms()

        then:
        1 * hubWebService.getUrl(_, null, false) >> null
        lifeforms == []
    }

    void "getConfig reads the configured file"() {
        given:
        File file = Files.createTempFile('view', '.json').toFile()
        file.text = '{"test": "value"}'
        config.viewConfig.json = file.path

        expect:
        service.getConfig('view', false, null).test == 'value'

        cleanup:
        file.delete()
    }

    void "getConfig falls back to the default config in the classpath"() {
        given:
        config.viewConfig.json = '/non/existent/view-config.json'

        when:
        def viewConfig = service.getConfig('view', true, null)

        then:
        viewConfig instanceof Map
        !viewConfig.isEmpty()
    }

    void "getAppConfig of an unknown hub is empty"() {
        expect:
        service.getAppConfig('unknown-hub-for-tests') == [:]
    }

    void "getAppConfig without a hub is a copy of the application config"() {
        when:
        Map appConfig = service.getAppConfig(null)

        then:
        appConfig.lists.url == 'https://lists.example.org'
    }
}
