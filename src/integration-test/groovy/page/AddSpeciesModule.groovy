package page

//Extends from ModalModule
class AddSpeciesModule extends ModalModule {
    static content = {
        selectedLayerPanel (required:false){ $('input#selectedLayerName') }
    }
}
