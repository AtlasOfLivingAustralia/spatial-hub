import geb.spock.GebSpec
import page.SpatialHubHomePage

class ToolAooEooSpec extends GebSpec {

    int pause = 3000

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady()}
    }

    def "AOO and EOO"(){
        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Calculate AOO and EOO")

        then:
        waitFor 10, { modalModule.title == "Area of Occupancy, Extent of Occurrence and Alpha Hull" }

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
        waitFor 30, { layerListModule.getLayer("Tasmania").displayed }
        waitFor 5, { modalModule.title == "Area of Occupancy, Extent of Occurrence and Alpha Hull"  }

        when:
        modalModule.moveToStep(1)
        modalModule.selectCheckbox("Limit by a date range")
        modalModule.setStartDate("2000-01-01")
        modalModule.setEndDate("2020-01-01")

        then:
        //This tool has multiple species selection
        modalModule.speciesTextInput[0].click()
        modalModule.speciesTextInput[0].value("Eucalyptus gunnii")

        waitFor 20, {modalModule.speciesAutocompleteList.first().text().contains("Eucalyptus gunnii")}

        when:
        modalModule.selectSpeciesInAutocomplete("Eucalyptus gunnii")

        modalModule.moveToStep(3)
        modalModule.setInputParam("Grid resolution (decimal degrees)", 0.2)

        and:
        modalModule.nextBtn.click()

        then:
        waitFor 10, { modalModule.title == "Area of Occupancy, Extent of Occurrence and Alpha Hull" }

        waitFor 120, { modalModule.openNewWindow.displayed }
        waitFor 10, { modalModule.outputDoc.displayed }

        //Need to switch iFrame before access an element in iFrame
        driver.switchTo().frame("outputDocs")

        waitFor 10, { $("div.aooeoo").displayed }

        $("div.aooeoo table tr")[0].find("td")[0].text().contains("Number of records used for the calculations")
        Integer.parseInt($("div.aooeoo table tr")[0].find("td")[1].text()) > 200

        when:
        driver.switchTo().defaultContent()
        modalModule.closeBtn.click()

        then:
        waitFor 10, { layerListModule.getLayer("Area of occupancy (area): Eucalyptus gunnii").displayed}
        Thread.sleep(pause)

    }

}