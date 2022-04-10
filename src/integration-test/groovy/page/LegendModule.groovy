package page

import geb.Module

class LegendModule extends Module {
    static content = {
        title { $("div#legend").find('h3.panel-title').find("[testTag='legendTitle']").text() }

        envelopeLegend(required: false)  { $("div[name='envelope']") }
        searchEnvelopeLayer(required: false)  { $("input[testTag='searchLayer']") }
        nextEnvelopeBtn(required: false) {$("button.btn[testTag='next']")}

        //Style
        styleSelection { $("select[testTag='layerStyleInLegend']") }

        //Facets in legend IS DIFFERENT with those in popup modal
        facetListDropdown (required:false){ $("select#facet[testTag='facetInLegend']") }
        facetListOptions (required:false){ facetListDropdown.children("option") }

        facetContentTable (required:false){ $("table[testTag='facetContent']") }
        recordsOfSelectedFacetInContentTable(required:false){ $("table[testTag='facetContent'] tbody tr[testTag='recordsOfSelectedFacet']") }

        //chart
        chart (required:false) { $("div#chartDiv") }

        //search layer in legend
        searchLayerInput(required: false) { $("div#searchDiv input")}

        nextBtn(required: false) {$("button.btn[testTag='nextInNewAreaLegend']")}
    }

    void selectStyle (String name) {
        $("select[testTag='layerStyleInLegend'] option").find{it.value()== name}.click()
    }

    def selectFacet(name) {
        return facetListDropdown.find("option", text : name )
    }

    void selectLayerInAutocomplete(name) {
        $("ul li.ui-menu-item a").find("text":startsWith(name))[0].click()
    }

    // check/click the Nth record
    def checkRecordOfSelectedFacet (n) {
        recordsOfSelectedFacetInContentTable[n].children()[0].click()
    }
}
