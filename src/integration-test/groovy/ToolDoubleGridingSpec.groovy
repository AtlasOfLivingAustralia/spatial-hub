import geb.spock.GebSpec
import page.SpatialHubHomePage

class ToolDoubleGridingSpec extends GebSpec {

    int pause = 3000

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady()}
    }

    def "double griding"(){
        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Double Gridding")

        then:
        waitFor 10, { modalModule.title == "Double gridding sites by species" }

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
        waitFor 5, { modalModule.title == "Double gridding sites by species"  }

        when:
        modalModule.moveToStep(1)

        then:
        //This tool has multiple species selection
        modalModule.speciesTextInput[0].click()
        modalModule.speciesTextInput[0].value("Eucalyptus gunnii")

        waitFor 10, {modalModule.speciesAutocompleteList.first().text().contains("Eucalyptus gunnii")}

        when:
        modalModule.selectSpeciesInAutocomplete("Eucalyptus gunnii")
        modalModule.moveToStep(2)

        and:
        modalModule.nextBtn.click()

        then:
        waitFor 10, { modalModule.title == "Double gridding sites by species" }

        waitFor 200, { modalModule.openNewWindow.displayed }
        waitFor 10, { modalModule.outputDoc.displayed }
        Thread.sleep(pause)
        modalModule.closeBtn.click()
        //Need to switch iFrame before access an element in iFrame
        //driver.switchTo().frame("outputDocs")
    }

}