import geb.spock.GebSpec
import page.SpatialHubHomePage

class ToolCompareAreaSpec extends GebSpec {

    int pause = 3000

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady()}
    }

    def "compare area"(){
        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Compare Areas")

        then:
        waitFor 10, { modalModule.title == "Compare areas." }

        //Add Ben Lomond
        when:
        modalModule.moveToStep(0)

        then:
        modalModule.defineNewAreaBtn.click()

        waitFor 20, { addAreaModule.title == "Add area" }
        addAreaModule.gazRadioBtn.click()
        addAreaModule.nextBtn.click()
        waitFor 10, { addAreaModule.gazInput.displayed }

        and:
        addAreaModule.gazInput.value("Ben Lomond")

        then:
        waitFor 10, {addAreaModule.gazAutoListCheckbox("IBRA 7 Subregions").displayed}
        addAreaModule.gazAutoListCheckbox("IBRA 7 Subregions").click()
        waitFor 10, {addAreaModule.gazAutoList("Ben Lomond").displayed}

        when:
        interact {
            moveToElement(addAreaModule.gazAutoList("Ben Lomond"))
        }
        then:
        addAreaModule.gazAutoList("Ben Lomond").click()


        and:
        waitFor 10, {addAreaModule.isNextBtnEnabled()}
        addAreaModule.nextBtn.click()

        then:
        waitFor 10, { layerListModule.getLayer("Ben Lomond").displayed }

        when:
        modalModule.selectArea("Ben Lomond")
        modalModule.selectArea("Australia")

        and:
        modalModule.moveToStep(1)
        //click lifeform
        modalModule.lifeformRadioBtn.click()
        modalModule.selectLifeform("Birds")

        then:
        waitFor 10, {modalModule.isNextBtnEnabled()}
        modalModule.nextBtn.click()

        then:
        waitFor 10, { modalModule.title == "Compare areas." }

        waitFor 240, { modalModule.openNewWindow.displayed }
        waitFor 10, { modalModule.outputDoc.displayed }

        //Need to switch iFrame before access an element in iFrame
        driver.switchTo().frame("outputDocs")

        // table in iFrame cannot captured in static content
        int size = $("table[name='areaComparisonResult'] tbody tr").size()
        //last row
        $("table[name='areaComparisonResult'] tbody tr")[6].find("td")[0].text() == "Species found in both areas"
        Integer.parseInt($("table[name='areaComparisonResult'] tbody tr")[6].find("td")[1].text()) > 300

        Thread.sleep(pause)
    }

}