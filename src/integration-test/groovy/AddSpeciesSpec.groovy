

import geb.spock.GebSpec
import page.SpatialHubHomePage

class AddSpeciesSpec extends SpatialGebSpec {

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
        waitFor 20, {legendModule.title == "Eucalyptus gunnii (Australia)"}
        sleep(pause)

        //Check charts
        and:
        layerListModule.displayAreaInfo("Eucalyptus gunnii (Australia)")

        then:
        waitFor 10, {$("div.modal-title").text() == "Species layer - Eucalyptus gunnii (Australia)"}
        sleep(pause)

        and:
        modalModule.closeBtn.click()

        then:
        waitFor 10, { layerListModule.getLayer("Eucalyptus gunnii (Australia)").displayed }


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
        waitFor 20, { addSpeciesModule.isNextBtnEnabled() }

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

    def "Add authoritative speciesList to Australia"() {
        when:
        menuModule.clickMenu("Add to map ") //NOTICE: space
        menuModule.clickMenuitem("Species")

        then:
        waitFor 20, {  addSpeciesModule.title == "Add a species layer to the map"}

        and:
        addSpeciesModule.chooseListInputOption.click()

        then:
        waitFor 15, {addSpeciesModule.searchInSpeciesListInput.displayed}

        when:
        addSpeciesModule.searchInSpeciesListInput.value('GRIIS')

        then:
        waitFor 10, { addSpeciesModule.speciesListTable.displayed }
        Thread.sleep(pause)
        addSpeciesModule.findSpeciesInTable("GRIIS - Global Register of Introduced and Invasive Species - Australia",1).displayed
        assert addSpeciesModule.isAuthoritative("GRIIS - Global Register of Introduced and Invasive Species - Australia",1) == true

        and:
        addSpeciesModule.selectSpeciesInTable("GRIIS - Global Register of Introduced and Invasive Species - Australia", 0)

        when:
        interact {
            modalModule.moveToStep(3)
            modalModule.selectArea("Australia")
        }

        and:
        addSpeciesModule.nextBtn.click()

        then:
        waitFor 30, { layerListModule.getLayer("GRIIS - Global Register of Introduced and Invasive Species - Australia (Australia)").displayed }
        waitFor 100, {legendModule.title == "GRIIS - Global Register of Introduced and Invasive Species - Australia (Australia)"}
        Thread.sleep(pause*3)
    }
}