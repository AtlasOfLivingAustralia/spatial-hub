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


    //Move to step n
    void moveToStep(n) {
        String qTag = "div[testTag='step" + n + "']"
        String q = "\$(\""+qTag+"\").get(0).scrollIntoView()"
        js.exec(q )
    }

    void selectLayer(name) {
        def td = $("tr[testTag='availableLayers'] td[testTag='layerName']", text: name)
        td.siblings().children("input[type='checkbox']").click()
    }

    @Deprecated
    def scrollToAreaBlock() {
        //moveToElement(addSpeciesModule.createNewAreaButton) does not work
        //Have to run JS to scroll to this radio button and make it clickable
        js.exec( "\$(\"input[value='Australia']\").get(0).scrollIntoView()")
    }

    def isNextBtnEnabled() {
        return !nextBtn.is(":disabled")
    }



}
