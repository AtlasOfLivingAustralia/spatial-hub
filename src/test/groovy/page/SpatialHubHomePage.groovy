package page

import geb.Page

class SpatialHubHomePage extends Page {
    static at = { title == "ALA | Login" || title.startsWith("Spatial Portal") }

    static content = {
        //Shared static submodules
        authModule { module(AuthModule) }
        menuModule { module(MenuModule) }
        legendModule { module(LegendModule)}
        mapModule { module(MapModule) }
        layerListModule { module(LayerListModule) }
        modalModule { module(ModalModule) }

        //Individual module for tests
        addSpeciesModule { module(AddSpeciesModule) }
        addAreaModule { module(AddAreaModule) }
        addLayerModule { module(AddLayerModule) }
        addFacetModule { module(AddFacetModule) }
        historyModule { module(HistoryModule) }

        //Module for tools
        toolReportModule { module(ToolReportModule) }
        toolTabulateModule { module(ToolTabulateModule) }
        toolComparePointsModule { module(ToolComparePointsModule) }
    }



}

