import com.gargoylesoftware.htmlunit.javascript.host.svg.SVGPathSegArcAbs
import geb.spock.GebSpec
import page.SpatialHubHomePage

class ToolDoubleGridingSpec extends SpatialGebSpec {

    def "double griding"(){
        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Double Gridding")

        then:
        waitFor 10, { modalModule.title == "Double gridding sites by species" }

//      Create a Tas area
        when:
        modalModule.moveToStep(0)
        modalModule.defineNewAreaBtn.click()

        then:
        waitFor 20, { addAreaModule.title == "Add area" }

        addAreaModule.importWktRadioBtn.click()
        addAreaModule.nextBtn.click()
        waitFor 10, { addAreaModule.wktAreaNameInput.displayed }

        and:
        addAreaModule.wktAreaNameInput.value(wktName)
        addAreaModule.wktAreaDataTextarea.value(wkt4Tas)

        then:
        waitFor 10, {addAreaModule.isNextBtnEnabled()}
        addAreaModule.nextBtn.click()

        then:
        waitFor 20, {layerListModule.getLayer(wktName).displayed}


        then:
        waitFor 30, { layerListModule.getLayer("Tasmania").displayed }
//      End of a Tas area creation

        then:
        waitFor 5, { modalModule.title == "Double gridding sites by species"  }

        when:
        modalModule.moveToStep(1)

        then:
        //This tool has multiple species selection
        modalModule.speciesTextInput[0].click()
        modalModule.speciesTextInput[0].value("Eucalyptus gunnii")

        waitFor 10, {modalModule.speciesAutocompleteList.first().text().contains("Eucalyptus gunnii")}

        when:
        modalModule.selectSpeciesInAutocomplete("Eucalyptus gunnii")
        modalModule.moveToStep(2)

        and:
        modalModule.nextBtn.click()

        then:
        waitFor 10, { modalModule.title == "Double gridding sites by species" }

        waitFor 200, { modalModule.openNewWindow.displayed }
        waitFor 10, { modalModule.outputDoc.displayed }
        Thread.sleep(pause)
        modalModule.closeBtn.click()
        //Need to switch iFrame before access an element in iFrame
        //driver.switchTo().frame("outputDocs")
    }

}