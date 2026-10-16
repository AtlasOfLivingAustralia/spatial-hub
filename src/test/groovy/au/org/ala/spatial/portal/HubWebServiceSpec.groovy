package au.org.ala.spatial.portal

import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpServer
import grails.testing.services.ServiceUnitTest
import spock.lang.PendingFeature
import spock.lang.Shared
import spock.lang.Specification

import java.util.zip.GZIPOutputStream

class HubWebServiceSpec extends Specification implements ServiceUnitTest<HubWebService> {

    @Shared
    HttpServer server
    @Shared
    Map lastRequest = [:]
    @Shared
    String baseUrl

    @Override
    Closure doWithConfig() {
        { config ->
            config.http.timeout = 5000
            config.http.so.timeout = 5000
            config.app.http.header.userId = 'X-ALA-userId'
        }
    }

    def setupSpec() {
        server = HttpServer.create(new InetSocketAddress('127.0.0.1', 0), 0)
        server.createContext('/echo') { HttpExchange ex -> record(ex); reply(ex, 'text/plain', 'ok'.bytes, null) }
        server.createContext('/json') { HttpExchange ex -> record(ex); reply(ex, 'application/json;charset=UTF-8', '{"a":1}'.bytes, null) }
        server.createContext('/gzip') { HttpExchange ex ->
            record(ex)
            def out = new ByteArrayOutputStream()
            new GZIPOutputStream(out).withStream { it.write('compressed text'.bytes) }
            reply(ex, 'text/plain', out.toByteArray(), 'gzip')
        }
        server.createContext('/image') { HttpExchange ex -> record(ex); reply(ex, 'image/png', [1, 2, 3] as byte[], null) }
        server.start()
        baseUrl = "http://127.0.0.1:${server.address.port}"
    }

    def cleanupSpec() {
        server?.stop(0)
    }

    def setup() {
        lastRequest.clear()
    }

    void record(HttpExchange ex) {
        lastRequest.method = ex.requestMethod
        lastRequest.query = ex.requestURI.rawQuery
        lastRequest.headers = ex.requestHeaders
        lastRequest.body = ex.requestBody.text
    }

    static void reply(HttpExchange ex, String contentType, byte[] body, String encoding) {
        ex.responseHeaders.add('Content-Type', contentType)
        if (encoding) {
            ex.responseHeaders.add('Content-Encoding', encoding)
        }
        ex.sendResponseHeaders(200, body.length)
        ex.responseBody.withStream { it.write(body) }
    }

    static List<String> params(String query) {
        query.split('&').collect { URLDecoder.decode(it, 'UTF-8') }
    }

    void "GET keeps repeated url parameters and adds the extra ones"() {
        when:
        def result = service.urlResponse('GET', "${baseUrl}/echo?q=taxa%3AIris&fq=a&fq=b", [extra: 'x', list: ['1', '2']])

        then:
        result.statusCode == 200
        lastRequest.method == 'GET'
        params(lastRequest.query) == ['q=taxa:Iris', 'fq=a', 'fq=b', 'extra=x', 'list=1', 'list=2']
    }

    void "POST sends the extra parameters in the body"() {
        when:
        service.urlResponse('POST', "${baseUrl}/echo?q=a", [extra: 'x'])

        then:
        lastRequest.method == 'POST'
        lastRequest.query == 'q=a'
        lastRequest.body == 'extra=x'
    }

    void "DELETE sends the extra parameters in the query"() {
        when:
        service.urlResponse('DELETE', "${baseUrl}/echo", [id: '1'])

        then:
        lastRequest.method == 'DELETE'
        lastRequest.query == 'id=1'
    }

    void "headers are forwarded except cookies"() {
        when:
        service.urlResponse('GET', "${baseUrl}/echo", null, ['Accept': 'application/json', 'Cookie': 'ALA-Auth=secret'])

        then:
        lastRequest.headers.getFirst('Accept') == 'application/json'
        !lastRequest.headers.containsKey('Cookie')
    }

    void "the user id is sent when authentication is requested"() {
        given:
        service.authService = new Expando(userId: 'user1')

        when:
        service.urlResponse('GET', "${baseUrl}/echo", null, null, null, true)

        then:
        lastRequest.headers.getFirst('X-ALA-userId') == 'user1'
    }

    void "the user id is not sent otherwise"() {
        given:
        service.authService = new Expando(userId: 'user1')

        when:
        service.urlResponse('GET', "${baseUrl}/echo")

        then:
        !lastRequest.headers.containsKey('X-ALA-userId')
    }

    // the JDK server sends 'Content-type', header names are case insensitive
    @PendingFeature(reason = "the Content-Type and Content-Encoding response headers are looked up case sensitively")
    void "text, JSON and gzipped text responses are returned as text"() {
        expect:
        service.getUrl("${baseUrl}/echo") == 'ok'
        service.getUrl("${baseUrl}/json") == '{"a":1}'
        service.urlResponse('GET', "${baseUrl}/json").contentType == 'application/json;charset=UTF-8'
        service.getUrl("${baseUrl}/gzip") == 'compressed text'
    }

    void "binary responses are returned as bytes"() {
        when:
        def result = service.urlResponse('GET', "${baseUrl}/image")

        then:
        result.text == [1, 2, 3] as byte[]
        result.contentType == 'image/png'
    }

    void "a connection error is reported as a 500"() {
        given:
        def closed = new ServerSocket(0)
        int port = closed.localPort
        closed.close()

        expect:
        service.urlResponse('GET', "http://127.0.0.1:${port}/nothing").statusCode == 500
        service.getUrl("http://127.0.0.1:${port}/nothing") == ''
    }
}
