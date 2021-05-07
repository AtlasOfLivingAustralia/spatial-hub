package page

import geb.Page

class SpatialHubHomePage extends Page {
    //static url = "https://spatial-test.ala.org.au";
    static url = "http://devt.ala.org.au:8087";
    // login or after-login page
    static at = { title == "ALA | Login" || title.startsWith("Spatial Portal") }

    static content = {
        //Shared static submodules
        authModule { module(AuthModule) }
        menuModule { module(MenuModule) }
        legendModule { module(LegendModule)}
        mapModule { module(MapModule) }
        layerListModule { module(LayerListModule) }

        //Individual module for tests
        addSpeciesModule { module(AddSpeciesModule) }
        addAreaModule { module(AddAreaModule) }
        addLayerModule { module(AddLayerModule) }
        addFacetModule { module(AddFacetModule) }
        historyModule { module(HistoryModule) }

    }



}

