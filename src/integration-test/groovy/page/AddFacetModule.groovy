package page

class AddFacetModule extends ModalModule {

    static content = {
        facetModule { module(FacetSubmodule) }
    }

}
