package page
import geb.Module

class MenuModule extends Module {
    static content = {
        //First
        addToMapMenu { $("button[testTag='menu_Add to map']") }
        speciesMenuitem { $("ul li a[testTag='menuitem_Species']") }
        areaMenuitem { $("ul li a[testTag='menuitem_Area']") }
        layerMenuitem { $("ul li a[testTag='menuitem_Layer']") }
        facetMenuitem { $("ul li a[testTag='menuitem_Facet']") }
        historyMenuitem { $("ul li a[testTag='menuitem_History']") }

        //Second
    }

}
