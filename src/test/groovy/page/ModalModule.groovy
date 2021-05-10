package page

import geb.Module

/**
 * Modal popped up when click add facets / species / tools
 */

class ModalModule extends Module {

    static content = {
        title { $("h4.modal-title[testTag='modalTitle']").text() }

        //species
        speciesTextInput (required:false) {$("input#speciesAutoComplete")}
        // species autocomplete list
        speciesAutocompleteList(required:false) {$("li.ui-menu-item a")}


        //areas
        //australiaRadioInput(required:false) {$("input[value='Australia']")}
        defineNewAreaBtn(required:false) { $("button[testTag='createArea']") }

        //facets
        facetSelection(required:false) {$("select#facet[ng-model='facet']")}
        facetSelectionOptions(required:false) {$("select#facet[ng-model='facet'] option")}

        //Shared the modal buttons
        nextBtn { $("button[name='next']") }
        cancelBtn { $("button[name='cancel']") }
    }

    //Support: Current extent, Australia, World
    def selectArea(name){
        $("input[testTag='selectArea']", value: name).click()
    }

    def scrollToAreaBlock(){
        //moveToElement(addSpeciesModule.createNewAreaButton) does not work
        //Have to run JS to scroll to this radio button and make it clickable
        js.exec( "\$(\"input[value='Australia']\").get(0).scrollIntoView()")
    }

    def isNextBtnEnabled() {
        return !nextBtn.is(":disabled")
    }



}
