import geb.spock.GebSpec
import page.SpatialHubHomePage

class ToolScatterPlotSpec extends GebSpec {

    int pause = 3000

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady()}
    }

    def "single scatterplot - TAS"(){
        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Scatterplot - single")

        then:
        waitFor 10, { modalModule.title == "Create a scatterplot." }

        //Move to TAS
        when:
        modalModule.moveToStep(1)
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
        addAreaModule.nextBtn.click()

        waitFor 5, { modalModule.title == "Create a scatterplot."  }

        when:
        modalModule.moveToStep(1)

        and:
        //This tool has multiple species selection
        modalModule.speciesTextInput[0].click()
        modalModule.speciesTextInput[0].value("Eucalyptus gunnii")

        then:
        waitFor 10, {modalModule.speciesAutocompleteList.first().text().startsWith("Eucalyptus gunnii")}

        and:
        modalModule.speciesAutocompleteList.first().click()

        //ignore step 3
        when:
        modalModule.moveToStep(3)

        then:
        waitFor 10, {modalModule.availableLayers.size() > 0 }

        when:
        modalModule.selectLayer("Precipitation - annual (Bio12)")
        modalModule.selectLayer("Temperature - annual mean (Bio01)")

        then:
        waitFor 10, { modalModule.isNextBtnEnabled() }
        modalModule.nextBtn.click()

        waitFor 10, { modalModule.title == "Create a scatterplot." }
        // waitFor 20, { modalModule.status.includes("running")}  //too quick to capture

        then:
        waitFor 20, { layerListModule.getLayer("Eucalyptus gunnii").displayed }
        waitFor 20, { legendModule.title == "Eucalyptus gunnii"}
        waitFor 20, { legendModule.chart.displayed}
    }


    def "multiple scatterplot - TAS"(){
        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Scatterplot - multiple")

        then:
        waitFor 10, { modalModule.title == "Scatterplot list." }

        //Move to TAS
        when:
        modalModule.moveToStep(1)
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
        addAreaModule.nextBtn.click()

        waitFor 5, { modalModule.title == "Scatterplot list."  }

        when:
        modalModule.moveToStep(1)

        and:
        //This tool has multiple species selection
        modalModule.speciesTextInput[0].click()
        modalModule.speciesTextInput[0].value("Eucalyptus gunnii")

        then:
        waitFor 10, {modalModule.speciesAutocompleteList[0].first().text().startsWith("Eucalyptus gunnii")}

        and:
        modalModule.speciesAutocompleteList[0].first().click()

        //ignore step 3
        when:
        modalModule.moveToStep(2)

        then:
        waitFor 10, {modalModule.availableLayers.size() > 0 }

        when:
        modalModule.selectLayer("Precipitation - annual (Bio12)")
        modalModule.selectLayer("Temperature - annual mean (Bio01)")
        modalModule.selectLayer("GEOMACS - geometric mean")


        //Select another species
        and:
        modalModule.moveToStep(3)

        and:
        modalModule.searchSpeciesRadioBtn[1].click()
        waitFor 10, { modalModule.speciesTextInput[1].displayed }

        modalModule.speciesTextInput[1].click()
        modalModule.speciesTextInput[1].value("Eucalyptus")

        then:
        //waitFor 10, {modalModule.speciesAutocompleteList[1].first().text().startsWith("Eucalyptus")}
        Thread.sleep(pause)

        //select the first species
        when:
        modalModule.selectFirstSpeciesInAutocomplete()

        then:
        waitFor 10, { modalModule.isNextBtnEnabled() }
        modalModule.nextBtn.click()

        waitFor 10, { modalModule.title == "Scatterplot list." }
        //waitFor 20, { modalModule.status.includes("running")}

        then:
        waitFor 180, { modalModule.openNewWindow.displayed }
        waitFor 10, { modalModule.outputDoc.displayed }

        //Need to switch iFrame before access an element in iFrame
        driver.switchTo().frame("outputDocs")

        Thread.sleep(pause)
    }
}