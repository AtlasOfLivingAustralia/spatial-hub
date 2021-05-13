package page

import geb.Module

/**
 * Modal popped up when click add facets / species / tools
 */

class ModalModule extends Module {

    static content = {
        title { $("h4.modal-title[testTag='modalTitle']").text() }

        //species option
        //Some tools may contain multiple copy, etc scatterplot
        searchSpeciesRadioBtn (required: false) { $("input[type='radio'][value='searchSpecies']") }
        speciesTextInput (required:false) {$("input#speciesAutoComplete")}
        // species autocomplete list
        speciesAutocompleteList(required:false) {$("ul li.ui-menu-item a")}

        lifeformRadioBtn(required: false) { $("input[type='radio'][value='lifeform']") }

        //areas
        //australiaRadioInput(required:false) {$("input[value='Australia']")}
        defineNewAreaBtn(required:false) { $("button[testTag='createArea']") }

        //facets
        facetSelection(required:false) {$("select#facet[ng-model='facet']")}
        facetSelectionOptions(required:false) {$("select#facet[ng-model='facet'] option")}

        //layers
        availableLayers (required:false) { $("tr[testTag='availableLayers'] td[testTag='layerName']")}

        //display status of the task
        status { $("textarea.logText").text() }

        // CSV report table
        reportName {$("h4.modal-title[testTag='reportName']").text()}
        reportCSVTable { $("Table[testTag='reportCSVTable']") }

        //scatterplot, taxon frequency etc
        openNewWindow { $("a", text: "open in new window") }

        //Need to switch iFrame before access an element in iFrame
        //e.g  driver.switchTo().frame("outputDocs")
        outputDoc { $("iframe#outputDocs") }

        //Shared the modal buttons
        nextBtn { $("button[name='next']") }
        cancelBtn { $("button[name='cancel']") }
    }

    //Support: Current extent, Australia, World
    void selectArea(name) {
        $("input[testTag='selectArea']", value: name).click()
    }

    //Todo make it work
    def selectSpeciesInAutocomplete(name) {
        def target = $("ul li.ui-menu-item a").find {
            return it.text() == name
        }
        return target
    }

    //Todo
    def selectFirstSpeciesInAutocomplete() {
        $("ul li.ui-menu-item").find { return it.displayed }.click()
    }

    void selectLayer(name) {
        def td = $("tr[testTag='availableLayers'] td[testTag='layerName']", text: name)
        td.siblings().children("input[type='checkbox']").click()
    }

    void selectLifeform(name) {
        $("lifeform-select select").find("option", text: name).click()
    }

    //Move to step n
    void moveToStep(n) {
        String qTag = "div[testTag='step" + n + "']"
        String q = "\$(\""+qTag+"\").get(0).scrollIntoView()"
        js.exec(q )
    }



//    @Deprecated
//    def scrollToAreaBlock() {
//        //moveToElement(addSpeciesModule.createNewAreaButton) does not work
//        //Have to run JS to scroll to this radio button and make it clickable
//        js.exec( "\$(\"input[value='Australia']\").get(0).scrollIntoView()")
//    }

    def isNextBtnEnabled() {
        return !nextBtn.is(":disabled")
    }

    //Get cell in CSV report table
    def getCellInCSVTable(int row, int col) {
      def rols =  reportCSVTable.find("tr")
      return  rols[row].find("td")[col].text()
    }

    def getSizeOfCSVTable() {
        def rols =  reportCSVTable.find("tr")
        return  rols.size()
    }


}
