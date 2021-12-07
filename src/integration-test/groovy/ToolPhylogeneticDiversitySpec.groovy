import geb.spock.GebSpec
import page.SpatialHubHomePage

class ToolPhylogeneticDiversitySpec extends GebSpec {

    int pause = 3000
    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady()}
    }

    def "phylogenetic diversity"(){
        String title = "Phylogenetic diversity."

        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Phylogenetic Diversity")

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
        addAreaModule.gazAutoList("Tasmania").click()

        and:
        waitFor 10, {addAreaModule.isNextBtnEnabled()}
        addAreaModule.nextBtn.click()

        then:
        waitFor 10, { layerListModule.getLayer("Tasmania").displayed }
        waitFor 5, { modalModule.title == title  }

        when:
        modalModule.selectArea("Tasmania")
        modalModule.moveToStep(2)
        toolPhylogeneticModule.selectStudy("92")  //Australian Wattles

        then:
        modalModule.nextBtn.click()

        then:
        waitFor 10, { modalModule.title == title}
//        waitFor 120, { modalModule.status.contains("running")}
//        waitFor 60, { modalModule.status.contains("Fetching species in Tasmania")}

        waitFor 200, {modalModule.reportName == "PhylogeneticDiversity (phylogeneticDiversity.csv)" }


        Float.parseFloat(modalModule.getCellByName("Tasmania",2)) > 1.0
        Float.parseFloat(modalModule.getCellByName("Tasmania",3)) >= 0.1

    }

}