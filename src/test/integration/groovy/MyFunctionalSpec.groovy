
import geb.spock.GebSpec

class MyFunctionalSpec extends GebSpec {

    def "can access The Book of Geb via homepage"() {
        go "http://gebish.org"
        assert title == "Geb - Very Groovy Browser Automation"
    }
}
