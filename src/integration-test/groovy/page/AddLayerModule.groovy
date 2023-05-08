package page

class AddLayerModule extends ModalModule {

    static content = {
        layersTable { $("Table#layersList") }
        availableLayers { $("Table#layersList tbody tr[testTag='availableLayers']") }
    }

    def clickLayer(name) {
        def layer =  $("Table#layersList tbody tr[testTag='availableLayers'] td[testTag='layerName']", text : name).parent()
        layer.children().first().children("input").click()
    }
}
