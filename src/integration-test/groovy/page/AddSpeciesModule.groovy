package page

//Extends from ModalModule
class AddSpeciesModule extends ModalModule {
    static content = {
        selectedLayerPanel (required:false){ $('input#selectedLayerName') }
        //Input species list
        speciesListForm (required:false){ $('h4[name=createSpeciesList]') }
        speciesListInput(required:false){ $('textarea[name=speciesInput]') }
        parseSpeciesListBtn(required:false){ $('button[name=parseSpeciesList]') }
        speciesListTable(required:false){ $('table[name=speciesList]') }
        newListNameInput(required:false){ $('input[name=newListName]') }

        chooseListInputOption(required:false){ $('input[value="speciesList"]') }
        searchInSpeciesListInput(required:false){ $('input[name="searchInSpeciesList"]') }
    }

    /**
     * findSpeciesInTable("Eucalyptus Gunnii", 1)
     * @param name
     * @param col
     * @return
     */
    def findSpeciesInTable(String name, int col) {
        def rols =  speciesListTable.find("tr td", text: name).parent()
        return  rols.find("td")[col]
    }

    def isAuthoritative(String name, int col) {
        def rols =  speciesListTable.find("tr td", text: name).parent()
        return  rols.find("td")[col].has("span[title='Authoritative list']").size() == 1
    }

    /**
     * Select/deselect the species.
     * @param name
     * @param col of checkbox
     * @return
     */
    def selectSpeciesInTable(String name, int col) {
        def rols =  speciesListTable.find("tr td", text: name).parent()
        return  rols.find("td")[col].click()
    }
}
