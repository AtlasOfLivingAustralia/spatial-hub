

import geb.spock.GebSpec
import page.SpatialHubHomePage

class AddLayerSpec extends GebSpec {

    int pause = 3000

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady()}
    }

    def "Add layer"(){

        when:
        menuModule.clickMenu("Add to map ") //NOTICE: space
        menuModule.clickMenuitem("Layer")

        //Add BBox
        then:
        waitFor 10, { addLayerModule.title == "Add environmental and contextual layers to the map." }
        Thread.sleep(pause)
        addLayerModule.availableLayers.size() > 2
        addLayerModule.clickLayer("GEOMACS - geometric mean")
        waitFor 10, { addLayerModule.isNextBtnEnabled() }
        addLayerModule.nextBtn.click()

        waitFor 20, { legendModule.title == "GEOMACS - geometric mean"}

        when:
        legendModule.styleSelection.click()
        legendModule.selectStyle("linear")

        then:
        Thread.sleep(pause)

        when:
        legendModule.styleSelection.click()
        legendModule.selectStyle("default")

        then:
        Thread.sleep(pause)
    }

}