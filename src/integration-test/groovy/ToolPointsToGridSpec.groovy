import geb.spock.GebSpec
import page.SpatialHubHomePage

class ToolPointsToGridSpec extends GebSpec {

    int pause = 3000

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady()}
    }

    def "points to grid"(){
        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Points to Grid")

        then:
        waitFor 10, { modalModule.title == "Create grids from points." }

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
        addAreaModule.gazAutoList("Tasmania").click()

        and:
        addAreaModule.nextBtn.click()

        then:
        waitFor 10, { layerListModule.getLayer("Tasmania").displayed }
        waitFor 5, { modalModule.title == "Create grids from points."  }

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
        modalModule.setInputParam("grid cell size", 0.1)
        modalModule.setInputParam("Produce sites by species matrix.", true)
        modalModule.setInputParam("Produce occurrence density layer.", true)
        modalModule.setInputParam("Produce species richness layer.", true)
        modalModule.setSelectionParam("The number of cells in the moving average window (for occurrence density and species richness layers)", "3x3")

        and:
        modalModule.nextBtn.click()

        then:
        waitFor 10, { modalModule.title == "Create grids from points." }
        waitFor 40, { modalModule.status.contains("running") }

        waitFor 200, { modalModule.openNewWindow.displayed }
        waitFor 10, { modalModule.outputDoc.displayed }

        //Need to switch iFrame before access an element in iFrame
        driver.switchTo().frame("outputDocs")

//        waitFor 10, { $("img[src='occurrence_density.png'], img[src='species_richness.jpeg']").displayed }

        Thread.sleep(pause)

    }

}