package page
import geb.Module
/**
 * 2-D Tabulation
 */

class ToolComparePointsModule extends Module {

    static content = {
        pointsComparisonDiv (required:false){ $("div[name='pointComparison']") }
        pointsTable (required: false) { $("table[testTag='drawedPoints']") }
        comparisonResult (required: false) { $("table[testTag='comparisonResult']") }
    }

    void addPoint() {
        //Why need prefix 'this'
        this.pointsComparisonDiv.find("button.btn", text:'Add point').click()
    }

    void compare() {
        this.pointsComparisonDiv.find("button.btn", text:'Compare').click()
    }

    int countOfPoints() {
        return this.pointsTable.find("tbody tr").size()
    }

    String getComparisonResult(int col, int row) {
        def records = comparisonResult.find("tbody tr")
        return records[row].find("td")[col].text()
    }

}
