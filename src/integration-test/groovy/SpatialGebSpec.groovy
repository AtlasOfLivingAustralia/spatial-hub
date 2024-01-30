import geb.spock.GebSpec;
import page.SpatialHubHomePage;
import grails.testing.mixin.integration.Integration;

class SpatialGebSpec extends GebSpec {
    int pause = 3000
    def env = "test"

    def wktName="Tasmania"
    def wkt4Tas="POLYGON((\n" +
            "  144 -40,\n" +
            "  149 -40,\n" +
            "  149 -44,\n" +
            "  144 -44,\n" +
            "  144 -40\n" +
            "))"

    def setup() {
        given:
        if ( System.getProperty("baseUrl")) {
            baseUrl = System.getProperty("baseUrl")
        } else {
            baseUrl = "http://localhost:8087"
        }

        println("About to testing: " + baseUrl)
        env = baseUrl.contains("test") ? "test" : "dev"
        println("Enviroment set as : " + env)

        when:
        via SpatialHubHomePage

        if (title.startsWith("Signin")) {
            authModule.login()
        }

        then:
        waitFor 20, {menuModule.isReady()}
    }
}