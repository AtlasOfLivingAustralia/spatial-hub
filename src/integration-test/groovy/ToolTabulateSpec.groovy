import geb.spock.GebSpec
import page.SpatialHubHomePage

class ToolTabulateSpec extends GebSpec {

    int pause = 3000

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 30, { menuModule.isReady()}
    }

    def "1D tabulate"(){
        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Tabulate - 1D")

        then:
        waitFor 10, { modalModule.title == "Tabulate - 1D" }

        when:
        modalModule.moveToStep(0)

        and:
        //This tool has multiple species selection
        modalModule.speciesTextInput[0].click()
        modalModule.speciesTextInput[0].value("Eucalyptus gunnii")

        then:
        waitFor 10, {modalModule.speciesAutocompleteList.first().text().contains("Eucalyptus gunnii")}

        when:
        modalModule.selectSpeciesInAutocomplete("Eucalyptus gunnii")

        modalModule.moveToStep(1)

        then:
        waitFor 10, {modalModule.availableLayers.size() > 0 }

        when:
        modalModule.filterLayer("ASGS")
        modalModule.selectLayer("ASGS Australian States and Territories")


        then:
        waitFor 10, { modalModule.isNextBtnEnabled() }
        modalModule.nextBtn.click()

        waitFor 10, { modalModule.title == "Tabulate - 1D" }
        //waitFor 30, { modalModule.status.contains("running")}  //Could be too quick to capture

        then:
        waitFor 30, { modalModule.reportName == "SpeciesByLayer (species_by_layer.csv)" }
        waitFor 10, { modalModule.reportCSVTable.displayed }

        modalModule.getSizeOfCSVTable() > 2
        modalModule.getCellByName("layer",1) ==  "ASGS Australian States and Territories"

        Float.parseFloat(modalModule.getCellByName("Australian Capital Territory",2)) >= 0

        Thread.sleep(pause)
    }

    /**
     * If no data,  Check if "records.*.csv exist in /data/spatial-data/sample
     * records.*.csv generation is scheduled by Travis
     *
     * Develop environment has different layers/data with spatial-test and prod
     * So choose different layers to test
     * @return
     */
    def "2-D tabulation"() {
        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Tabulate - 2D")

        def env = driver.currentUrl.contains("spatial")?"server":"dev"

        then:
        waitFor 10, { modalModule.title == "Tabulate - 2D" }
        waitFor 20, {  toolTabulateModule.layer1.displayed }

        when:

        toolTabulateModule.layer1.click()
        toolTabulateModule.selectLayer1("IBRA 6 Regions")
        toolTabulateModule.layer2.click()
        toolTabulateModule.selectLayer2("ASGS Australian States and Territories")

        toolTabulateModule.reportType.click()
        toolTabulateModule.selectReportType("area")

        Thread.sleep(1000)

        modalModule.nextBtn.click()

        then:
        waitFor 20, { toolTabulateModule.reportIframe.displayed }

        //Need to switch iFrame before access an element in iFrame
        driver.switchTo().frame("outputDocs")

        //moveToElement(toolTabulateModule.reportTable)  //not working? why
        waitFor 10, { toolTabulateModule.reportDisplayed() }
        toolTabulateModule.getTableSize() > 2
        if (env == "server") {
           // Float.parseFloat(toolTabulateModule.getCellByName("Starke Coastal Lowlands", 2)) > 5000
        } else {
            Float.parseFloat(toolTabulateModule.getCellByName("New South Wales",3)) > 111100
        }

        Thread.sleep(pause)
    }
}