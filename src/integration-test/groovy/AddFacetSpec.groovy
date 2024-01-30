

import geb.spock.GebSpec
import page.SpatialHubHomePage

class AddFacetSpec extends SpatialGebSpec {


    def "Add facet"(){
        when:
        menuModule.clickMenu("Add to map ") //NOTICE: space
        menuModule.clickMenuitem("Facet")

        //Add BBox
        then:
        waitFor 20, { addFacetModule.title == "Add species using a facet." }

        when:
        addFacetModule.selectArea("Australia")
        interact {
            moveToElement(addFacetModule.facetModule.facetListDropdown)
            addFacetModule.facetModule.clickFacetInput()
        }

        then:
        waitFor 10, { addFacetModule.facetModule.facetListOptions.first().displayed}

        when:
        Thread.sleep(pause) //Waiting
        addFacetModule.facetModule.facetListDropdown.click()
        addFacetModule.facetModule.selectFacet("Scientific name").click()
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