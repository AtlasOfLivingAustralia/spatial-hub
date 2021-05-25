

import geb.spock.GebSpec
import page.SpatialHubHomePage

class ToolReportSpec extends GebSpec {

    int pause = 3000

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady()}

    }

//    def "interactive report - Australia"(){
//        when:
//        menuModule.clickMenu("Tools ") //NOTICE: space
//        menuModule.clickMenuitem("Area Report - interactive")
//
//        then:
//        waitFor 10, { toolReportModule.title == "Area Report" }
//
//        when:
//        toolReportModule.selectArea("Australia")
//        toolReportModule.nextBtn.click()
//
//        then:
//        waitFor 5, {toolReportModule.reportName == "Area report - Australia" }
//        waitFor 10, { toolReportModule.getCount("Area (sq km)") >= 16322156 }
//        Thread.sleep(pause)
//
//        and:
//        toolReportModule.close()
//    }

    def "interactive report - TAS"() {
        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Area Report - interactive")

        then:
        waitFor 10, { toolReportModule.title == "Area Report" }

        when:
        toolReportModule.defineNewAreaBtn.click()

        then:
        waitFor 20, { addAreaModule.title == "Add area" }
        addAreaModule.gazRadioBtn.click()
        addAreaModule.nextBtn.click()
        waitFor 10, { addAreaModule.gazInput.displayed }

        and:
        addAreaModule.gazInput.value("Tasmania")

        then:
        waitFor 10, {addAreaModule.gazAutoList("Tasmania").displayed}
        addAreaModule.gazAutoList("Tasmania").click()

        and:
        addAreaModule.nextBtn.click()

        then:
        waitFor 10, { layerListModule.getLayer("Tasmania").displayed }
        addAreaModule.nextBtn.click()

        //Add area completed
        then:
        waitFor 5, {toolReportModule.reportName == "Area report - Tasmania" }

        waitFor 10, { toolReportModule.getCount("Area (sq km)") >=  354347}
        waitFor 10, { toolReportModule.getCount("Number of species") >= 20000 }
        waitFor 10, { toolReportModule.getCount("Occurrences") >= 2000000 }
        waitFor 10, { toolReportModule.getCount("Invasive Species") >= 1000 }

        and:
        Thread.sleep(pause)
        toolReportModule.close()
    }

}