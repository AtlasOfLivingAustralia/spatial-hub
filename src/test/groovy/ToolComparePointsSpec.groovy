import geb.spock.GebSpec
import page.SpatialHubHomePage

class ToolComparePointsSpec extends GebSpec {

    int pause = 3000

    def setup() {
        when:
        via SpatialHubHomePage

        if (title.startsWith("ALA | Login"))
            authModule.login()

        then:
        waitFor 20, { menuModule.isReady()}
    }

    def "compare points"(){
        when:
        menuModule.clickMenu("Tools ") //NOTICE: space
        menuModule.clickMenuitem("Compare Points")

        then:
        waitFor 10, { toolComparePointsModule.pointsComparisonDiv.displayed }

        when:
        toolComparePointsModule.addPoint()
        mapModule.drawPoint(0,0)

        toolComparePointsModule.addPoint()
        mapModule.drawPoint(100,100)

        then:
        waitFor 10, {toolComparePointsModule.pointsTable.displayed}
        toolComparePointsModule.countOfPoints() == 2

        when:
        toolComparePointsModule.compare()

        then:
        waitFor 20, {toolComparePointsModule.comparisonResult.displayed}

        toolComparePointsModule.getComparisonResult(0,0) == "ASGS Australian States and Territories"
        Thread.sleep(pause)

    }

}