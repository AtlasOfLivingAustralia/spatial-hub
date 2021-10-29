import geb.spock.GebSpec
import page.SpatialHubHomePage

class ToolGeneratePointsSpec extends GebSpec {

    int pause = 3000

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady()}
    }

    def "generate points"(){
        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Generate Points")

        then:
        waitFor 10, { modalModule.title == "Generate points." }

        //Move to TAS
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
        addAreaModule.gazAutoList("Ben Lomond").click()

        and:
        addAreaModule.nextBtn.click()

        then:
        waitFor 10, { layerListModule.getLayer("Ben Lomond").displayed }

        when:
        modalModule.selectArea("Ben Lomond")

        and:
        modalModule.moveToStep(1)

        then:
        waitFor 10, {modalModule.isNextBtnEnabled()}
        modalModule.nextBtn.click()

        then:
        waitFor 10, { modalModule.title == "Generate points." }

        waitFor 120, { layerListModule.getLayer("Points in [Ben Lomond] on 0.1 degree grid").displayed }

        Thread.sleep(pause)
    }

}