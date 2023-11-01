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
        waitFor 10, {addAreaModule.gazAutoListCheckbox("ASGS").displayed}
        addAreaModule.gazAutoListCheckbox("ASGS").click()

        waitFor 10, {addAreaModule.gazAutoList("Tasmania").displayed}

        when:
        interact {
            moveToElement(addAreaModule.gazAutoList("Tasmania"))
        }
        then:
        addAreaModule.gazAutoList("Tasmania").click()

        and:
        waitFor 10, {addAreaModule.isNextBtnEnabled()}
        addAreaModule.nextBtn.click()

        then:
        waitFor 10, { layerListModule.getLayer("Tasmania").displayed }
        waitFor 5, { modalModule.title == title  }

        when:
        modalModule.moveToStep(2)

        then:
        waitFor 10, {modalModule.availableLayers.size() > 0 }

        when:
        modalModule.selectPredefiendLayers("BIOCLIM 1960 best 5")

        then:
        waitFor 10, { modalModule.sizeOfSelectedLayers().startsWith("5 ")   }

        when:
        modalModule.moveToStep(3)
        modalModule.setInputParam("Number of groups to produce (2-30)", 20)

        then:
        waitFor 10, { modalModule.isNextBtnEnabled()}
        modalModule.nextBtn.click()

        then:
        waitFor 10, { modalModule.title == title}
        waitFor 120, { modalModule.openNewWindow.displayed }
        waitFor 10, { modalModule.outputDoc.displayed }
        Thread.sleep(pause*2)

    }

}