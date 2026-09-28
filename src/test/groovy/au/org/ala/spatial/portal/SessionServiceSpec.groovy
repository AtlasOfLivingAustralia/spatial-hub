package au.org.ala.spatial.portal

import grails.converters.JSON
import grails.testing.services.ServiceUnitTest
import spock.lang.Specification

import java.nio.file.Files

class SessionServiceSpec extends Specification implements ServiceUnitTest<SessionService> {

    static File sessionsDir = Files.createTempDirectory('sessions').toFile()

    @Override
    Set<String> getIncludePlugins() {
        ['core', 'eventBus', 'converters'].toSet()
    }

    @Override
    Closure doWithConfig() {
        { config ->
            config.grails.serverURL = 'https://spatial.example.org'
            config.sessions.dir = sessionsDir.path
        }
    }

    def cleanupSpec() {
        sessionsDir.deleteDir()
    }

    void "new ids always increase"() {
        when:
        def first = service.newId('u1')
        def second = service.newId('u1')

        then:
        second > first
        service.sessionLog.first() == [second, 'newSession', 'u1'] // push adds to the front
        service.sessionCache.containsKey(second)
    }

    void "a temporary session is kept in memory only"() {
        given:
        def id = service.newId(null)

        when:
        def result = service.put(id, null, [name: 'tmp', layers: []], false)

        then:
        result == [status: 'saved', url: "https://spatial.example.org?ss=${id}".toString()]
        service.tmpSaves[id].name == 'tmp'
        !service.saveFile(id).exists()
        service.get(id).name == 'tmp'
    }

    void "a saved session is written to disk and listed for its user"() {
        given:
        def id = service.newId('u2')

        when:
        service.put(id, 'u2', [name: 'my session'], true)

        then:
        service.saveFile(id).exists()
        JSON.parse(service.saveFile(id).text).name == 'my session'

        when:
        def sessions = service.list('u2')

        then:
        sessions.size() == 1
        sessions[0].id == id
        sessions[0].name == 'my session'
        sessions[0].url == "https://spatial.example.org?ss=${id}".toString()
    }

    void "a saved session is read from disk when it is not cached"() {
        given:
        def id = service.newId('u3')
        service.put(id, 'u3', [name: 'from disk'], true)
        service.sessionCache.clear()

        expect:
        service.get(id).name == 'from disk'
        service.get(id.toString()).name == 'from disk'
    }

    void "an unknown session is empty"() {
        expect:
        service.get(1L) == [:]
    }

    void "deleting a session removes it from the user list"() {
        given:
        def keep = service.newId('u4')
        def remove = service.newId('u4')
        service.put(keep, 'u4', [name: 'keep'], true)
        service.put(remove, 'u4', [name: 'remove'], true)

        when:
        service.updateUserSave(remove.toString(), 'u4', SessionService.DELETE, null, null)

        then:
        service.list('u4')*.name == ['keep']
    }

    void "users only list their own sessions"() {
        given:
        service.put(service.newId('u5'), 'u5', [name: 'u5 session'], true)

        expect:
        service.list('u6') == []
    }

    void "legacy sessions without url get one"() {
        given:
        service.userFile('u7').text = '[{"id": 123, "name": "legacy"}]'

        expect:
        service.list('u7')[0].url == 'https://spatial.example.org?ss=123'
    }
}
