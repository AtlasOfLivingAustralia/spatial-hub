package au.org.ala.spatial.portal

import grails.testing.services.ServiceUnitTest
import spock.lang.Specification

class MessageServiceSpec extends Specification implements ServiceUnitTest<MessageService> {

    HubWebService hubWebService = Mock(HubWebService)

    @Override
    Set<String> getIncludePlugins() {
        ['core', 'eventBus', 'converters'].toSet()
    }


    @Override
    Closure doWithConfig() {
        { config ->
            config.biocacheService.url = 'https://biocache.example.org/ws'
        }
    }

    def setup() {
        service.hubWebService = hubWebService
    }

    void "reads the facet translations, skipping comments"() {
        when:
        service.updateMessages()

        then:
        1 * hubWebService.getUrl('https://biocache.example.org/ws/facets/i18n', null, false) >>
                '# a comment\nfacet.species = Species \nfacet.genus=Genus\nnot a message\n#facet.hidden=Hidden'
        service.@messages == ['facet.species': 'Species', 'facet.genus': 'Genus']
    }

    void "the age only changes when the translations change"() {
        given:
        hubWebService.getUrl(_, null, false) >>> ['a=1', 'a=1', 'a=2']
        service.messagesAge = 0

        when:
        service.updateMessages()
        def firstAge = service.messagesAge

        then:
        firstAge > 0

        when:
        service.messagesAge = 1
        service.updateMessages()

        then:
        service.messagesAge == 1

        when:
        service.updateMessages()

        then:
        service.messagesAge > 1
        service.@messages == [a: '2']
    }

    void "getMessages loads the translations the first time"() {
        when:
        def first = service.getMessages().toString()
        def second = service.getMessages().toString()

        then:
        1 * hubWebService.getUrl(_, null, false) >> 'a=1'
        first == '{"a":"1"}'
        second == first
    }
}
