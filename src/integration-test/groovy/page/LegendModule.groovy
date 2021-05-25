package page

import geb.Module

class LegendModule extends Module {
    static content = {
        title { $("div#legend").find('h3.panel-title').find("[testTag='legendTitle']").text() }

        //Style
        styleSelection { $("select[testTag='layerStyleInLegend']") }

        //Facets in legend IS DIFFERENT with those in popup modal
        facetListDropdown (required:false){ $("select#facet[testTag='facetInLegend']") }
        facetListOptions (required:false){ facetListDropdown.children("option") }

        facetContentTable (required:false){ $("table[testTag='facetContent']") }
        recordsOfSelectedFacetInContentTable(required:false){ $("table[testTag='facetContent'] tbody tr[testTag='recordsOfSelectedFacet']") }

        //chart
        chart (required:false) { $("div#chartDiv") }
    }

    void selectStyle (String name) {
         $("select[testTag='layerStyleInLegend'] option" , text : name).click()
    }

    def selectFacet(name) {
        return facetListDropdown.find("option", text : name )
    }

//    void clickFacetInput() {
//        js.exec( " \$(\"select#facet\").click()")
//    }
    // check/click the Nth record
    def checkRecordOfSelectedFacet (n) {
        recordsOfSelectedFacetInContentTable[n].children()[0].click()
    }

}
