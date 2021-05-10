

import geb.spock.GebSpec
import page.SpatialHubHomePage

class AddSpeciesSpec extends GebSpec {
    int pause =  2000

    def setup() {
        when:
        via SpatialHubHomePage
        //Login if not logged in
        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady() }
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
        waitFor 10, {addSpeciesModule.speciesAutocompleteList.first().text().startsWith("Eucalyptus gunnii")}

        and:
        addSpeciesModule.speciesAutocompleteList.first().click()

        when:
        interact {
            addSpeciesModule.scrollToAreaBlock()
            addSpeciesModule.selectArea("Australia")
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
        legendModule.selectFacet("taxon_name").click()

        then:
        waitFor 10, { legendModule.facetContentTable.displayed }
        waitFor { legendModule.recordsOfSelectedFacetInContentTable.size() >= 3 }
        for ( int i = 0; i < legendModule.recordsOfSelectedFacetInContentTable.size(); i++) {
            Thread.sleep(1000)
            legendModule.checkRecordOfSelectedFacet(i)
        }
    }

}