

import geb.spock.GebSpec
import page.SpatialHubHomePage

class AddLayerSpec extends GebSpec {

    int pause = 3000
    def env = driver.currentUrl.contains("test")?"test":"dev"

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
        if(env == "test")
            addLayerModule.setLayerFilter("bioclim_28");
        else
            addLayerModule.setLayerFilter("bio28");

        addLayerModule.availableLayers.size() >= 1
        //addLayerModule.clickLayer("Annual Mean Moisture Index (Bioclim 28)")
        addLayerModule.selectFirstAvailableLayer()
        waitFor 10, { addLayerModule.isNextBtnEnabled() }
        addLayerModule.nextBtn.click()

        waitFor 20, { legendModule.startsWith("Annual Mean Moisture Index (Bioclim 28)")}

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