import geb.spock.GebSpec
import org.openqa.selenium.Keys
import page.SpatialHubHomePage
import grails.testing.mixin.integration.Integration

@Integration
class AddAreaSpec extends SpatialGebSpec {

    def "Draw BBox, circle and merge areas, log check"(){
        def logCount = 0;

        //Open log history and read count if bbox
//        when:
//        menuModule.clickMenu("Add to map ") //NOTICE: space
//        menuModule.clickMenuitem("History")

//        then:
//        waitFor 10, { historyModule.title == "History"}
//        waitFor 10, { historyModule.shouldHaveLogs() }

        when:
//        logCount = historyModule.getLogCount("drawBoundingBox")
//        historyModule.close()

 //       and:
//        Thread.sleep(pause)
        menuModule.clickMenu("Add to map ")
        menuModule.clickMenuitem("Area")

        //Add BBox
        then:
        waitFor 20, { addAreaModule.title == "Add area" }
        addAreaModule.bboxRadioBtn.click()

        and:
        addAreaModule.nextBtn.click()

        then:
        addAreaModule.addAreaLegend.displayed

        when:
        mapModule.drawBBox()

        then:
        waitFor 10, { addAreaModule.newAreaWktTextarea.value()} //check wkt is filled
        addAreaModule.newAreaNameInput.value("My test area 1")
        addAreaModule.nextInNewAreaLegendBtn.click()

        then:
        waitFor 10, { layerListModule.getLayer("My test area 1").displayed }


        //Open log again
//        when:
//        menuModule.clickMenu("Add to map ")
//        menuModule.clickMenuitem("History")

//        then:
//        waitFor 10, { historyModule.title == "History"}
//        //waitFor 10, { historyModule.getLogCount("drawBoundingBox") == logCount + 1 }
//        historyModule.close()

        //Add Circle
        when:
        menuModule.clickMenu("Add to map ")
        menuModule.clickMenuitem("Area")

        then:
        waitFor 20, { addAreaModule.title == "Add area" }
        addAreaModule.circleRadioBtn.click()

        and:
        addAreaModule.nextBtn.click()

        then:
        addAreaModule.addAreaLegend.displayed

        when:
        mapModule.drawCircle()

        then:
        waitFor 10, { addAreaModule.newAreaWktTextarea.value()} //check wkt is filled
        addAreaModule.newAreaNameInput.value("My Circle")
        addAreaModule.nextInNewAreaLegendBtn.click()

        then:
        waitFor 10, { layerListModule.getLayer("My Circle").displayed }
        Thread.sleep(pause)

        //Merge
        when:
        menuModule.clickMenu("Add to map ")
        menuModule.clickMenuitem("Area")

        then:
        waitFor 20, { addAreaModule.title == "Add area" }
        addAreaModule.mergeAreaRadioBtn.click()

        and:
        addAreaModule.nextBtn.click()

        then:
        waitFor 20, { addAreaModule.title == "Merge areas" }
        addAreaModule.createdAreasCheckbox.size() >= 2

        and:
        addAreaModule.createdAreasCheckbox[0].click()
        addAreaModule.createdAreasCheckbox[1].click()
        addAreaModule.newMergedAreaName.value("my merged area")
        addAreaModule.newMergedAreaDesc.value("new merged description")
        addAreaModule.nextBtn.click()

        then:
        waitFor 100, { layerListModule.getLayer("my merged area").displayed }
        layerListModule.hideArea("My test area 1")
        layerListModule.hideArea("My Circle")
        layerListModule.zoomInArea("my merged area")
        Thread.sleep(pause)
    }

    def "Import Gazetteer"() {
        when:
        menuModule.clickMenu("Add to map ")
        menuModule.clickMenuitem("Area")

        then:
        waitFor 20, { addAreaModule.title == "Add area" }
        addAreaModule.gazRadioBtn.click()
        addAreaModule.nextBtn.click()
        waitFor 10, { addAreaModule.gazInput.displayed }

        and:
        addAreaModule.gazInput.value("Ben Lomond")

        then:
        waitFor 10, {addAreaModule.gazAutoListCheckbox("IBRA 6 Regions").displayed}
        addAreaModule.gazAutoListCheckbox("IBRA 6 Regions").click()

        waitFor 10, {addAreaModule.gazAutoList("Ben Lomond").displayed}

        when:
        //Avoid possibility of 'not clickable'
        interact {
            moveToElement(addAreaModule.gazAutoList("Ben Lomond"))
        }

        then:
        addAreaModule.gazAutoList("Ben Lomond").click()

        and:
        waitFor 10, {addAreaModule.isNextBtnEnabled()}
        addAreaModule.nextBtn.click()

        then:
        waitFor 10, { layerListModule.getLayer("Ben Lomond").displayed }

        Thread.sleep(pause)
    }

