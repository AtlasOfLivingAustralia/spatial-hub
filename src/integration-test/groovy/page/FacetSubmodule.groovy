package page

import geb.Module

class FacetSubmodule extends Module {
    static content = {

        //Facet select may use the same id mulitple times
        facetListDropdown (required:false){ $("select#facet[testTag='facetInModal']").first() }  //e.g. scientific name, year .. etc
        facetListOptions (required:false){ facetListDropdown.children("option") } //e.g. scientific name, year .. etc

        //Facet shown underneath,  e.g. Gymnorhina tibicen etc. species name if we select 'taxon_name'
        facetContentTable (required:false){ $("table#facetList") }
        recordsOfSelectedFacetInContentTable(required:false){ facetContentTable.find("tbody tr[testTag='recordsOfSelectedFacet']") }



        facetFilterInput (required: false) { $("input[testTag='applyFacetFilter']") }
        addFacetFilterBtn (required: false) { $("button[testTag='applyFacetFilter']") }
        clearFacetFilterBtn (required: false) { $("button[testTag='clearFacetFilter']") }

    }


    def selectFacet(name) {
        return $("select#facet option", text : name )
    }

    void clickFacetInput() {
        js.exec( " \$(\"select#facet\").click()")
    }
    def getNameOfRecord(n) {
        //1st is input, 2rd is name, 3rd is count
        recordsOfSelectedFacetInContentTable[n].find('td')[1].text()
    }

    // check/click the Nth record
    void clickRecordOfSelectedFacet (n) {
        recordsOfSelectedFacetInContentTable[n].find('td')[0].click()
    }

}
