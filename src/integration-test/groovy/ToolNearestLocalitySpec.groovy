import geb.spock.GebSpec
import page.SpatialHubHomePage

class ToolNearestLocalitySpec extends GebSpec {

    int pause = 3000

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady()}
    }

    def "nearest locality"(){

        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Nearest Locality")

        then:
        def titleDiv = $("h3.panel-title[testTag='nearestLocalityTitle'] div")
        waitFor 10, { titleDiv.text() == "Nearest locality" }

        when:
        mapModule.drawPoint(50,50)

        then:

        def lat = Float.parseFloat($("p[testTag='latitude']").text().substring("latitude".length()+2) )
        def lon =  Float.parseFloat($("p[testTag='longitude']").text().substring("longitude".length()+2))

        lat <= -10 && lat >= -90
        lon <= 179 && lon >=100
        Thread.sleep(pause)

    }

}