

import geb.spock.GebSpec
import page.SpatialHubHomePage

class AddSpeciesSpec extends GebSpec {

    int pause = 3000

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady()  }
    }

    def "Add species to Australia"() {
        when:
        menuModule.clickMenu("Add to map ") //NOTICE: space
        menuModule.clickMenuitem("Species")

        then:
        waitFor 20, {  addSpeciesModule.title == "Add a species layer to the map"}

        and:
        addSpeciesModule.speciesTextInput.click()
        addSpeciesModule.speciesTextInput.value("Eucalyptus gunnii")

        then:
        waitFor 20, {addSpeciesModule.speciesAutocompleteList.first().text().contains("Eucalyptus gunnii")}

        when:
        addSpeciesModule.selectSpeciesInAutocomplete("Eucalyptus gunnii")

        interact {
            modalModule.moveToStep(3)
            modalModule.selectArea("Australia")
        }

        then:
        waitFor 10, { addSpeciesModule.isNextBtnEnabled() }

        and:
        addSpeciesModule.nextBtn.click()

        then:
        waitFor 10, { layerListModule.getLayer("Eucalyptus gunnii (Australia)").displayed }
        //waitFor 10, { addSpeciesModule.selectedLayerPanel.value().startsWith("Eucalyptus gunnii (Australia)")}
        waitFor 10, {legendModule.title == "Eucalyptus gunnii (Australia)"}

        when:
        interact {
            Thread.sleep(2*pause) //Wait dialog fade off
            moveToElement(legendModule.facetListDropdown)
            legendModule.facetListDropdown.click()
        }

        then:
        waitFor 10, { legendModule.facetListOptions.first().displayed}

        when:
        legendModule.selectFacet("Scientific name").click()

        then:
        waitFor 10, { legendModule.facetContentTable.displayed }
        waitFor { legendModule.recordsOfSelectedFacetInContentTable.size() >= 3 }
        for ( int i = 0; i < legendModule.recordsOfSelectedFacetInContentTable.size(); i++) {
            Thread.sleep(1000)
            legendModule.checkRecordOfSelectedFacet(i)
        }
    }

    def "Add speciesList to Australia"() {
        when:
        menuModule.clickMenu("Add to map ") //NOTICE: space
        menuModule.clickMenuitem("Species")

        then:
        waitFor 20, {  addSpeciesModule.title == "Add a species layer to the map"}

        and:
        addSpeciesModule.importSpeciesListRadioBtn.click()

        then:
        waitFor 15, {addSpeciesModule.speciesListForm.displayed}

        when:
        addSpeciesModule.speciesListInput.value('Eucalyptus gunnii, red kangaroo')

        interact {
            addSpeciesModule.parseSpeciesListBtn.click()
        }

        then:
        waitFor 10, { addSpeciesModule.speciesListTable.displayed }
        Thread.sleep(pause)
        addSpeciesModule.findSpeciesInTable("Eucalyptus gunnii",1).displayed
        addSpeciesModule.findSpeciesInTable("Osphranter rufus",1).displayed

        and:
        addSpeciesModule.nextBtn.click()

        then:
        waitFor 10, { addSpeciesModule.newListNameInput.displayed }

        and:
        addSpeciesModule.newListNameInput.value("my test species")
        addSpeciesModule.nextBtn.click()

        then:
        Thread.sleep(pause)
        waitFor 10, { addSpeciesModule.isNextBtnEnabled() }

        when:
        interact {
            modalModule.moveToStep(3)
            modalModule.selectArea("Australia")
        }

        and:
        addSpeciesModule.nextBtn.click()

        then:
        waitFor 30, { layerListModule.getLayer("my test species (Australia)").displayed }
        //waitFor 10, { addSpeciesModule.selectedLayerPanel.value().startsWith("Eucalyptus gunnii (Australia)")}
        waitFor 10, {legendModule.title == "my test species (Australia)"}
        Thread.sleep(pause)
    }
}