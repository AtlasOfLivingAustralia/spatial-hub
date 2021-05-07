

import geb.spock.GebSpec
import page.SpatialHubHomePage

class AddFacetSpec extends GebSpec {

    int pause = 3000

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.addToMapMenu.displayed }
    }

    def "Add facet"(){
        when:
        menuModule.addToMapMenu.click()
        menuModule.facetMenuitem.click()

        //Add BBox
        then:
        waitFor 20, { addFacetModule.title == "Add species using a facet." }

        when:
        interact {
            addFacetModule.australiaRadioInput.click()
            moveToElement(addFacetModule.facetModule.facetListDropdown)
            addFacetModule.facetModule.clickFacetInput()
        }

        then:
        waitFor 10, { addFacetModule.facetModule.facetListOptions.first().displayed}

        when:
        Thread.sleep(pause) //Waiting
        addFacetModule.facetModule.selectFacet("taxon_name").click()
        waitFor 10, {addFacetModule.facetModule.facetContentTable.displayed}
        waitFor 10, {addFacetModule.facetModule.recordsOfSelectedFacetInContentTable.size() > 0}

        addFacetModule.facetModule.facetFilterInput.value("Eucalyptus gunn")
        addFacetModule.facetModule.addFacetFilterBtn.click()

        then:
        waitFor 10, { addFacetModule.facetModule.facetContentTable.displayed}
        waitFor 10, {addFacetModule.facetModule.recordsOfSelectedFacetInContentTable.size() >= 3}
        addFacetModule.facetModule.getNameOfRecord(0) == "Eucalyptus gunnii"

        when:
        addFacetModule.facetModule.clickRecordOfSelectedFacet(0)

        then:
        addFacetModule.nextBtn.click()
        waitFor 10, { layerListModule.getLayer("Facet (Australia)").displayed }
        waitFor 10, { legendModule.title == "Facet (Australia)"}

        Thread.sleep(pause)
    }


}