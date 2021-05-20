import geb.spock.GebSpec
import page.SpatialHubHomePage

class ToolTaxonFreqSpec extends GebSpec {

    int pause = 3000

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady()}
    }

    def "single taxon frequency"(){
        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Taxon Frequency")

        then:
        waitFor 10, { modalModule.title == "Taxon Frequency" }

        when:
        modalModule.moveToStep(0)
        modalModule.selectArea("Current extent")

        //ignore step 1

        and:
        modalModule.moveToStep(2)

        then:
        //This tool has multiple species selection
        modalModule.speciesTextInput[0].click()
        modalModule.speciesTextInput[0].value("Eucalyptus gunnii")

        waitFor 10, {modalModule.speciesAutocompleteList.first().text().startsWith("Eucalyptus gunnii")}

        and:
        modalModule.speciesAutocompleteList.first().click()

        //ignore step 3
        // Be aware of the second species selection in implementation
        // refer to ToolScatterPlotSpec

        then:
        waitFor 10, { modalModule.isNextBtnEnabled() }
        modalModule.nextBtn.click()

        then:
        waitFor 120, { modalModule.openNewWindow.displayed }
        waitFor 10, { modalModule.outputDoc.displayed }

        //Need to switch iFrame before access an element in iFrame
        driver.switchTo().frame("outputDocs")

        waitFor 10, { $("img[src='frequency.jpeg']").displayed }
        waitFor 10, { $("img[src='cumulative_frequency.jpeg']").displayed }

        Thread.sleep(pause)

    }

}