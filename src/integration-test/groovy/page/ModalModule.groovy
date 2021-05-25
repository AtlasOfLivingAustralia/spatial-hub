package page

import geb.Module

/**
 * Modal popped up when click add facets / species / tools
 */

class ModalModule extends Module {

    static content = {
        title (required: false) { $("h4.modal-title[testTag='modalTitle']").text() }

        //species option
        //Some tools may contain multiple copy, etc scatterplot
        searchSpeciesRadioBtn (required: false) { $("input[type='radio'][value='searchSpecies']") }
        speciesTextInput (required:false) {$("input#speciesAutoComplete")}
        // species autocomplete list
        speciesAutocompleteList(required:false) {$("ul li.ui-menu-item a")}

        //others
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
        status {  $("textarea.logText").value() }

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
        closeBtn { $("button.btn",text:"Close") }
    }

    //Support: Current extent, Australia, World, and new created area
    void selectArea(name) {
        def label = $("input[testTag='selectArea']").parent("label", text: name)
        label.children("input").click()
        //$("input[testTag='selectArea']", value: name).click()
    }

    //Select first if multiple
    void selectSpeciesInAutocomplete(name) {
        $("ul li.ui-menu-item a").find("text":startsWith(name))[0].click()
    }

   //Todo
    def scrollToLayer(name) {
       // js.exec( "\$(\"li[testTag='layer-list'] span\").get(0).scrollIntoView()")
        def q = "\$(\"tr[testTag='availableLayers'] td[testTag='layerName']\").filter(function() {\n" +
                "            return \$(this).text() === \"" + name+" \";\n" +
                "        }).scrollIntoView()"
        js.exec(q)

       //return $("tr[testTag='availableLayers'] td[testTag='layerName']", text: name)
    }

    void filterLayer(name) {
        $("input[placeholder='Filter layers']").value(name)
    }


    def locateLayer(name){
        return $("tr[testTag='availableLayers'] td[testTag='layerName']", text: name)
    }

    void selectLayer(name) {
        def td = $("tr[testTag='availableLayers'] td[testTag='layerName']", text: name)
        td.siblings().children("input[type='checkbox']").click()
    }

    void selectPredefiendLayers(name) {
        def select = $("select[testTag='predefinedLayers']")
        select.find("option",text: name).click()
    }

    def sizeOfSelectedLayers() {
        $("label[testTag='countSelectedLayers']").text()
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

    //select checkbox,e.g date range
    void selectCheckbox(name) {
        $("input[type='checkbox']").siblings("span", text: name).siblings("input").click()
    }

    void setStartDate(date) {
        //$("input[type='date'][ng-model='dateStart']").value(date)
        String q = "\$(\"input[type='date'][ng-model='dateStart'\").val(\""+ date+"\")"
        js.exec(q)
    }
    void setEndDate(date) {
        String q = "\$(\"input[type='date'][ng-model='dateEnd'\").val(\""+ date+"\")"
        js.exec(q)
    }


    // Param is an input box
    void setInputParam(name, value) {
        def label = $("div[testTag='otherInput'] label", text: name)
        label.siblings("input").value(value)
    }

    // Param is a selection
    void setSelectionParam(name, value) {
        def label = $("div[testTag='otherInput'] label", text: name)
        label.siblings("select").value(value)
    }

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