    def "Import KML"() {
        when:
        menuModule.clickMenu("Add to map ")
        menuModule.clickMenuitem("Area")

        then:
        waitFor 20, { addAreaModule.title == "Add area" }
        addAreaModule.importKmlRadioBtn.click()
        addAreaModule.nextBtn.click()
        waitFor 10, { addAreaModule.uploadFileBtn.displayed }

        when:
        addAreaModule.uploadTextFile("koppen.kml")

        then:
        waitFor 10, { layerListModule.getLayer("new area").displayed }
        Thread.sleep(pause)
    }


    def "Import SHP"(){

        when:
        menuModule.clickMenu("Add to map ")
        menuModule.clickMenuitem("Area")

        then:
        waitFor 20, { addAreaModule.title == "Add area" }
        addAreaModule.importShapefileRadioBtn.click()
        addAreaModule.nextBtn.click()
        waitFor 10, { addAreaModule.uploadFileBtn.displayed }

        when:
        addAreaModule.uploadRawFile("koppen.zip", 'application/zip')

        then:
        waitFor 10, { addAreaModule.importAreaName("koppen.zip").displayed }
        waitFor 10, { addAreaModule.newAreasInList.size() > 5}

        and:
        addAreaModule.newAreasInList[0].click()
        addAreaModule.newAreasInList[2].click()

        then:
        waitFor 10, { addAreaModule.isNextBtnEnabled() }
        addAreaModule.nextBtn.click()

        then:
        waitFor 10, {layerListModule.getLayer("koppen.zip").displayed}
        Thread.sleep(pause)

        when:
        layerListModule.deleteArea("koppen.zip")

        then:
        Thread.sleep(pause)
    }

    def "Add via WKT"(){
        String wkt = "POLYGON((0.5 0.5,5 0,5 5,0 5,0.5 0.5), (1.5 1,4 3,4 1,1.5 1))"
        String wktName = "New WKT"

        when:
        menuModule.clickMenu("Add to map ")
        menuModule.clickMenuitem("Area")

        then:
        waitFor 20, { addAreaModule.title == "Add area" }
        addAreaModule.importWktRadioBtn.click()
        addAreaModule.nextBtn.click()
        waitFor 10, { addAreaModule.wktAreaNameInput.displayed }

        and:
        addAreaModule.wktAreaNameInput.value(wktName)
        addAreaModule.wktAreaDataTextarea.value(wkt)

        then:
        waitFor 10, {addAreaModule.isNextBtnEnabled()}
        addAreaModule.nextBtn.click()

        then:
        waitFor 20, {layerListModule.getLayer(wktName).displayed}

        //click info btn
        layerListModule.displayAreaInfo(wktName)

        waitFor 30, {layerListModule.areaInfoTable().displayed}
        layerListModule.areaSize() == '309653.29'
        Thread.sleep(pause)

        when:
        //Avoid possible close btn not clickable
        interact {
            moveToElement(layerListModule.areaInfoTable())
        }

        and:
        layerListModule.closeAreaInfo()
        Thread.sleep(pause)
        interact {
            //avoid possible btn not clickable
            moveToElement(layerListModule.getLayer(wktName))
        }
        layerListModule.deleteArea(wktName)

        then:
        Thread.sleep(pause)
    }

    def "Define environmental envelope"() {
        when:
        menuModule.clickMenu("Add to map ") //NOTICE: space
        menuModule.clickMenuitem("Area")

        then:
        waitFor 20, { addAreaModule.title == "Add area" }
        addAreaModule.environmentalEnvelopeRadioBtn.click()

        and:
        addAreaModule.nextBtn.click()

        then:
        legendModule.envelopeLegend.displayed

        when:
        legendModule.searchEnvelopeLayer.value("Elevation")
        Thread.sleep(pause)
        legendModule.selectLayerInAutocomplete("Elevation")

        and:
        legendModule.nextEnvelopeBtn.click()

        then:
        waitFor 10, { modalModule.title == "Create a layer from an environmental envelope definition." }
        waitFor 120, { modalModule.openNewWindow.displayed }
        waitFor 10, { modalModule.outputDoc.displayed }

        //Need to switch iFrame before access an element in iFrame
        //driver.switchTo().frame("outputDocs")
        Thread.sleep(pause)

        modalModule.closeNewWindow.click()

        then:
        waitFor 10, { layerListModule.getLayer("Envelope (Environmental envelope)").displayed}
        Thread.sleep(pause)
    }

    def "Select area from polygonal layer"() {
        when:
        menuModule.clickMenu("Add to map ") //NOTICE: space
        menuModule.clickMenuitem("Area")

        then:
        waitFor 20, { addAreaModule.title == "Add area" }
        addAreaModule.pointOnLayerRadioBtn.click()

        and:
        addAreaModule.nextBtn.click()

        then:
        addAreaModule.addAreaLegend.displayed

        when:
        legendModule.searchLayerInput.value("ASGS Australian States and Territories")
        Thread.sleep(pause)
        legendModule.selectLayerInAutocomplete("ASGS Australian States and Territories")

        and:
        mapModule.drawPoint(100,100)
        legendModule.nextBtn.click()

        then:
        Thread.sleep(pause)
    }

}