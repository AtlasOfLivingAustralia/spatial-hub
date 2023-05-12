import geb.spock.GebSpec
import groovy.time.TimeDuration
import page.SpatialHubHomePage

class ToolScatterPlotSpec extends GebSpec {

    int pause = 3000
    def env = driver.currentUrl.contains("test")?"test":"dev"

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()
        if (driver.currentUrl.contains("spatial.ala.org.au")) {
            env="prod"
        }

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
        addAreaModule.nextBtn.click()

        waitFor 5, { modalModule.title == "Create a scatterplot."  }

        when:
        modalModule.moveToStep(1)

        and:
        //This tool has multiple species selection
        modalModule.speciesTextInput[0].click()
        modalModule.speciesTextInput[0].value("Eucalyptus gunnii")

        then:
        waitFor 20, {modalModule.speciesAutocompleteList.first().text().contains("Eucalyptus gunnii")}

        when:
        modalModule.selectSpeciesInAutocomplete("Eucalyptus gunnii")
        modalModule.moveToStep(3)

        then:
        waitFor 10, {modalModule.availableLayers.size() > 0 }

        when:
        modalModule.filterLayer("Bio12")
        modalModule.selectLayer("WorldClim 2.1: Precipitation - annual")
        if (env="prod") {
            modalModule.filterLayer("Bio01")
            modalModule.selectLayer("Temperature - annual mean (Bio01)")
        } else {
            modalModule.filterLayer("Bioclim 01")
            modalModule.selectLayer("Annual Mean Temperature (Bioclim 01) from 1976-2005 at 9s / 250m resolution")
        }

        then:
        waitFor 10, { modalModule.isNextBtnEnabled() }
        modalModule.nextBtn.click()

        waitFor 20, { modalModule.title == "Create a scatterplot." }

        then:
        waitFor 480, { layerListModule.getLayer("Eucalyptus gunnii").displayed }

        waitFor 20, { legendModule.title == "Eucalyptus gunnii"}
        waitFor 20, { legendModule.chart.displayed}
        Thread.sleep(pause)
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
        waitFor 20, {addAreaModule.gazAutoListCheckbox("ASGS").displayed}
        addAreaModule.gazAutoListCheckbox("ASGS").click()
        waitFor 20, {addAreaModule.gazAutoList("Tasmania").displayed}
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
        addAreaModule.nextBtn.click()

        waitFor 5, { modalModule.title == "Scatterplot list."  }

        when:
        modalModule.moveToStep(2)

        and:
        //This tool has multiple species selection
        modalModule.speciesTextInput[0].click()
        modalModule.speciesTextInput[0].value("Eucalyptus gunnii")

        then:
        waitFor 20, {modalModule.speciesAutocompleteList[0].first().text().contains("Eucalyptus gunnii")}

        when:
        //modalModule.speciesAutocompleteList[0].first().click()
        modalModule.selectSpeciesInAutocomplete("Eucalyptus gunnii")

        modalModule.moveToStep(3)

        then:
        waitFor 10, {modalModule.availableLayers.size() > 0 }

        when:
        modalModule.filterLayer("Bio12")
        modalModule.selectLayer("WorldClim 2.1: Precipitation - annual")
        if (env="prod") {
            modalModule.filterLayer("Bio01")
            modalModule.selectLayer("Temperature - annual mean (Bio01)")
            modalModule.filterLayer("Bio28")
            modalModule.selectLayer("Moisture Index - annual mean (Bio28)")
        } else {
            modalModule.filterLayer("Bioclim 01")
            modalModule.selectLayer("Annual Mean Temperature (Bioclim 01) from 1976-2005 at 9s / 250m resolution")
            modalModule.filterLayer("Bioclim 28")
            modalModule.selectLayer("Annual Mean Moisture Index (Bioclim 28) from 1976-2005 at 9s / 250m resolution")
        }



        //Select another species
        and:
        modalModule.moveToStep(4)

        and:
        modalModule.searchSpeciesRadioBtn[1].click()
        waitFor 10, { modalModule.speciesTextInput[1].displayed }

        modalModule.speciesTextInput[1].click()
        modalModule.speciesTextInput[1].value("Eucalyptus")

        then:
        //waitFor 10, {modalModule.speciesAutocompleteList[1].first().text().startsWith("Eucalyptus")}
        Thread.sleep(pause)
        //select the second species
        when:
        //js.exec("window.scrollTo(0, document.getElementsByClassName(\"modal-body\").scrollHeight);")
        modalModule.selectBackgroundSpeciesInAutocomplete("Eucalyptus")

        then:
        waitFor 10, { modalModule.isNextBtnEnabled() }
        modalModule.nextBtn.click()

        waitFor 10, { modalModule.title == "Scatterplot list." }
        //waitFor 20, { modalModule.status.contains("running")}

        then:
        waitFor 360, { modalModule.openNewWindow.displayed }
        waitFor 10, { modalModule.outputDoc.displayed }

        //Need to switch iFrame before access an element in iFrame
        driver.switchTo().frame("outputDocs")

        Thread.sleep(pause)
    }
}