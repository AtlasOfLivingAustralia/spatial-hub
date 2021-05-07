package page

/**
 * The panel shown up on the TOP LEFT panel
 * It lists all created layers etc.
 *
 */
class LayerListModule extends ModalModule {

    static content = {
        layerList  { $("li[testTag='layer-list']") }
    }
    /**
     * Find the layer by a given name
     * @param name
     * @return
     */
    def getLayer(name) {
        return $("li[testTag='layer-list'] span" , text : name ).parent()
    }
    def scrollToNewCreatedLayer() {
        js.exec( "\$(\"li[testTag='layer-list'] span\").get(0).scrollIntoView()")
    }

    // Icons in List

    def hideArea(name) {
        def li = getLayer(name)
        li.children("input[type='checkbox']").click()
    }
    def zoomInArea(name) {
        def li = getLayer(name)
        li.children("i.glyphicon-zoom-in").click()
    }

    def deleteArea(name) {
        def li = getLayer(name)
        li.children("i.glyphicon-trash").click()
    }
    def displayAreaInfo(name) {
        def li = getLayer(name)
        li.children("i.glyphicon-info-sign").click()
    }

    def closeAreaInfo(){
        $("button.bootbox-close-button.close").click()
    }

    def areaInfoTable() {
        return $("table[testTag='displayAreaInfo']")
    }

    def areaSize() {
        return $("table[testTag='displayAreaInfo'] tbody tr td[testTag='areaSize']").text()
    }

}
