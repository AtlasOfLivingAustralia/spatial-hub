import geb.spock.GebSpec
import page.SpatialHubHomePage

class ToolClassifySpec extends GebSpec {

    int pause = 3000
    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady()}
    }

    def "classify"(){
        String title = "Classification of environmental layers in an area."

        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Classify")

        then:
        waitFor 10, { modalModule.title == title }

        when:
        modalModule.moveToStep(0)
        modalModule.defineNewAreaBtn.click()

        then:
        waitFor 20, { addAreaModule.title == "Add area" }
        addAreaModule.gazRadioBtn.click()
        addAreaModule.nextBtn.click()
        waitFor 10, { addAreaModule.gazInput.displayed }

        and:
        addAreaModule.gazInput.value("Tasmania")

        then:
        waitFor 10, {addAreaModule.gazAutoList("Tasmania").displayed}
        addAreaModule.gazAutoList("Tasmania").click()

        and:
        addAreaModule.nextBtn.click()

        then:
        waitFor 10, { layerListModule.getLayer("Tasmania").displayed }
        waitFor 5, { modalModule.title == title  }

        when:
        modalModule.moveToStep(2)

        then:
        waitFor 10, {modalModule.availableLayers.size() > 0 }

        when:
        modalModule.selectLayer("Precipitation - annual (Bio12)")
        modalModule.selectLayer("Temperature - annual mean (Bio01)")

        and:
        modalModule.moveToStep(2)
        modalModule.setInputParam("Number of groups to produce (2-30)", 20)

        then:
        waitFor 10, { modalModule.isNextBtnEnabled()}
        modalModule.nextBtn.click()

        then:
        waitFor 10, { modalModule.title == title}

//        waitFor 120, { modalModule.openNewWindow.displayed }
//        waitFor 10, { modalModule.outputDoc.displayed }
//
//        //Need to switch iFrame before access an element in iFrame
//        driver.switchTo().frame("outputDocs")
//
//
//
//        when:
//        driver.switchTo().defaultContent()
//        modalModule.closeBtn.click()
//
//        then:
//        //waitFor 10, { layerListModule.getLayer("Area of occupancy (area): Eucalyptus gunnii").displayed}
//        Thread.sleep(pause)

    }

}